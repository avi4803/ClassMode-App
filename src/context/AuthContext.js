import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { requestUserPermission, getFcmToken } from '../utils/notification-helper';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync FCM token when user logs in or app starts with a token
  useEffect(() => {
    if (userToken) {
      const setupNotifications = async () => {
        try {
          const hasPermission = await requestUserPermission();
          if (hasPermission) {
            await getFcmToken(userToken);
          }
        } catch (error) {
          console.error("Error setting up notifications in AuthContext:", error);
        }
      };
      setupNotifications();
    }
  }, [userToken]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log("Login Response in Context:", response);
      if (response.success && response.data) {
        const token = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        setUserToken(response.data);
        try {
          await AsyncStorage.setItem('userToken', token);
        } catch (storageError) {
          console.log("AsyncStorage Error:", storageError);
        }
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      let userToken = await AsyncStorage.getItem('userToken');
      setUserToken(userToken);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};
