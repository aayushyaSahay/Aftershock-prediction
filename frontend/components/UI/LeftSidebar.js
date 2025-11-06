import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Map, BookOpen, Menu, X, ChevronRight } from 'lucide-react';

export default function LeftSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  
  const navItems = [
    { href: '/', label: 'Live Monitor', icon: Activity },
    { href: '/models', label: 'Models', icon: Map },
    { href: '/about', label: 'About', icon: BookOpen },
  ];
  
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 bg-white shadow-2xl transition-all duration-300 z-50 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          {isExpanded ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <Menu className="w-4 h-4 text-gray-600" />
          )}
        </button>
        
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <span className="font-semibold text-gray-900 whitespace-nowrap">
                Aftershock Monitor
              </span>
            )}
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}