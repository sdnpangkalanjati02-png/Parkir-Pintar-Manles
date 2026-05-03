/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (newUser: User & { password: string }) => void;
  deleteUser: (id: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users for initial load
const DEFAULT_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Administrator', username: 'admin', role: 'admin', password: 'password123' },
  { id: '2', name: 'Karyawan Staff', username: 'karyawan', role: 'karyawan', password: 'password123' },
  { id: '3', name: 'Divisi Keuangan', username: 'keuangan', role: 'keuangan', password: 'password123' },
  { id: '4', name: 'Direktur Utama', username: 'direktur', role: 'direktur', password: 'password123' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load current session from localStorage (keep session locally for immediate UI, 
    // but we could also sync with Firebase Auth if we wanted)
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Sync Users list from Firestore
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User & { password: string }));
      
      if (usersData.length === 0) {
        // Initialize default users if collection is empty
        DEFAULT_USERS.forEach(async (u) => {
          await setDoc(doc(db, 'users', u.id), u).catch(console.error);
        });
      } else {
        setUsers(usersData);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check against synced users
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('parking_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parking_user');
  };

  const addUser = async (newUser: User & { password: string }) => {
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
