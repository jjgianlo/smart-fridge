
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
