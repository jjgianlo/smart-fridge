
// API services for fridge-related operations
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Your Flask backend URL

export interface FridgeItem {
  entry_id: number;
  product_id: number;
  name: string;
  kategorie: string;
  einheit: string;
  bild_url: string;
  menge: number;
  haltbarkeit: string;
  lagerdatum: string;
}

export interface Fridge {
  fridge_id: number;
  user_id: number;
  title: string;
}

export interface Product {
  product_id: number;
  user_id: number;
  name: string;
  kategorie: string;
  bild_url: string;
  einheit: string;
  barcode_path: string;
}

export interface ShoppingListItem {
  id: number;
  product_id: number;
  name: string;
  kategorie: string;
  einheit: string;
  bild_url: string;
  menge: number;
  haltbarkeit: string;
  lagerdatum: string;
  fridge_id: number;
  fridge_title: string;
}

// Fridge operations
export const getFridgesByUser = async (userId: number): Promise<Fridge[]> => {
  try {
    const response = await axios.get(`${API_URL}/fridges/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fridges:', error);
    return [];
  }
};

export const getFridgeContents = async (fridgeId: number): Promise<FridgeItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/fridges/${fridgeId}/contents`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fridge contents:', error);
    return [];
  }
};

export const createFridge = async (userId: number, title: string): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/fridges/`, { user_id: userId, title });
    return true;
  } catch (error) {
    console.error('Failed to create fridge:', error);
    return false;
  }
};

export const updateFridge = async (fridgeId: number, title: string): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/fridges/${fridgeId}`, { title });
    return true;
  } catch (error) {
    console.error('Failed to update fridge:', error);
    return false;
  }
};

export const deleteFridge = async (fridgeId: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/fridges/${fridgeId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete fridge:', error);
    return false;
  }
};

// Product operations
export const getProductsByUser = async (userId: number): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const addProductToFridge = async (
  fridgeId: number,
  productId: number,
  menge: number,
  haltbarkeit?: string,
  lagerdatum?: string
): Promise<boolean> => {
  try {
    const data = {
      product_id: productId,
      menge,
      haltbarkeit: haltbarkeit || '',
      lagerdatum: lagerdatum || new Date().toISOString().split('T')[0]
    };
    await axios.post(`${API_URL}/fridges/${fridgeId}/store`, data);
    return true;
  } catch (error) {
    console.error('Failed to add product to fridge:', error);
    return false;
  }
};

export const removeProductFromFridge = async (fridgeId: number, productId: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/fridges/${fridgeId}/remove/${productId}`);
    return true;
  } catch (error) {
    console.error('Failed to remove product from fridge:', error);
    return false;
  }
};

export const updateFridgeItem = async (
  entryId: number, 
  menge: number, 
  haltbarkeit: string, 
  lagerdatum: string
): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/fridges/update_item/${entryId}`, {
      menge,
      haltbarkeit,
      lagerdatum
    });
    return true;
  } catch (error) {
    console.error('Failed to update fridge item:', error);
    return false;
  }
};

export const createProduct = async (
  userId: number,
  name: string,
  kategorie: string,
  einheit: string,
  bildUrl: string = '',
  barcodePath: string = ''
): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/products/`, {
      user_id: userId,
      name,
      kategorie,
      einheit,
      bild_url: bildUrl,
      barcode_path: barcodePath
    });
    return true;
  } catch (error) {
    console.error('Failed to create product:', error);
    return false;
  }
};

// Add the missing functions
export const getFridgeByDetail = async (fridgeId: number): Promise<Fridge | null> => {
  try {
    const response = await axios.get(`${API_URL}/fridges/${fridgeId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fridge details:', error);
    return null;
  }
};

export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/products/${productId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
};

export const updateProduct = async (
  productId: number,
  name: string,
  kategorie: string,
  einheit: string,
  bildUrl: string = '',
  barcodePath: string = ''
): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/products/${productId}`, {
      name,
      kategorie,
      einheit,
      bild_url: bildUrl,
      barcode_path: barcodePath
    });
    return true;
  } catch (error) {
    console.error('Failed to update product:', error);
    return false;
  }
};

// Shopping list operations - using local storage since no backend changes allowed
export const getShoppingLists = (): ShoppingListItem[] => {
  try {
    const lists = localStorage.getItem('shoppingLists');
    return lists ? JSON.parse(lists) : [];
  } catch (error) {
    console.error('Failed to get shopping lists:', error);
    return [];
  }
};

export const saveShoppingLists = (lists: ShoppingListItem[]): void => {
  try {
    localStorage.setItem('shoppingLists', JSON.stringify(lists));
  } catch (error) {
    console.error('Failed to save shopping lists:', error);
  }
};

export const addToShoppingList = (
  productId: number,
  name: string,
  kategorie: string,
  einheit: string,
  bildUrl: string,
  menge: number,
  haltbarkeit: string,
  fridgeId: number,
  fridgeTitle: string
): boolean => {
  try {
    const lists = getShoppingLists();
    const newItem: ShoppingListItem = {
      id: Date.now(),
      product_id: productId,
      name,
      kategorie,
      einheit,
      bild_url: bildUrl,
      menge,
      haltbarkeit,
      lagerdatum: new Date().toISOString().split('T')[0],
      fridge_id: fridgeId,
      fridge_title: fridgeTitle
    };
    
    lists.push(newItem);
    saveShoppingLists(lists);
    return true;
  } catch (error) {
    console.error('Failed to add to shopping list:', error);
    return false;
  }
};

export const removeFromShoppingList = (itemId: number): boolean => {
  try {
    const lists = getShoppingLists();
    const updatedLists = lists.filter(item => item.id !== itemId);
    saveShoppingLists(updatedLists);
    return true;
  } catch (error) {
    console.error('Failed to remove from shopping list:', error);
    return false;
  }
};

export const updateShoppingListItem = (
  itemId: number,
  menge: number,
  haltbarkeit: string
): boolean => {
  try {
    const lists = getShoppingLists();
    const itemIndex = lists.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      lists[itemIndex].menge = menge;
      lists[itemIndex].haltbarkeit = haltbarkeit;
      saveShoppingLists(lists);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update shopping list item:', error);
    return false;
  }
};

export const clearShoppingList = (): boolean => {
  try {
    saveShoppingLists([]);
    return true;
  } catch (error) {
    console.error('Failed to clear shopping list:', error);
    return false;
  }
};
