
// API services for user-related operations
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Your Flask backend URL

export interface User {
  user_id: number;
  username: string;
  email: string;
}

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // First, find the username based on email and password
    // In a real app with proper authentication, this would be a POST to a login endpoint
    // For now, we'll use the email as username since the backend expects username parameter
    const username = email.split('@')[0]; // Simple extraction of username from email
    
    // Call the endpoint to get user by username
    const response = await axios.get(`${API_URL}/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

export const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/users/`, {
      username,
      email,
      password_hash: password // In a real app, you'd hash this on the client
    });
    return true;
  } catch (error) {
    console.error('Registration failed:', error);
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('user');
  if (userString) {
    return JSON.parse(userString);
  }
  return null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem('user');
};
