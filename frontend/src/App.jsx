import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IngredientScanner from './components/IngredientScanner';
import PantryList from './components/PantryList';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token')
  );

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-shell text-slate-900">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        
        <main className="page-wrap py-8 md:py-12">
          <Routes>
            {/* Unified Auth Route */}
            <Route
              path="/login"
              element={<Auth onLogin={() => setIsAuthenticated(true)} />}
            />

            {/* Protected Routes */}
            <Route 
              path="/scan" 
              element={isAuthenticated ? <IngredientScanner /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/pantry" 
              element={isAuthenticated ? <PantryList /> : <Navigate to="/login" />} 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={<Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;