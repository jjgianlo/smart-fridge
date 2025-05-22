
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';

const MainLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {user && <Sidebar />}
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};

export default MainLayout;
