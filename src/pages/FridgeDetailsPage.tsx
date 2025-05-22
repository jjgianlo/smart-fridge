
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format, isAfter, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  FridgeItem, 
  Fridge, 
  Product, 
  getFridgeContents, 
  getFridgeByDetail,
  getProductsByUser,
  addProductToFridge,
  removeProductFromFridge,
  updateFridgeItem
} from '@/api/fridgeApi';
import { CalendarIcon, Package, PackageOpen, Pencil, Plus, Trash2, AlertTriangle } from 'lucide-react';

const FridgeDetailsPage: React.FC = () => {
  const { fridgeId } = useParams<{ fridgeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fridge, setFridge] = useState<Fridge | null>(null);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // For adding new item
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  
  // For editing item
  const [editItem, setEditItem] = useState<FridgeItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (!user || !fridgeId) {
      navigate('/login');
      return;
    }

    fetchFridgeData();
  }, [user, fridgeId, navigate]);

  const fetchFridgeData = async () => {
    if (!user || !fridgeId) return;
    
    try {
      setLoading(true);
      
      // Get fridge details
      const fridgeData = await getFridgeByDetail(parseInt(fridgeId));
      setFridge(fridgeData);
      
      // Get fridge contents
      const contents = await getFridgeContents(parseInt(fridgeId));
      setFridgeItems(contents);
      
      // Get available products
      const productsData = await getProductsByUser(user.user_id);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch fridge data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch fridge data. Please try again.',
        variant: 'destructive',
      });
      navigate('/fridges');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fridgeId || !selectedProductId) return;
    
    try {
      const productId = parseInt(selectedProductId);
      const menge = parseFloat(quantity);
      
      if (isNaN(menge) || menge <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid quantity.',
          variant: 'destructive',
        });
        return;
      }
      
      const expiryDateStr = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined;
      const success = await addProductToFridge(
        parseInt(fridgeId),
        productId,
        menge,
        expiryDateStr,
      );
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Product added to fridge successfully.',
        });
        setSelectedProductId('');
        setQuantity('1');
        setExpiryDate(undefined);
        fetchFridgeData();
      } else {
        throw new Error('Failed to add product to fridge');
      }
    } catch (error) {
      console.error('Error adding product to fridge:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to fridge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    
    try {
      const menge = parseFloat(editQuantity);
      
      if (isNaN(menge) || menge <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid quantity.',
          variant: 'destructive',
        });
        return;
      }
      
      const expiryDateStr = editExpiryDate ? format(editExpiryDate, 'yyyy-MM-dd') : '';
      const success = await updateFridgeItem(
        editItem.entry_id,
        menge,
        expiryDateStr,
        editItem.lagerdatum,
      );
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item updated successfully.',
        });
        setEditItem(null);
        fetchFridgeData();
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!fridgeId) return;
    
    try {
      const success = await removeProductFromFridge(parseInt(fridgeId), productId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Item removed successfully.',
        });
        fetchFridgeData();
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Check if a product is expired
  const isExpired = (item: FridgeItem): boolean => {
    if (!item.haltbarkeit) return false;
    const today = new Date();
    const expiryDate = parseISO(item.haltbarkeit);
    return isAfter(today, expiryDate);
  };

  // Check if a product is expiring soon (within 7 days)
  const isExpiringSoon = (item: FridgeItem): boolean => {
    if (!item.haltbarkeit) return false;
    const today = new Date();
    const expiryDate = parseISO(item.haltbarkeit);
    if (isAfter(today, expiryDate)) return false;
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return isAfter(sevenDaysFromNow, expiryDate);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!fridge) {
    return (
      <div className="container max-w-6xl mx-auto py-6">
        <Card className="text-center p-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Package className="h-16 w-16 text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Fridge Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The fridge you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => navigate('/fridges')}>
                  Go Back to Fridges
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/fridges')}
              className="mr-1"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.84182 3.13514C9.04327 2.93370 9.04327 2.60037 8.84182 2.39893C8.64038 2.19749 8.30705 2.19749 8.10561 2.39893L4.85561 5.64893C4.65417 5.85037 4.65417 6.18370 4.85561 6.38514L8.10561 9.63514C8.30705 9.83659 8.64038 9.83659 8.84182 9.63514C9.04327 9.43370 9.04327 9.10037 8.84182 8.89893L6.02685 6.08396H10.5C10.7761 6.08396 11 5.86003 11 5.58396C11 5.30789 10.7761 5.08396 10.5 5.08396H6.02685L8.84182 2.26899C9.04327 2.06754 9.04327 1.73421 8.84182 1.53277C8.64038 1.33133 8.30705 1.33133 8.10561 1.53277L3.85561 5.78277C3.65417 5.98421 3.65417 6.31754 3.85561 6.51899L8.10561 10.7690C8.30705 10.9704 8.64038 10.9704 8.84182 10.7690C9.04327 10.5675 9.04327 10.2342 8.84182 10.0328L5.02685 6.21782H12.5C12.7761 6.21782 13 5.99389 13 5.71782C13 5.44175 12.7761 5.21782 12.5 5.21782H5.02685L8.84182 1.40286C9.04327 1.20141 9.04327 0.868083 8.84182 0.666641C8.64038 0.465199 8.30705 0.465199 8.10561 0.666641L2.85561 5.91664C2.65417 6.11808 2.65417 6.45141 2.85561 6.65286L8.10561 11.9029C8.30705 12.1043 8.64038 12.1043 8.84182 11.9029C9.04327 11.7014 9.04327 11.3681 8.84182 11.1666L3.59182 5.91664C3.39038 5.71520 3.39038 5.38186 3.59182 5.18042L8.84182 -0.0695772C9.04327 -0.271019 9.04327 -0.604352 8.84182 -0.805795C8.64038 -1.00724 8.30705 -1.00724 8.10561 -0.805795L1.85561 5.44421C1.65417 5.64565 1.65417 5.97899 1.85561 6.18043L8.10561 12.4304C8.30705 12.6319 8.64038 12.6319 8.84182 12.4304C9.04327 12.2290 9.04327 11.8957 8.84182 11.6942L2.59182 5.44421C2.39038 5.24277 2.39038 4.90944 2.59182 4.70799L8.84182 -1.55799C9.04327 -1.75943 9.04327 -2.09277 8.84182 -2.29421C8.64038 -2.49565 8.30705 -2.49565 8.10561 -2.29421L0.855612 4.95579C0.654169 5.15723 0.654169 5.49056 0.855612 5.69201L8.10561 12.9421C8.30705 13.1435 8.64038 13.1435 8.84182 12.9421C9.04327 12.7406 9.04327 12.4073 8.84182 12.2058L1.59182 4.95579C1.39038 4.75435 1.39038 4.42101 1.59182 4.21957L8.84182 -3.03043C9.04327 -3.23187 9.04327 -3.56521 8.84182 -3.76665C8.64038 -3.96809 8.30705 -3.96809 8.10561 -3.76665L-0.144388 4.48336C-0.345831 4.68480 -0.345831 5.01813 -0.144388 5.21957L8.10561 13.4696C8.30705 13.6710 8.64038 13.6710 8.84182 13.4696C9.04327 13.2681 9.04327 12.9348 8.84182 12.7334L0.591822 4.48336C0.390379 4.28192 0.390379 3.94858 0.591822 3.74714L8.84182 -4.50286C9.04327 -4.70430 9.04327 -5.03764 8.84182 -5.23908C8.64038 -5.44052 8.30705 -5.44052 8.10561 -5.23908L-1.14439 4.01093C-1.34583 4.21237 -1.34583 4.54570 -1.14439 4.74714L8.10561 13.9971C8.30705 14.1986 8.64038 14.1986 8.84182 13.9971C9.04327 13.7957 9.04327 13.4624 8.84182 13.2609L-0.408178 4.01093C-0.609621 3.80948 -0.609621 3.47615 -0.408178 3.27471L8.84182 -6.01093C9.04327 -6.21237 9.04327 -6.54571 8.84182 -6.74715C8.64038 -6.94859 8.30705 -6.94859 8.10561 -6.74715L-2.14439 3.53850C-2.34583 3.73994 -2.34583 4.07327 -2.14439 4.27471L8.10561 14.5247C8.30705 14.7261 8.64038 14.7261 8.84182 14.5247C9.04327 14.3232 9.04327 13.9899 8.84182 13.7885L-1.40818 3.53850C-1.60962 3.33706 -1.60962 3.00373 -1.40818 2.80228L8.84182 -7.44715C9.04327 -7.64859 9.04327 -7.98192 8.84182 -8.18337C8.64038 -8.38481 8.30705 -8.38481 8.10561 -8.18337L-3.14439 3.06607C-3.34583 3.26751 -3.34583 3.60084 -3.14439 3.80228L8.10561 15.0523C8.30705 15.2537 8.64038 15.2537 8.84182 15.0523C9.04327 14.8508 9.04327 14.5175 8.84182 14.3161L-2.40818 3.06607C-2.60962 2.86463 -2.60962 2.53129 -2.40818 2.32985L8.84182 -8.92322C9.04327 -9.12466 9.04327 -9.45799 8.84182 -9.65944C8.64038 -9.86088 8.30705 -9.86088 8.10561 -9.65944L-4.14439 2.59364C-4.34583 2.79508 -4.34583 3.12841 -4.14439 3.32985L8.10561 15.5799C8.30705 15.7813 8.64038 15.7813 8.84182 15.5799C9.04327 15.3784 9.04327 15.0451 8.84182 14.8437L-3.40818 2.59364C-3.60962 2.39219 -3.60962 2.05886 -3.40818 1.85742L8.84182 -10.4086C9.04327 -10.6101 9.04327 -10.9434 8.84182 -11.1448C8.64038 -11.3463 8.30705 -11.3463 8.10561 -11.1448L-5.14439 2.12120C-5.34583 2.32264 -5.34583 2.65598 -5.14439 2.85742L8.10561 16.1075C8.30705 16.3089 8.64038 16.3089 8.84182 16.1075C9.04327 15.9060 9.04327 15.5727 8.84182 15.3713L-4.40818 2.12120C-4.60962 1.91976 -4.60962 1.58643 -4.40818 1.38499L8.84182 -11.8342C9.04327 -12.0356 9.04327 -12.3690 8.84182 -12.5704C8.64038 -12.7718 8.30705 -12.7718 8.10561 -12.5704L-6.14439 1.64877C-6.34583 1.85021 -6.34583 2.18354 -6.14439 2.38499L8.10561 16.6350C8.30705 16.8365 8.64038 16.8365 8.84182 16.6350C9.04327 16.4336 9.04327 16.1003 8.84182 15.8988L-5.40818 1.64877C-5.60962 1.44733 -5.60962 1.11399 -5.40818 0.912551L8.84182 -13.2597C9.04327 -13.4611 9.04327 -13.7945 8.84182 -13.9959C8.64038 -14.1973 8.30705 -14.1973 8.10561 -13.9959L-7.14439 1.17634C-7.34583 1.37778 -7.34583 1.71111 -7.14439 1.91255L8.10561 17.1626C8.30705 17.3640 8.64038 17.3640 8.84182 17.1626C9.04327 16.9611 9.04327 16.6278 8.84182 16.4264L-6.40818 1.17634C-6.60962 0.974895 -6.60962 0.641562 -6.40818 0.440119L8.84182 -14.6852C9.04327 -14.8867 9.04327 -15.2200 8.84182 -15.4214C8.64038 -15.6229 8.30705 -15.6229 8.10561 -15.4214L-8.14439 0.703906C-8.34583 0.905348 -8.34583 1.23868 -8.14439 1.44012L8.10561 17.6901C8.30705 17.8916 8.64038 17.8916 8.84182 17.6901C9.04327 17.4887 9.04327 17.1554 8.84182 16.9539L-7.40818 0.703906C-7.60962 0.502464 -7.60962 0.169131 -7.40818 -0.0323121L8.84182 -16.1108C9.04327 -16.3122 9.04327 -16.6455 8.84182 -16.847C8.64038 -17.0484 8.30705 -17.0484 8.10561 -16.847L-9.14439 0.231476C-9.34583 0.432918 -9.34583 0.766251 -9.14439 0.967693L8.10561 18.2177C8.30705 18.4191 8.64038 18.4191 8.84182 18.2177C9.04327 18.0162 9.04327 17.6829 8.84182 17.4815L-8.40818 0.231476C-8.60962 0.0300339 -8.60962 -0.303299 -8.40818 -0.504741L8.84182 -17.5363C9.04327 -17.7378 9.04327 -18.0711 8.84182 -18.2725C8.64038 -18.4740 8.30705 -18.4740 8.10561 -18.2725L-10.1444 -0.240953C-10.3458 -0.0395105 -10.3458 0.293822 -10.1444 0.495265L8.10561 18.7452C8.30705 18.9467 8.64038 18.9467 8.84182 18.7452C9.04327 18.5438 9.04327 18.2105 8.84182 18.0090L-9.40818 -0.240953C-9.60962 -0.442396 -9.60962 -0.775729 -9.40818 -0.977171L8.84182 -18.9619C9.04327 -19.1633 9.04327 -19.4967 8.84182 -19.6981C8.64038 -19.8995 8.30705 -19.8995 8.10561 -19.6981L-11.1444 -0.713383C-11.3458 -0.511941 -11.3458 -0.178608 -11.1444 0.0228346L8.10561 19.2728C8.30705 19.4742 8.64038 19.4742 8.84182 19.2728C9.04327 19.0714 9.04327 18.7380 8.84182 18.5366L-10.4082 -0.713383C-10.6096 -0.914825 -10.6096 -1.24816 -10.4082 -1.44960L8.84182 -20.3874C9.04327 -20.5889 9.04327 -20.9222 8.84182 -21.1236C8.64038 -21.3251 8.30705 -21.3251 8.10561 -21.1236L-12.1444 -1.18581C-12.3458 -0.984371 -12.3458 -0.651038 -12.1444 -0.449596L8.10561 19.8003C8.30705 20.0018 8.64038 20.0018 8.84182 19.8003C9.04327 19.5989 9.04327 19.2656 8.84182 19.0641L-11.4082 -1.18581C-11.6096 -1.38726 -11.6096 -1.72059 -11.4082 -1.92203L8.84182 -21.813C9.04327 -22.0144 9.04327 -22.3478 8.84182 -22.5492C8.64038 -22.7506 8.30705 -22.7506 8.10561 -22.5492L-13.1444 -1.65824C-13.3458 -1.45680 -13.3458 -1.12347 -13.1444 -0.922024L8.10561 20.3279C8.30705 20.5293 8.64038 20.5293 8.84182 20.3279C9.04327 20.1265 9.04327 19.7931 8.84182 19.5917L-12.4082 -1.65824C-12.6096 -1.85968 -12.6096 -2.19302 -12.4082 -2.39446L8.84182 -23.2385C9.04327 -23.4400 9.04327 -23.7733 8.84182 -23.9747C8.64038 -24.1762 8.30705 -24.1762 8.10561 -23.9747L-14.1444 -2.13068C-14.3458 -1.92924 -14.3458 -1.59590 -14.1444 -1.39446L8.10561 20.8554C8.30705 21.0569 8.64038 21.0569 8.84182 20.8554C9.04327 20.654 9.04327 20.3207 8.84182 20.1192L-13.4082 -2.13068C-13.6096 -2.33212 -13.6096 -2.66545 -13.4082 -2.86689L8.84182 -24.6641C9.04327 -24.8655 9.04327 -25.1989 8.84182 -25.4003C8.64038 -25.6017 8.30705 -25.6017 8.10561 -25.4003L-15.1444 -2.60311C-15.3458 -2.40167 -15.3458 -2.06834 -15.1444 -1.86689L8.10561 21.3830C8.30705 21.5844 8.64038 21.5844 8.84182 21.3830C9.04327 21.1815 9.04327 20.8482 8.84182 20.6468L-14.4082 -2.60311C-14.6096 -2.80455 -14.6096 -3.13788 -14.4082 -3.33932L8.84182 -26.0896C9.04327 -26.2911 9.04327 -26.6244 8.84182 -26.8258C8.64038 -27.0273 8.30705 -27.0273 8.10561 -26.8258L-16.1444 -3.07554C-16.3458 -2.87410 -16.3458 -2.54077 -16.1444 -2.33933L8.10561 21.9105C8.30705 22.1120 8.64038 22.1120 8.84182 21.9105C9.04327 21.7091 9.04327 21.3758 8.84182 21.1743L-15.4082 -3.07554C-15.6096 -3.27699 -15.6096 -3.61032 -15.4082 -3.81176L8.84182 -27.5152C9.04327 -27.7166 9.04327 -28.0499 8.84182 -28.2514C8.64038 -28.4528 8.30705 -28.4528 8.10561 -28.2514L-17.1444 -3.54797C-17.3458 -3.34653 -17.3458 -3.01320 -17.1444 -2.81176L8.10561 22.4381C8.30705 22.6395 8.64038 22.6395 8.84182 22.4381C9.04327 22.2367 9.04327 21.9033 8.84182 21.7019L-16.4082 -3.54797C-16.6096 -3.74942 -16.6096 -4.08275 -16.4082 -4.28419L8.10561 -28.7939" fill="currentColor"></path>
              </svg>
            </Button>
            <h1 className="text-3xl font-bold">{fridge.title}</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage the contents of your fridge</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddItem}>
              <DialogHeader>
                <DialogTitle>Add Item to Fridge</DialogTitle>
                <DialogDescription>
                  Add a product to your fridge with quantity and expiration date.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="product" className="text-sm font-medium">
                    Product
                  </label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>
                          No products available
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem 
                            key={product.product_id} 
                            value={product.product_id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="expiry" className="text-sm font-medium">
                    Expiration Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!selectedProductId || !quantity}
                >
                  Add to Fridge
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fridge Contents</CardTitle>
          <CardDescription>
            View and manage all items in your fridge
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fridgeItems.length === 0 ? (
            <div className="text-center py-12">
              <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your fridge is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some products to your fridge to get started.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddItem}>
                    <DialogHeader>
                      <DialogTitle>Add Item to Fridge</DialogTitle>
                      <DialogDescription>
                        Add a product to your fridge with quantity and expiration date.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="product" className="text-sm font-medium">
                          Product
                        </label>
                        <Select
                          value={selectedProductId}
                          onValueChange={setSelectedProductId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.length === 0 ? (
                              <SelectItem value="no-products" disabled>
                                No products available
                              </SelectItem>
                            ) : (
                              products.map((product) => (
                                <SelectItem 
                                  key={product.product_id} 
                                  value={product.product_id.toString()}
                                >
                                  {product.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="quantity" className="text-sm font-medium">
                          Quantity
                        </label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="expiry" className="text-sm font-medium">
                          Expiration Date
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !expiryDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={expiryDate}
                              onSelect={setExpiryDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={!selectedProductId || !quantity}
                      >
                        Add to Fridge
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fridgeItems.map((item) => {
                    const rowClass = isExpired(item) 
                      ? "bg-red-50" 
                      : isExpiringSoon(item) 
                        ? "bg-amber-50"
                        : "";
                        
                    return (
                      <TableRow 
                        key={item.entry_id}
                        className={rowClass}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {isExpired(item) && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {isExpiringSoon(item) && !isExpired(item) && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.kategorie || "Uncategorized"}</TableCell>
                        <TableCell>{item.menge} {item.einheit}</TableCell>
                        <TableCell>
                          {item.haltbarkeit 
                            ? format(new Date(item.haltbarkeit), 'MMM d, yyyy')
                            : "Not set"}
                        </TableCell>
                        <TableCell>
                          {item.lagerdatum
                            ? format(new Date(item.lagerdatum), 'MMM d, yyyy')
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditItem(item);
                                    setEditQuantity(item.menge.toString());
                                    setEditExpiryDate(item.haltbarkeit ? new Date(item.haltbarkeit) : undefined);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <form onSubmit={handleUpdateItem}>
                                  <DialogHeader>
                                    <DialogTitle>Edit Item</DialogTitle>
                                    <DialogDescription>
                                      Update quantity or expiration date for {editItem?.name}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <label htmlFor="editQuantity" className="text-sm font-medium">
                                        Quantity
                                      </label>
                                      <Input
                                        id="editQuantity"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label htmlFor="editExpiry" className="text-sm font-medium">
                                        Expiration Date
                                      </label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !editExpiryDate && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editExpiryDate ? format(editExpiryDate, 'PPP') : <span>Pick a date</span>}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={editExpiryDate}
                                            onSelect={setEditExpiryDate}
                                            initialFocus
                                            className="pointer-events-auto"
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button 
                                        variant="outline" 
                                        type="button"
                                        onClick={() => setEditItem(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <Button type="submit">Update Item</Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Item</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to remove {item.name} from your fridge?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4">
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleRemoveItem(item.product_id)}
                                    >
                                      Remove
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FridgeDetailsPage;
