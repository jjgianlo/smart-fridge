
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { toast } from '@/hooks/use-toast';
import { PackageOpen, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Product, createProduct, deleteProduct, getProductsByUser, updateProduct } from '@/api/fridgeApi';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // For creating product
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productUnit, setProductUnit] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  
  // For editing product
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getProductsByUser(user.user_id);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!productName.trim() || !productUnit.trim()) {
      toast({
        title: 'Error',
        description: 'Product name and unit are required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await createProduct(
        user.user_id,
        productName,
        productCategory,
        productUnit,
        productImageUrl
      );
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Product created successfully.',
        });
        setProductName('');
        setProductCategory('');
        setProductUnit('');
        setProductImageUrl('');
        fetchProducts();
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    
    if (!editName.trim() || !editUnit.trim()) {
      toast({
        title: 'Error',
        description: 'Product name and unit are required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await updateProduct(
        editProduct.product_id,
        editName,
        editCategory,
        editImageUrl,
        editUnit,
        editProduct.barcode_path
      );
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Product updated successfully.',
        });
        setEditProduct(null);
        fetchProducts();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const success = await deleteProduct(productId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully.',
        });
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.kategorie && product.kategorie.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProduct}>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Create a new product to add to your fridges.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="productName" className="text-sm font-medium">
                      Product Name*
                    </label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Milk"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="productCategory" className="text-sm font-medium">
                      Category
                    </label>
                    <Input
                      id="productCategory"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      placeholder="e.g., Dairy"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="productUnit" className="text-sm font-medium">
                      Unit*
                    </label>
                    <Input
                      id="productUnit"
                      value={productUnit}
                      onChange={(e) => setProductUnit(e.target.value)}
                      placeholder="e.g., L, kg, pcs"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="productImageUrl" className="text-sm font-medium">
                      Image URL
                    </label>
                    <Input
                      id="productImageUrl"
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <PackageOpen className="h-16 w-16 text-muted-foreground opacity-50" />
              <div>
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                    <p className="text-muted-foreground mb-6">
                      No products match your search criteria.
                    </p>
                    <Button onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any products yet. Create your first product to add to your fridges.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleCreateProduct}>
                          <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>
                              Create a new product to add to your fridges.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="productName" className="text-sm font-medium">
                                Product Name*
                              </label>
                              <Input
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., Milk"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="productCategory" className="text-sm font-medium">
                                Category
                              </label>
                              <Input
                                id="productCategory"
                                value={productCategory}
                                onChange={(e) => setProductCategory(e.target.value)}
                                placeholder="e.g., Dairy"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="productUnit" className="text-sm font-medium">
                                Unit*
                              </label>
                              <Input
                                id="productUnit"
                                value={productUnit}
                                onChange={(e) => setProductUnit(e.target.value)}
                                placeholder="e.g., L, kg, pcs"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="productImageUrl" className="text-sm font-medium">
                                Image URL
                              </label>
                              <Input
                                id="productImageUrl"
                                value={productImageUrl}
                                onChange={(e) => setProductImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create Product</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.product_id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditProduct(product);
                            setEditName(product.name);
                            setEditCategory(product.kategorie || '');
                            setEditUnit(product.einheit);
                            setEditImageUrl(product.bild_url || '');
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleUpdateProduct}>
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>
                              Update the details of your product.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="editName" className="text-sm font-medium">
                                Product Name*
                              </label>
                              <Input
                                id="editName"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="e.g., Milk"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="editCategory" className="text-sm font-medium">
                                Category
                              </label>
                              <Input
                                id="editCategory"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                placeholder="e.g., Dairy"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="editUnit" className="text-sm font-medium">
                                Unit*
                              </label>
                              <Input
                                id="editUnit"
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                                placeholder="e.g., L, kg, pcs"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="editImageUrl" className="text-sm font-medium">
                                Image URL
                              </label>
                              <Input
                                id="editImageUrl"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => setEditProduct(null)}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit">Update Product</Button>
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
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone and will remove it from any fridges it's stored in.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.product_id)}
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {product.kategorie && (
                  <CardDescription>
                    Category: {product.kategorie}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unit: {product.einheit}</span>
                  <span className="text-sm text-muted-foreground">ID: {product.product_id}</span>
                </div>
                
                {product.bild_url && (
                  <div className="mt-4 relative h-40 overflow-hidden rounded-md">
                    <img
                      src={product.bild_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
