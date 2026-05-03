/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import EntryGate from './pages/EntryGate';
import ExitGate from './pages/ExitGate';
import CCTVMonitoring from './pages/CCTV';
import Configuration from './pages/Configuration';
import Hardware from './pages/Hardware';
import Branches from './pages/Branches';
import LiveMonitor from './pages/LiveMonitor';
import Users from './pages/Users';
import FareSettings from './pages/FareSettings';
import SystemIssues from './pages/SystemIssues';
import Members from './pages/Members';
import Employees from './pages/Employees';
import LoginPage from './pages/LoginPage';
import { ParkingProvider } from './hooks/useParking';
import { AuthProvider, useAuth } from './hooks/useAuth';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="monitor" 
                element={
                  <ProtectedRoute adminOnly>
                    <LiveMonitor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="hardware" 
                element={
                  <ProtectedRoute adminOnly>
                    <Hardware />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="branches" 
                element={
                  <ProtectedRoute adminOnly>
                    <Branches />
                  </ProtectedRoute>
                } 
              />
              <Route path="entry" element={<EntryGate />} />
              <Route path="exit" element={<ExitGate />} />
              <Route path="cctv" element={<CCTVMonitoring />} />
              <Route 
                path="members" 
                element={
                  <ProtectedRoute>
                    <Members />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="employees" 
                element={
                  <ProtectedRoute adminOnly>
                    <Employees />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute adminOnly>
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="fares" 
                element={
                  <ProtectedRoute adminOnly>
                    <FareSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="issues" 
                element={
                  <ProtectedRoute adminOnly>
                    <SystemIssues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="config" 
                element={
                  <ProtectedRoute adminOnly>
                    <Configuration />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ParkingProvider>
    </AuthProvider>
  );
}
