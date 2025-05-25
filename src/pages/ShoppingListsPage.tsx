
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  ShoppingListItem,
  Fridge,
  Product,
  getShoppingLists,
  addToShoppingList,
  removeFromShoppingList,
  updateShoppingListItem,
  clearShoppingList,
  getFridgesByUser,
  getProductsByUser
} from '@/api/fridgeApi';
import { CalendarIcon, Plus, Trash2, Pencil, ShoppingCart, Package } from 'lucide-react';

const ShoppingListsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // For adding new item
  const [selectedFridgeId, setSelectedFridgeId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  
  // For editing item
  const [editItem, setEditItem] = useState<ShoppingListItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get shopping list from localStorage
      const lists = getShoppingLists();
      setShoppingList(lists);
      
      // Get fridges and products
      const [fridgesData, productsData] = await Promise.all([
        getFridgesByUser(user.user_id),
        getProductsByUser(user.user_id)
      ]);
      
      setFridges(fridgesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFridgeId || !selectedProductId) return;
    
    try {
      const fridge = fridges.find(f => f.fridge_id === parseInt(selectedFridgeId));
      const product = products.find(p => p.product_id === parseInt(selectedProductId));
      
      if (!fridge || !product) {
        toast({
          title: 'Error',
          description: 'Please select valid fridge and product.',
          variant: 'destructive',
        });
        return;
      }
      
      const menge = parseFloat(quantity);
      
      if (isNaN(menge) || menge <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid quantity.',
          variant: 'destructive',
        });
        return;
      }
      
      const expiryDateStr = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : '';
      const success = addToShoppingList(
        product.product_id,
        product.name,
        product.kategorie,
        product.einheit,
        product.bild_url,
        menge,
        expiryDateStr,
        fridge.fridge_id,
        fridge.title
      );
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item added to shopping list successfully.',
        });
        setSelectedFridgeId('');
        setSelectedProductId('');
        setQuantity('1');
        setExpiryDate(undefined);
        fetchData();
      } else {
        throw new Error('Failed to add item to shopping list');
      }
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to shopping list. Please try again.',
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
      const success = updateShoppingListItem(editItem.id, menge, expiryDateStr);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item updated successfully.',
        });
        setEditItem(null);
        fetchData();
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

  const handleRemoveItem = async (itemId: number) => {
    try {
      const success = removeFromShoppingList(itemId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Item removed successfully.',
        });
        fetchData();
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

  const handleClearList = async () => {
    try {
      const success = clearShoppingList();
      if (success) {
        toast({
          title: 'Success',
          description: 'Shopping list cleared successfully.',
        });
        fetchData();
      } else {
        throw new Error('Failed to clear shopping list');
      }
    } catch (error) {
      console.error('Error clearing shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear shopping list. Please try again.',
        variant: 'destructive',
      });
    }
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

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground mt-1">Plan your shopping for each fridge</p>
        </div>
        
        <div className="flex gap-2">
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
                  <DialogTitle>Add Item to Shopping List</DialogTitle>
                  <DialogDescription>
                    Add a product to your shopping list for a specific fridge.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="fridge" className="text-sm font-medium">
                      Target Fridge
                    </label>
                    <Select
                      value={selectedFridgeId}
                      onValueChange={setSelectedFridgeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fridge" />
                      </SelectTrigger>
                      <SelectContent>
                        {fridges.length === 0 ? (
                          <SelectItem value="no-fridges" disabled>
                            No fridges available
                          </SelectItem>
                        ) : (
                          fridges.map((fridge) => (
                            <SelectItem 
                              key={fridge.fridge_id} 
                              value={fridge.fridge_id.toString()}
                            >
                              {fridge.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                      Expected Expiration Date
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
                    disabled={!selectedFridgeId || !selectedProductId || !quantity}
                  >
                    Add to Shopping List
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {shoppingList.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Shopping List</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to clear your entire shopping list? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleClearList}>
                      Clear List
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>
            Items you plan to buy for your fridges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shoppingList.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your shopping list is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some products to your shopping list to get started.
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
                      <DialogTitle>Add Item to Shopping List</DialogTitle>
                      <DialogDescription>
                        Add a product to your shopping list for a specific fridge.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="fridge" className="text-sm font-medium">
                          Target Fridge
                        </label>
                        <Select
                          value={selectedFridgeId}
                          onValueChange={setSelectedFridgeId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a fridge" />
                          </SelectTrigger>
                          <SelectContent>
                            {fridges.length === 0 ? (
                              <SelectItem value="no-fridges" disabled>
                                No fridges available
                              </SelectItem>
                            ) : (
                              fridges.map((fridge) => (
                                <SelectItem 
                                  key={fridge.fridge_id} 
                                  value={fridge.fridge_id.toString()}
                                >
                                  {fridge.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
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
                          Expected Expiration Date
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
                        disabled={!selectedFridgeId || !selectedProductId || !quantity}
                      >
                        Add to Shopping List
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
                    <TableHead>Target Fridge</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expected Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shoppingList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.kategorie || "Uncategorized"}</TableCell>
                      <TableCell>{item.fridge_title}</TableCell>
                      <TableCell>{item.menge} {item.einheit}</TableCell>
                      <TableCell>
                        {item.haltbarkeit 
                          ? format(new Date(item.haltbarkeit), 'MMM d, yyyy')
                          : "Not set"}
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
                                  <DialogTitle>Edit Shopping List Item</DialogTitle>
                                  <DialogDescription>
                                    Update quantity or expected expiration date for {editItem?.name}.
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
                                      Expected Expiration Date
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
                                  Are you sure you want to remove {item.name} from your shopping list?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleRemoveItem(item.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingListsPage;
