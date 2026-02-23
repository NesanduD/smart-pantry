import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // Check if the user is logged in by looking for the token
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    // Clear the saved login data
    localStorage.clear();
    // Redirect back to the login page
    navigate('/login');
  };

  // If there is no token (user is not logged in), don't show the Navbar
  if (!token) return null;

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* The Logo / App Name */}
        <h1 className="text-2xl font-bold text-green-400">SmartPantry</h1>
        
        {/* Navigation Links */}
        <div className="flex space-x-6 items-center">
          <Link to="/scan" className="hover:text-green-300 transition font-medium">
            Scan Food
          </Link>
          <Link to="/pantry" className="hover:text-green-300 transition font-medium">
            My Pantry
          </Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;