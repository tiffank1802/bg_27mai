import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold text-blue-400 hover:text-blue-300 transition"
          >
            📚 Bibliogest
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/catalog" 
              className="hover:text-blue-300 transition"
            >
              Catalogue
            </Link>
            
            {user ? (
              <>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="hover:text-blue-300 transition"
                  >
                    Dashboard Admin
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    👤 {user.firstname} {user.lastname}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="hover:text-blue-300 transition"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center"
          >
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
            }`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
            }`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-700 pb-4">
            <Link 
              to="/catalog" 
              className="block px-4 py-2 hover:bg-gray-600"
              onClick={() => setIsOpen(false)}
            >
              Catalogue
            </Link>
            
            {user ? (
              <>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard Admin
                  </Link>
                )}
                
                <div className="px-4 py-2 text-sm text-gray-300">
                  👤 {user.firstname} {user.lastname}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-red-400"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;