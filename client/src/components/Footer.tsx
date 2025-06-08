import { ChartLine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChartLine className="text-blue-500 text-xl" />
            <h3 className="text-lg font-bold">Portfolio Pro</h3>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Portfolio Pro.</p>
        </div>
      </div>
    </footer>
  );
}