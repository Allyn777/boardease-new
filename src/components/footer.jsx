import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#071E26] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-3">Board Ease</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted boarding house management platform with seamless payment integration. 
              Simplifying rental management for landlords and tenants.
            </p>
          </div>

          {/* Features Section */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors">Online Payment System</li>
              <li className="hover:text-white transition-colors">Room Management</li>
              <li className="hover:text-white transition-colors">Tenant Tracking</li>
              <li className="hover:text-white transition-colors">Billing & Invoices</li>
              <li className="hover:text-white transition-colors">Real-time Notifications</li>
              <li className="hover:text-white transition-colors">Report Generation</li>
            </ul>
          </div>

          {/* Quick Links & Support */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/home" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/rooms" className="hover:text-white transition-colors">Available Rooms</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Payment History</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Account Settings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Manage Tenants</a></li>

            </ul>
          </div>

          {/* Contact & Developers Section */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Get In Touch</h4>
            <div className="text-sm text-gray-400 space-y-2 mb-4">
              <p>Have questions? We're here to help!</p>
              <p className="hover:text-white transition-colors cursor-pointer">boardease@gmail.com</p>
              <p className="hover:text-white transition-colors cursor-pointer">+63 955 201 6070</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-semibold mb-2">Developed By</h5>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="hover:text-white transition-colors">Allyn Marc C. Dumapias</p>
                <p className="hover:text-white transition-colors">Dec Florhen A. Uy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-[#0a2830] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
            <div>
              <h5 className="text-sm font-semibold mb-2 text-gray-300">Secure Payment Gateway</h5>
              <p className="text-xs text-gray-400">
                All transactions are encrypted and processed through secure payment APIs. 
                We support multiple payment methods for your convenience including credit cards, 
                debit cards, and e-wallets.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2 text-gray-300">24/7 Availability</h5>
              <p className="text-xs text-gray-400">
                Access your boarding house management dashboard anytime, anywhere. 
                Our platform is designed to work seamlessly on desktop, tablet, and mobile devices 
                for maximum convenience.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Board Ease. All rights reserved. Made with  in the Philippines
            </p>
            
            {/* Legal Links */}
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#cookies" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;