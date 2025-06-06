import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';

import Login from "./pages/Login";
import Signup from "./pages/Signup"; 
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/Tasks";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/drivers" 
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Use NotFound component for 404 pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
