import { ChartLine } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/">
              <div className="flex items-center space-x-2 mb-4 cursor-pointer hover:text-blue-400 transition-colors">
                <ChartLine className="text-blue-500 text-xl" />
                <h3 className="text-lg font-bold">StockVision Pro</h3>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Advanced portfolio analytics and market insights for modern investors.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  Real-time Data
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  Risk Assessment
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors cursor-pointer">
                  Portfolio Tracking
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  Market Data
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors cursor-pointer">
                  News & Analysis
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
                  Educational Content
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 StockVision Pro. Built with modern web technologies for portfolio demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
