import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRetailerOrders } from '../../services/api';
import html2pdf from 'html2pdf.js';

/**
 * Retailer Bills Page - Professional Invoice Layout (Green Theme)
 * 
 * Features:
 * - Specific Agaram Agencies branding and details.
 * - Green-themed "INVOICE" layout with QTY/DESCRIPTION/UNIT COST/TOTAL.
 * - Separate bills for each product.
 */
const RetailerBills = () => {
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Helper to transform orders into separate product invoices
  const processOrdersToInvoices = (orders) => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    
    // Mock for demo
    const demoOrder = {
        _id: '2026-001',
        status: 'delivered',
        createdAt: new Date('2026-03-07'),
        manufacturerName: 'Healthy Harvests',
        manufacturerAddress: '123 Green Valley, Coimbatore',
        retailerName: 'CBA Retailers',
        retailerAddress: '789 Market Road, Karur',
        items: [
            { name: 'Organic Honey', quantity: 2, price: 250 },
            { name: 'Rice Bag 25kg', quantity: 10, price: 1200 }
        ],
        paymentMethod: 'UPI'
    };

    const sourceData = deliveredOrders.length > 0 ? deliveredOrders : [demoOrder];

    const flatInvoices = [];
    sourceData.forEach((order) => {
      order.items?.forEach((item, index) => {
        flatInvoices.push({
          id: `${order._id}_${index}`,
          invoiceNo: `AG${order._id || '2026-001'}-${index + 1}`,
          date: '07-03-2026',
          customer: order.retailerName || 'CBA',
          customerAddress: order.retailerAddress || 'Retailer Address Line 1',
          manufacturer: order.manufacturerName || 'Manufacturer Company',
          manufacturerAddress: order.manufacturerAddress || 'Manufacturer Address Line 1',
          item: item,
          totalAmount: item.total || (item.quantity * (item.price || item.unitPrice)),
          paymentMethod: order.paymentMethod || 'COD',
          status: 'Delivered'
        });
      });
    });

    return flatInvoices;
  };

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        setLoading(true);
        const response = await getRetailerOrders();
        const processed = processOrdersToInvoices(response.data);
        setInvoices(processed);

        if (location.state?.order) {
            const firstOfOrder = processed.find(inv => inv.id.startsWith(location.state.order._id));
            if (firstOfOrder) {
                setSelectedInvoice(firstOfOrder);
            }
        }
      } catch (err) {
        console.error('Error in Bills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcess();
  }, [location.state]);

  const handlePrint = () => {
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin: 0,
      filename: `Invoice_${selectedInvoice.invoiceNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // New Promise-based usage
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500">Generating Agaram Invoices...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {selectedInvoice ? (
        /* Detailed Invoice View */
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center no-print">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="text-gray-500 hover:text-green-800 font-bold flex items-center gap-2"
            >
              ← Back to all bills
            </button>
            <button 
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2"
            >
              📥 Download Invoice (PDF)
            </button>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-2xl border border-gray-200 print:shadow-none print:border-none relative mx-auto w-full md:w-[210mm] print:w-[210mm]" id="printable-invoice">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page { 
                  size: A4; 
                  margin: 0mm; 
                }
                html, body {
                  height: 297mm;
                  width: 210mm;
                }
                body * { 
                  visibility: hidden; 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important;
                }
                #printable-invoice, #printable-invoice * { 
                  visibility: visible; 
                }
                #printable-invoice { 
                  position: fixed; 
                  left: 0; 
                  top: 0; 
                  width: 210mm; 
                  height: 297mm; 
                  padding: 15mm !important;
                  margin: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  box-sizing: border-box;
                  background-color: white !important;
                }
                .no-print { display: none !important; }
              }
            `}} />
            
            {/* Header Section */}
            <div className="grid grid-cols-2 gap-8 mb-12 items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-green-700 uppercase tracking-tighter">Agaram Agencies</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Food & Beverages Wholesale Distributor</p>
                <div className="text-[11px] text-gray-500 space-y-1 mt-4 leading-tight">
                  <p>4/168B, Amman Nagar, T.Selandipalayam</p>
                  <p>Theranakalpatti (PO), Tirumanilaiyur</p>
                  <p>Karur – 638003</p>
                  <div className="pt-2">
                    <p><span className="font-black text-gray-700">Phone:</span> 9944632090</p>
                    <p><span className="font-black text-gray-700">Email:</span> agaramagencies29042024@gmail.com</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <h2 className="text-6xl font-black text-green-600/10 uppercase tracking-tighter leading-none mb-6">INVOICE</h2>
                <div className="space-y-1 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <p className="text-[10px] font-black text-green-800 uppercase tracking-widest">Invoice Details</p>
                    <p className="text-sm font-bold text-gray-700">No: <span className="font-normal text-gray-500">{selectedInvoice.invoiceNo}</span></p>
                    <p className="text-sm font-bold text-gray-700">Date: <span className="font-normal text-gray-500">{selectedInvoice.date}</span></p>
                </div>
              </div>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-2 gap-0 mb-12 border border-green-200">
               <div className="border-r border-green-200">
                  <div className="bg-green-600 text-white px-4 py-1 text-xs font-black uppercase tracking-widest">From (Manufacturer)</div>
                  <div className="p-4 space-y-1">
                     <p className="font-bold text-gray-800 text-sm italic">{selectedInvoice.manufacturer}</p>
                     <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{selectedInvoice.manufacturerAddress}</p>
                  </div>
               </div>
               <div>
                  <div className="bg-green-600 text-white px-4 py-1 text-xs font-black uppercase tracking-widest">Ship To (Retailer)</div>
                  <div className="p-4 space-y-1">
                     <p className="font-bold text-gray-800 text-sm italic">{selectedInvoice.customer}</p>
                     <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{selectedInvoice.customerAddress}</p>
                  </div>
               </div>
            </div>

            {/* Product Table */}
            <div className="mb-12">
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="bg-green-600 text-white text-[10px]">
                        <th className="py-2 px-4 text-left font-black uppercase tracking-widest w-12 border-r border-green-400">SNO</th>
                        <th className="py-2 px-4 text-left font-black uppercase tracking-widest border-r border-green-400">DESCRIPTION</th>
                        <th className="py-2 px-4 text-center font-black uppercase tracking-widest w-20 border-r border-green-400">QTY</th>
                        <th className="py-2 px-4 text-right font-black uppercase tracking-widest w-30 border-r border-green-400">UNIT COST</th>
                        <th className="py-2 px-4 text-right font-black uppercase tracking-widest w-32">TOTAL</th>
                     </tr>
                  </thead>
                  <tbody>
                     {/* Data Row */}
                     <tr className="border-b border-green-100 bg-green-50/30">
                        <td className="py-4 px-4 text-left font-bold text-gray-700 border-r border-green-100">1</td>
                        <td className="py-4 px-4 text-left font-bold text-gray-700 border-r border-green-100">{selectedInvoice.item.name}</td>
                        <td className="py-4 px-4 text-center font-bold text-gray-700 border-r border-green-100">{selectedInvoice.item.quantity}</td>
                        <td className="py-4 px-4 text-right font-medium text-gray-600 border-r border-green-100">₹{(selectedInvoice.item.price || selectedInvoice.item.unitPrice)}</td>
                        <td className="py-4 px-4 text-right font-black text-gray-900 italic">₹{selectedInvoice.totalAmount}</td>
                     </tr>
                     {/* Filler Rows for Authentic Look */}
                     {[...Array(6)].map((_, i) => (
                        <tr key={i} className={`border-b border-green-50 h-10 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50/10'}`}>
                           <td className="border-r border-green-50 px-4 text-gray-100 text-[10px]">{i + 2}</td>
                           <td className="border-r border-green-50"></td>
                           <td className="border-r border-green-50"></td>
                           <td className="border-r border-green-50"></td>
                           <td></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Total Section */}
            <div className="flex justify-end mt-12 pt-8">
               <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                     <span>SUB TOTAL</span>
                     <span className="text-gray-600">₹{selectedInvoice.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                     <span>TAX (0%)</span>
                     <span className="text-gray-600">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black text-gray-900 border-t-4 border-green-600 pt-4 mt-2 px-1">
                     <span className="tracking-tighter">TOTAL</span>
                     <span className="text-3xl">₹{selectedInvoice.totalAmount}</span>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="mt-20 text-center border-t border-green-100 pt-8">
               <p className="text-green-700 font-bold italic text-sm">It has been a pleasure doing business with you.</p>
               <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-black opacity-30">Agaram Agencies Official Invoice</p>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-end border-b-2 border-green-600 pb-4">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Agency Bills</h1>
                <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">Agaram Financial Dashboard</p>
            </div>
            <div className="bg-green-600 text-white px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-green-100">
              {invoices.length} ACTIVE BILLS
            </div>
          </div>

          <div className="grid gap-6">
            {invoices.map(invoice => (
              <div 
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 hover:shadow-xl hover:border-green-100 transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-600 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600 transition-colors shadow-inner font-bold text-green-200 group-hover:text-white">
                      📄
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-green-600 transition-colors">{invoice.invoiceNo}</h3>
                    <p className="text-sm text-gray-700 font-bold mt-1">{invoice.item.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{invoice.date}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black text-gray-900">₹{invoice.totalAmount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all font-bold">›</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerBills;