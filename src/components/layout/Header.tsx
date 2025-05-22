
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Package } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-semibold text-primary">
            Smart Fridge
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-muted-foreground">
                Welcome, {user.username}
              </span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
