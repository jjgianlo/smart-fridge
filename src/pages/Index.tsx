
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fridge, FridgeItem, getFridgeContents, getFridgesByUser, Product, getProductsByUser } from '@/api/fridgeApi';
import { Package2, PackageOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user fridges
        const userFridges = await getFridgesByUser(user.user_id);
        setFridges(userFridges);

        // Fetch user products
        const userProducts = await getProductsByUser(user.user_id);
        setProducts(userProducts);

        // Get contents of the first fridge
        if (userFridges.length > 0) {
          const contents = await getFridgeContents(userFridges[0].fridge_id);
          setFridgeItems(contents);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-lg">
          <CardHeader className="text-center pb-10">
            <CardTitle className="text-4xl font-bold text-primary">Welcome to Smart Fridge</CardTitle>
            <CardDescription className="text-lg mt-4">
              Your intelligent kitchen companion for managing your food inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pb-10">
            <div className="text-center max-w-lg">
              <p className="text-muted-foreground mb-6">
                Track your food items, monitor expiration dates, manage multiple fridges, and more!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 mt-12 md:grid-cols-3">
          <div className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center text-center">
            <PackageOpen className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Your Food</h3>
            <p className="text-muted-foreground">Keep an inventory of all items in your fridge and pantry.</p>
          </div>
          
          <div className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expiration Alerts</h3>
            <p className="text-muted-foreground">Get notified before your food goes bad to reduce waste.</p>
          </div>
          
          <div className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center text-center">
            <Package2 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Fridges</h3>
            <p className="text-muted-foreground">Manage different fridges or storage locations separately.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate expiring soon items (within 7 days)
  const today = new Date();
  const expiringSoon = fridgeItems.filter(item => {
    if (!item.haltbarkeit) return false;
    const expiryDate = new Date(item.haltbarkeit);
    const diffDays = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // Calculate expired items
  const expired = fridgeItems.filter(item => {
    if (!item.haltbarkeit) return false;
    const expiryDate = new Date(item.haltbarkeit);
    return expiryDate < today;
  });

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Fridges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package2 className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-3xl font-bold">{fridges.length}</p>
                <p className="text-sm text-muted-foreground">
                  {fridges.length === 1 ? 'Fridge' : 'Fridges'} registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PackageOpen className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-3xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">
                  {products.length === 1 ? 'Product' : 'Products'} defined
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={expired.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg font-medium ${expired.length > 0 ? "text-red-600" : ""}`}>
              Expired Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className={`h-8 w-8 ${expired.length > 0 ? "text-red-500" : "text-muted"} mr-3`} />
              <div>
                <p className={`text-3xl font-bold ${expired.length > 0 ? "text-red-600" : ""}`}>
                  {expired.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {expired.length === 1 ? 'Item has' : 'Items have'} expired
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {fridges.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="col-span-full md:col-span-1">
            <CardHeader>
              <CardTitle>Your Fridges</CardTitle>
              <CardDescription>Manage your refrigerators and storage spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fridges.map((fridge) => (
                  <div key={fridge.fridge_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package2 className="h-6 w-6 text-primary" />
                      <span className="font-medium">{fridge.title}</span>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/fridge/${fridge.fridge_id}`)}>
                      View Contents
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/fridges')}>
                  Manage Fridges
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`col-span-full md:col-span-1 ${expiringSoon.length > 0 ? "border-amber-200" : ""}`}>
            <CardHeader>
              <CardTitle className={expiringSoon.length > 0 ? "text-amber-700" : ""}>
                Expiring Soon
              </CardTitle>
              <CardDescription>
                Items that will expire in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiringSoon.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    No items expiring soon. Great job!
                  </p>
                ) : (
                  expiringSoon.map((item) => {
                    const expiryDate = new Date(item.haltbarkeit);
                    const timeLeft = formatDistanceToNow(expiryDate, { addSuffix: true });
                    
                    return (
                      <div key={item.entry_id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-amber-700">Expires {timeLeft}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.menge} {item.einheit}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
