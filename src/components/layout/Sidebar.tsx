
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Package2, 
  PackageOpen, 
  PackagePlus, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'My Fridges', path: '/fridges', icon: <Package2 className="h-5 w-5" /> },
    { name: 'Products', path: '/products', icon: <PackageOpen className="h-5 w-5" /> },
    { name: 'Add Product', path: '/add-product', icon: <PackagePlus className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Menu</h2>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === item.path 
                ? "bg-primary text-white" 
                : "hover:bg-secondary"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
