import { ChartLine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ChartLine className="text-blue-500 text-xl" />
              <h3 className="text-lg font-bold">StockVision Pro</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Advanced portfolio analytics and market insights for modern investors.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Real-time Data</li>
              <li>Market Analysis</li>
              <li>Risk Assessment</li>
              <li>Portfolio Tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>API Documentation</li>
              <li>Market Data</li>
              <li>News & Analysis</li>
              <li>Educational Content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <i className="fab fa-twitter text-gray-400 hover:text-blue-400 cursor-pointer"></i>
              <i className="fab fa-linkedin text-gray-400 hover:text-blue-400 cursor-pointer"></i>
              <i className="fab fa-github text-gray-400 hover:text-blue-400 cursor-pointer"></i>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 StockVision Pro. Built with modern web technologies for portfolio demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
