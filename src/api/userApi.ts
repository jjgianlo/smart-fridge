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
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password
    });
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
      password: password // In a real app, you'd hash this on the client
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
