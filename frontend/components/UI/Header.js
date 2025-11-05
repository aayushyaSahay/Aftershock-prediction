import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Map, BookOpen, Code } from 'lucide-react';

export default function Header({ timeFilter, setTimeFilter, onLocationClick }) {
  const router = useRouter();
  
  const navItems = [
    { href: '/', label: 'Live Monitor', icon: Activity },
    { href: '/models', label: 'Models', icon: Map },
    { href: '/about', label: 'About', icon: BookOpen },
  ];
  
  const timeFilters = [
    { label: 'Last Week', value: 7 },
    { label: 'Last Month', value: 30 },
    { label: 'Last Year', value: 365 },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-bg-card border-b border-white/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Aftershock Monitor
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Time Filter & Location (only on home page) */}
          {router.pathname === '/' && (
            <div className="flex items-center space-x-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(Number(e.target.value))}
                className="bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {timeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={onLocationClick}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                title="Use my location"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Location</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/10">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}