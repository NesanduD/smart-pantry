import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import IngredientScanner from './components/IngredientScanner';
import PantryList from './components/PantryList';
import Navbar from './components/Navbar';

function App() {
  // Check if we have a token to see if the user is logged in
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* The Navbar appears at the top */}
        <Navbar />
        
        {/* Main content area */}
        <main className="container mx-auto py-8">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes: Only accessible if logged in */}
            <Route 
              path="/scan" 
              element={isAuthenticated ? <IngredientScanner /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/pantry" 
              element={isAuthenticated ? <PantryList /> : <Navigate to="/login" />} 
            />

            {/* Default Route: Catch-all that redirects based on login status */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/scan" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;