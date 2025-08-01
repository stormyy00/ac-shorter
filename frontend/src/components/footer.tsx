import { Link } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-950/80 border-t border-gray-100 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center space-y-4 md:space-y-0">
            <div className="col-span-2 lg:col-span-1 space-y-4">``
              <div className="flex justify-center items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Link className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-white">
                    AC Shorter
                  </span>
                </div>
                <p className="text-gray-50 text-sm font-light text-center leading-relaxed max-w-xs">
                  Create powerful short links that drive engagement. Simple,
                  fast, and reliable.
                </p>
              </div>
              <p className="text-gray-100 text-sm font-light">
                © 2025 Shorter. All rights reserved.
              </p>
            </div>
      </div>
    </div>
  );
};

export default Footer;
