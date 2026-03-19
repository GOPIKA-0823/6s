import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, updateOrderStatus } from '../../services/api';

/**
 * Address Selection Page
 * 
 * Features:
 * - Select from saved addresses (Default: Hema)
 * - Add new address UI mockup
 * - Pincode check mockup
 */
const AddressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state?.request;
  const mode = location.state?.mode || 'delivery'; // 'delivery' or 'pickup'
  const isPickup = mode === 'pickup';
  const order = location.state?.order; // Required if mode is pickup

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [pincodeDetails, setPincodeDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Geolocation and Search State
  const [isLocating, setIsLocating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Empty form for new address
  const emptyForm = {
    name: '',
    pincode: '',
    type: 'HOME',
    address: '',
    mobile: ''
  };

  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAddresses();
      setSavedAddresses(res.data);
      if (res.data.length > 0) {
        // Select default address if exists, otherwise first one
        const defaultAddr = res.data.find(a => a.isDefault);
        setSelectedAddress(defaultAddr ? defaultAddr._id : res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  if (!request && !isPickup) {
    navigate('/retailer/my-requests');
    return null;
  }
  
  if (isPickup && !order) {
    navigate('/retailer/orders');
    return null;
  }

  const handleEditClick = (addr) => {
    setEditFormData({ ...addr });
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleAddNewClick = () => {
    setEditFormData({ ...emptyForm });
    setIsAddingNew(true);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setEditFormData(prev => ({ ...prev, type }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Explicitly reject saving an address that isn't from Tamil Nadu based on India Post API
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${editFormData.pincode}`);
        const postData = await postRes.json();
        if (postData && postData[0] && postData[0].Status === 'Success') {
          const state = postData[0].PostOffice[0].State;
          if (state !== 'Tamil Nadu') {
            alert(`Error: Cannot save address. We currently only support deliveries to Tamil Nadu. (Detected State: ${state})`);
            setLoading(false);
            return;
          }
        } else {
          alert('Error: Please enter a valid 6-digit Pincode.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Cannot validate state', err);
      }

      if (isAddingNew) {
        await addAddress({ ...editFormData, isDefault: savedAddresses.length === 0 });
      } else {
        await updateAddress(editFormData._id, editFormData);
      }
      await fetchAddresses();
      setIsEditing(false);
      setIsAddingNew(false);
      setEditFormData(null);
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      await deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus('error');
      setPincodeMessage('Please enter a valid 6-digit pincode');
      return;
    }

    setPincodeStatus('loading');
    setPincodeMessage('');
    setPincodeDetails(null);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District;
        const state = postOffice.State;
        const cityLower = city ? city.toLowerCase() : '';

        // Restrict delivery strictly to Tamil Nadu
        if (state !== 'Tamil Nadu') {
          setPincodeStatus('error');
          setPincodeMessage(`❌ Cannot deliver to this address (${city}, ${state}). Currently, we only service Tamil Nadu.`);
          return;
        }

        let etaString = 'within 1 day';

        // Karur and nearby districts in TN
        const nearbyDistricts = ['erode', 'namakkal', 'tiruppur', 'tiruchirappalli', 'trichy', 'dindigul', 'salem', 'coimbatore'];

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json`);
          const geoData = await geoRes.json();

          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            const KARUR_LAT = 10.9596;
            const KARUR_LON = 78.0766;

            const R = 6371;
            const dLat = (lat - KARUR_LAT) * (Math.PI / 180);
            const dLon = (lon - KARUR_LON) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(KARUR_LAT * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (cityLower.includes('karur') || distance <= 20) {
              etaString = 'within 2 hours';
            } else if (nearbyDistricts.some(d => cityLower.includes(d))) {
              etaString = '2-4 hours (Ultra-fast Delivery)';
            } else if (distance <= 50) {
              etaString = '4-6 hours (Same Day Delivery)';
            } else if (distance <= 150) {
              etaString = 'within 1 day';
            } else if (distance <= 400) {
              etaString = state === 'Tamil Nadu' ? 'within 1 day' : '1-2 days';
            } else {
              etaString = state === 'Tamil Nadu' ? 'within 1 day' : '2-5 days';
            }
          } else {
            // Fallback purely based on city string if Geocoding fails
            if (cityLower.includes('karur')) {
              etaString = 'within 2 hours';
            } else if (nearbyDistricts.some(d => cityLower.includes(d))) {
              etaString = '2-4 hours (Ultra-fast Delivery)';
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        }

        setPincodeStatus('success');
        setPincodeMessage(`✅ Delivery available to ${postOffice.Name}, ${city}, ${state}`);
        setPincodeDetails({
          city: city,
          state: state,
          eta: `Delivery ETA: ${etaString}`
        });
      } else {
        setPincodeStatus('error');
        setPincodeMessage('❌ Sorry, delivery is not available for this pincode or it is invalid.');
      }
    } catch (err) {
      console.error('Pincode check error:', err);
      setPincodeStatus('error');
      setPincodeMessage('Error verifying pincode. Please try again later.');
    }
  };

  const getAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&region=IN&key=AIzaSyAs_BpGPU-OGdMOYHjs6YYLaS3M_cN47Ug`
      );

      const data = await res.json();

      if (data.status !== "OK") {
        throw new Error("Geocoding failed");
      }

      const result = data.results[0];
      console.log(result);

      // Extract state
      const components = result.address_components;

      let state = "";
      let city = "";
      let pincode = "";

      components.forEach((c) => {
        if (c.types.includes("administrative_area_level_1")) {
          state = c.long_name;
        }
        if (c.types.includes("locality")) {
          city = c.long_name;
        }
        if (c.types.includes("postal_code")) {
          pincode = c.long_name;
        }
      });

      if (state !== "Tamil Nadu") {
        setPincodeStatus('error');
        setPincodeMessage("❌ We do not deliver outside Tamil Nadu");
        setIsLocating(false);
        return;
      }

      setEditFormData({
        ...emptyForm,
        pincode: pincode,
        address: result.formatted_address || `${city}, ${state} ${pincode}`
      });
      setIsAddingNew(true);
      setIsEditing(false);
      setPincode(pincode);

      // Calculate ETA
      const KARUR_LAT = 10.9596;
      const KARUR_LON = 78.0766;
      const cityLower = city ? city.toLowerCase() : '';
      const nearbyDistricts = ['erode', 'namakkal', 'tiruppur', 'tiruchirappalli', 'trichy', 'dindigul', 'salem', 'coimbatore'];

      const R = 6371;
      const dLat = (lat - KARUR_LAT) * (Math.PI / 180);
      const dLon = (lng - KARUR_LON) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(KARUR_LAT * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      let etaString = 'within 1 day';
      if (cityLower.includes('karur') || distance <= 20) {
        etaString = 'within 2 hours';
      } else if (nearbyDistricts.some(d => cityLower.includes(d))) {
        etaString = '2-4 hours (Ultra-fast Delivery)';
      } else if (distance <= 50) {
        etaString = '4-6 hours (Same Day Delivery)';
      }

      setPincodeStatus('success');
      setPincodeMessage(`✅ Delivery available to ${city}, ${state}`);
      setPincodeDetails({
        city: city,
        state: state,
        eta: `Delivery ETA: ${etaString}`
      });

    } catch (err) {
      console.error("getAddress error:", err);
      setPincodeStatus('error');
      setPincodeMessage(`❌ Geocoding error: ${err.message || 'Unknown error'}. Please search manually.`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setPincodeStatus('error');
      setPincodeMessage("❌ Unable to fetch correct location, please try again or search manually");
      return;
    }

    setIsLocating(true);
    setPincodeStatus('loading');
    setPincodeMessage('');
    setPincodeDetails(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("Lat:", lat, "Lng:", lng);
        await getAddress(lat, lng);
      },
      (error) => {
        console.error("getCurrentPosition error:", error);
        setPincodeStatus('error');
        setPincodeMessage(`❌ Location error: ${error.message} (Code: ${error.code}).`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search locations.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const fullAddr = result.display_name;
    const match = fullAddr.match(/\b\d{6}\b/);
    const zip = match ? match[0] : '';

    // Explicitly check for Tamil Nadu in the display name
    if (!fullAddr.toLowerCase().includes('tamil nadu')) {
      setPincodeStatus('error');
      setPincodeMessage(`❌ Cannot deliver to this address (${fullAddr}). Currently, we only service Tamil Nadu.`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    setEditFormData({
      ...emptyForm,
      pincode: zip,
      address: fullAddr
    });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsAddingNew(true);
    setIsEditing(false);
  };

  const handleSelectAddress = async () => {
    const address = savedAddresses.find(a => a._id === selectedAddress);
    if (!address) return;
    const fullAddressString = `${address.name}, ${address.address}, ${address.pincode}, Mob: ${address.mobile}`;

    if (isPickup) {
       try {
         setLoading(true);
         const reason = location.state?.returnReason || 'Not specified';
         const comments = location.state?.returnComments ? ` | Comments: ${location.state.returnComments}` : '';
         const payload = {
           newStatus: 'returned',
           notes: `Return Requested. Reason: ${reason}${comments} | Pickup via: ${fullAddressString}`
         };
         console.log('--- RETURN DEBUG ---');
         console.log('Order ID:', order._id);
         console.log('Payload:', payload);
         console.log('--------------------');
         await updateOrderStatus(order._id, payload);
         navigate('/retailer/return-success', { state: { order } });
       } catch (err) {
         console.error('Error handling return:', err);
         alert('Failed to initiate return. Please try again.');
         setLoading(false);
       }
    } else {
      // Navigate to payment with both request and address data for new orders
      navigate('/retailer/payment', {
        state: {
          request,
          address: fullAddressString
        }
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
           {isPickup ? 'Select Pickup Location' : 'Select Delivery Location'}
        </h1>
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-400">&times;</button>
      </div>

      {/* Pincode Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value);
            setPincodeStatus(null);
            setPincodeMessage('');
          }}
          className={`w-full px-4 py-4 border ${pincodeStatus === 'error' ? 'border-red-500' : pincodeStatus === 'success' ? 'border-green-500' : 'border-gray-200'} rounded-lg outline-none focus:ring-1 focus:ring-primary-500 transition-colors`}
        />
        <button
          onClick={handleCheckPincode}
          disabled={pincodeStatus === 'loading'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 font-bold text-sm disabled:opacity-50"
        >
          {pincodeStatus === 'loading' ? 'Checking...' : 'Check Pincode'}
        </button>
      </div>

      {/* Pincode Status Display */}
      {pincodeMessage && (
        <div className={`p-4 rounded-lg mt-4 text-sm font-medium ${pincodeStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50/50 text-red-600 border border-red-200'}`}>
          <div className="flex items-start gap-2">
            {pincodeStatus === 'error' && (
              <span className="text-red-500 font-bold text-lg leading-none">✖</span>
            )}
            <div>
              <p>{pincodeMessage.replace('❌ ', '')}</p>
              {pincodeDetails && (
                <p className="mt-1 text-xs text-gray-600 font-bold">{pincodeDetails.eta}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Location */}
      <div className="space-y-4">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-3 text-primary-600 font-bold text-sm w-full hover:underline"
        >
          <span className="text-xl">📍</span> Search Location &gt;
        </button>
      </div>

      {/* Location Search Bar */}
      {showSearch && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-fade-in">
          <form onSubmit={handleSearchLocation} className="flex gap-2">
            <input
              type="text"
              placeholder="Search area, city, or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
            >
              {isSearching ? 'Search...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {searchResults.map((result, idx) => (
                <div
                  key={result.place_id || idx}
                  onClick={() => handleSelectSearchResult(result)}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <p className="text-gray-800">{result.display_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 py-2 text-gray-400">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="font-bold">Or</span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Select Saved Address</h2>
        <button
          onClick={handleAddNewClick}
          className="text-primary-600 font-bold text-sm hover:underline"
        >
          Add New &gt;
        </button>
      </div>

      {loading && !isEditing && !isAddingNew ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading addresses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold">
          {error}
        </div>
      ) : (
        <>
          {/* Add New Address Form (Rendered at top of list) */}
          {isAddingNew && (
            <div className="relative p-6 rounded-2xl border-2 border-primary-100 bg-white">
              <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Add New Address</h3>
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Name</label>
                    <input
                      name="name"
                      required
                      value={editFormData.name}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                    <input
                      name="pincode"
                      required
                      value={editFormData.pincode}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Address Details (House No, Street, City)</label>
                  <textarea
                    name="address"
                    required
                    value={editFormData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 text-sm bg-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Address Type</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleTypeChange('HOME')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'HOME' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>HOME</button>
                      <button type="button" onClick={() => handleTypeChange('OFFICE')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'OFFICE' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>OFFICE</button>
                      <button type="button" onClick={() => handleTypeChange('OTHER')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'OTHER' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>OTHER</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</label>
                    <input
                      name="mobile"
                      required
                      value={editFormData.mobile}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-8 py-2 rounded-lg font-bold text-sm shadow-md"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingNew(false); setEditFormData(null); }}
                    className="bg-gray-100 text-gray-600 px-8 py-2 rounded-lg font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address Card List */}
          <div className="space-y-4">
            {savedAddresses.map((addr) => (
              <div
                key={addr._id}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedAddress === addr._id ? 'border-primary-100 bg-primary-20/30' : 'border-gray-50 bg-white'
                  }`}
                onClick={() => !isEditing && !isAddingNew && setSelectedAddress(addr._id)}
              >
                {selectedAddress === addr._id && !isEditing && (
                  <div className="absolute top-4 left-6">
                    <span className="bg-primary-100 text-primary-700 text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">
                      Currently Selected
                    </span>
                  </div>
                )}

                {isEditing && editFormData?._id === addr._id ? (
                  /* Edit Form */
                  <form onSubmit={handleSaveAddress} className="mt-8 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Name</label>
                        <input
                          name="name"
                          required
                          value={editFormData.name}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                        <input
                          name="pincode"
                          required
                          value={editFormData.pincode}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Address Details (House No, Street, City)</label>
                      <textarea
                        name="address"
                        required
                        value={editFormData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 text-sm bg-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Address Type</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleTypeChange('HOME')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'HOME' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>HOME</button>
                          <button type="button" onClick={() => handleTypeChange('OFFICE')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'OFFICE' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>OFFICE</button>
                          <button type="button" onClick={() => handleTypeChange('OTHER')} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${editFormData.type === 'OTHER' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500'}`}>OTHER</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</label>
                        <input
                          name="mobile"
                          required
                          value={editFormData.mobile}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary-500 font-bold bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="bg-primary-600 text-white px-8 py-2 rounded-lg font-bold text-sm shadow-md"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-100 text-gray-600 px-8 py-2 rounded-lg font-bold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Static Display */
                  <div className="mt-8 flex gap-3">
                    <div className="text-xl text-gray-800">📍</div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-800">{addr.name} , {addr.pincode}</h3>
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-3 py-0.5 rounded uppercase">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                        {addr.address}
                      </p>
                      <p className="font-bold text-gray-800 mt-4 text-sm">
                        Mob: {addr.mobile}
                      </p>

                      <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAddress();
                            }}
                            className="bg-white border-2 border-gray-100 px-8 py-3 rounded-xl text-gray-400 font-bold text-sm hover:border-primary-500 hover:text-primary-600 transition-all"
                          >
                            {isPickup ? 'Pickup Here' : 'Deliver Here'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(addr);
                            }}
                            className="font-black text-gray-800 text-sm italic underline underline-offset-4"
                          >
                            Edit
                          </button>
                        </div>
                        <button
                          onClick={(e) => handleDeleteAddress(addr._id, e)}
                          className="font-black text-red-500 text-sm italic underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === addr._id ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200'}`}>
                        {selectedAddress === addr._id && <span>✓</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add New Address Button (if list empty or button clicked manually) */}
      {!isAddingNew && (
        <button
          onClick={handleAddNewClick}
          className="w-full py-4 mt-8 border-2 border-gray-100 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl">+</span> Add New Address
        </button>
      )}
    </div>
  );
};

export default AddressPage;
