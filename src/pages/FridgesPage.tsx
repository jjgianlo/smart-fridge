
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
  CardTitle 
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
import { Package, PackageOpen, Pencil, Trash2, Plus } from 'lucide-react';
import { Fridge, createFridge, deleteFridge, getFridgesByUser, updateFridge } from '@/api/fridgeApi';

const FridgesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFridgeTitle, setNewFridgeTitle] = useState('');
  const [editFridge, setEditFridge] = useState<Fridge | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFridges();
  }, [user, navigate]);

  const fetchFridges = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getFridgesByUser(user.user_id);
      setFridges(data);
    } catch (error) {
      console.error('Failed to fetch fridges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch fridges. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!newFridgeTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a fridge name.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await createFridge(user.user_id, newFridgeTitle);
      if (success) {
        toast({
          title: 'Success',
          description: 'Fridge created successfully.',
        });
        setNewFridgeTitle('');
        fetchFridges();
      } else {
        throw new Error('Failed to create fridge');
      }
    } catch (error) {
      console.error('Error creating fridge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create fridge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFridge) return;
    
    if (!editTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a fridge name.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await updateFridge(editFridge.fridge_id, editTitle);
      if (success) {
        toast({
          title: 'Success',
          description: 'Fridge updated successfully.',
        });
        setEditFridge(null);
        fetchFridges();
      } else {
        throw new Error('Failed to update fridge');
      }
    } catch (error) {
      console.error('Error updating fridge:', error);
      toast({
        title: 'Error',
        description: 'Failed to update fridge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFridge = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const success = await deleteFridge(deleteConfirmId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Fridge deleted successfully.',
        });
        setDeleteConfirmId(null);
        fetchFridges();
      } else {
        throw new Error('Failed to delete fridge');
      }
    } catch (error) {
      console.error('Error deleting fridge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete fridge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Fridges</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fridge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateFridge}>
              <DialogHeader>
                <DialogTitle>Add New Fridge</DialogTitle>
                <DialogDescription>
                  Create a new fridge or storage location to organize your food items.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Enter fridge name"
                  value={newFridgeTitle}
                  onChange={(e) => setNewFridgeTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Fridge</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : fridges.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <PackageOpen className="h-16 w-16 text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No Fridges Found</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any fridges yet. Create your first fridge to start tracking your food items.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Fridge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateFridge}>
                      <DialogHeader>
                        <DialogTitle>Add New Fridge</DialogTitle>
                        <DialogDescription>
                          Create a new fridge or storage location to organize your food items.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          placeholder="Enter fridge name"
                          value={newFridgeTitle}
                          onChange={(e) => setNewFridgeTitle(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Create Fridge</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fridges.map((fridge) => (
            <Card key={fridge.fridge_id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>{fridge.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditFridge(fridge);
                            setEditTitle(fridge.title);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleUpdateFridge}>
                          <DialogHeader>
                            <DialogTitle>Edit Fridge</DialogTitle>
                            <DialogDescription>
                              Update the name of your fridge.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Enter fridge name"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => setEditFridge(null)}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit">Update</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteConfirmId(fridge.fridge_id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Fridge</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{fridge.title}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                          <DialogClose asChild>
                            <Button 
                              variant="outline" 
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button 
                              variant="destructive" 
                              onClick={handleDeleteFridge}
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardDescription>
                  Fridge ID: {fridge.fridge_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage the contents of this fridge, track expiration dates, and more.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/fridge/${fridge.fridge_id}`)}
                >
                  View Contents
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FridgesPage;
