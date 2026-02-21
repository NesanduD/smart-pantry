import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IngredientScanner from './components/IngredientScanner';
import PantryList from './components/PantryList';
import Navbar from './components/Navbar';
import Auth from './components/Auth';

function App() {
  // Check if we have a token to see if the user is logged in
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        
        <main className="container mx-auto py-8">
          <Routes>
            {/* Unified Auth Route */}
            <Route path="/login" element={<Auth />} />

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