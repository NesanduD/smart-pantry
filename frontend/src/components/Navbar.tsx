import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="border-b border-slate-200/80 bg-[#fbfcf8]/90 px-5 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-6">
        <Link to="/scan" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9f36a] text-xl shadow-[4px_4px_0_#18231f]">✦</span>
          <span className="display-font text-2xl font-bold tracking-tight text-[#18231f]">SmartPantry</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 md:gap-5">
          <Link to="/scan" className="rounded-full px-3 py-2 transition hover:bg-[#edf5df] hover:text-[#18231f]">
            Scan Food
          </Link>
          <Link to="/pantry" className="rounded-full px-3 py-2 transition hover:bg-[#edf5df] hover:text-[#18231f]">
            My Pantry
          </Link>
          <button 
            onClick={handleLogout} 
            className="rounded-full bg-[#ff594d] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_#b92e2a] transition hover:translate-y-0.5 hover:shadow-[1px_1px_0_#b92e2a]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;