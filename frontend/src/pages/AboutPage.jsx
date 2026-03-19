const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Agaram Agency</h1>
          <p className="text-xl text-primary-100">Your Trusted Partner in Wholesale Trade</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Who We Are */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">1</span>
            Who We Are
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Agaram Agency is a pioneering dealership and intermediary company that specializes in connecting manufacturers 
              with retail shops across the region. We act as a digital bridge in the wholesale trade ecosystem, facilitating 
              seamless transactions and building strong relationships between producers and retailers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              As a trusted intermediary, we understand the unique challenges faced by both manufacturers looking to expand 
              their market reach and retail shops seeking reliable suppliers. Our platform eliminates traditional barriers, 
              enabling direct communication, transparent transactions, and efficient supply chain management.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">2</span>
            What We Do
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Procurement Facilitation</h3>
              <p className="text-gray-700">
                We streamline the procurement process by connecting retail shops with verified manufacturers, 
                making it easy to find and source products.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Listing</h3>
              <p className="text-gray-700">
                Manufacturers can list their complete product catalogs on our platform, making them 
                discoverable by retail shops nationwide.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Requests</h3>
              <p className="text-gray-700">
                Retail shops can send product requests directly to manufacturers, specifying quantities 
                and requirements with ease.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Facilitation</h3>
              <p className="text-gray-700">
                We facilitate the entire order lifecycle, from request to fulfillment, ensuring smooth 
                communication between parties.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-4 md:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Records</h3>
              <p className="text-gray-700">
                All transactions, orders, invoices, and communication are digitally recorded, providing 
                complete transparency and easy access to historical data.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-4">3</span>
            Our Mission
          </h2>
          <div className="space-y-4">
            <p className="text-lg text-gray-800 leading-relaxed">
              <strong className="text-primary-700">To Simplify Wholesale Trade:</strong> We believe that wholesale trade 
              should be straightforward and accessible. Our platform eliminates complex intermediaries and reduces 
              transaction friction, making it easier for businesses to work together.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              <strong className="text-primary-700">To Empower Small Retailers:</strong> Small and medium retail shops 
              often face challenges in accessing quality products at competitive prices. Agaram Agency levels the playing 
              field by connecting them directly with manufacturers.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              <strong className="text-primary-700">To Help Manufacturers Reach More Shops:</strong> Manufacturers can 
              expand their distribution network without the overhead of traditional sales channels. Our platform helps 
              them discover new retail partners and grow their business.
            </p>
          </div>
        </section>

        {/* Why Agaram Agency */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">4</span>
            Why Agaram Agency
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start mb-4">
                <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-gray-700">
                    All transactions are transparent with clear pricing, order tracking, and digital invoices. 
                    No hidden fees or surprises.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Speed</h3>
                  <p className="text-gray-700">
                    Fast order processing and communication. Requests are handled quickly, and orders are 
                    fulfilled efficiently.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start mb-4">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Transformation</h3>
                  <p className="text-gray-700">
                    Modern platform with intuitive interfaces, mobile-responsive design, and cloud-based 
                    infrastructure for reliability.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start mb-4">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Open-Source Platform</h3>
                  <p className="text-gray-700">
                    Built as an open-source solution, fostering innovation and allowing the community 
                    to contribute and improve the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How the Platform Works */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">5</span>
            How the Platform Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Manufacturer Adds Products</h3>
                <p className="text-gray-700">
                  Manufacturers create accounts and list their products with details like specifications, 
                  pricing, minimum order quantities, and availability.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Retailer Views Products</h3>
                <p className="text-gray-700">
                  Retail shops browse the marketplace, search for products, compare options from different 
                  manufacturers, and view detailed product information.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Retailer Sends Product Request</h3>
                <p className="text-gray-700">
                  Retail shops send product requests specifying the products, quantities, and delivery 
                  requirements directly to manufacturers.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Manufacturer Processes Order</h3>
                <p className="text-gray-700">
                  Manufacturers review requests, accept or reject them, confirm orders, and manage fulfillment. 
                  The platform tracks the entire order lifecycle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Future Vision */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-4">6</span>
            Future Vision
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">🤖</span>
                AI-Powered Demand Prediction
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Leveraging artificial intelligence to predict demand patterns, helping manufacturers optimize 
                inventory and retailers plan their procurement more effectively.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Smart Distribution Networks
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Building intelligent distribution networks that optimize logistics, reduce delivery times, 
                and minimize costs through data-driven routing and inventory placement.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-3">🌐</span>
                Digital Dealership Ecosystem
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Creating a comprehensive digital ecosystem that connects all stakeholders in the wholesale 
                trade, including logistics providers, payment gateways, and financial services, all integrated 
                into one seamless platform.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;