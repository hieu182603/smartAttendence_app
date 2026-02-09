import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../libs/axios';
import { AUTH_endpoints } from '../constants/api';
import { AuthResponse, User } from '../types/auth';
import { UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    userRole: UserRole | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Key for storage
const TOKEN_KEY = 'smartattendance_token';
const USER_KEY = 'smartattendance_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            const storedUser = await AsyncStorage.getItem(USER_KEY);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Optionally verify token with backend
                // const response = await api.get(AUTH_endpoints.ME);
                // setUser(response.data);
            }
        } catch (e) {
            console.log('Auth check error', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string, rememberMe?: boolean) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post<AuthResponse>(AUTH_endpoints.LOGIN, { email, password });
            const { user, token } = response.data;

            console.log('Login success:', user.email);

            setToken(token);
            setUser(user);

            await AsyncStorage.setItem(TOKEN_KEY, token);
            if (rememberMe) {
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            } else {
                // If not remember me, we might still want to persist user for the session
                // But here we'll persist it to survive app reload during dev
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            }

        } catch (err: any) {
            console.error('Login error', err.response?.data || err.message);
            const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
            setError(msg);
            throw new Error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
        } catch (e) {
            console.log('Logout error', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userRole: user?.role || null, // Derived from user
            token,
            isLoading,
            error,
            login,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
