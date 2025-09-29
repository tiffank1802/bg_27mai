import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            📚 Bibliogest
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre système de gestion de bibliothèque moderne. 
            Découvrez, empruntez et gérez votre collection de livres en toute simplicité.
          </p>
          
          {!user ? (
            <div className="space-x-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                Commencer maintenant
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3 inline-block"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/catalog"
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                Explorer le catalogue
              </Link>
              {user.roles.includes('ROLE_ADMIN') && (
                <Link
                  to="/admin"
                  className="btn-secondary text-lg px-8 py-3 inline-block"
                >
                  Dashboard Admin
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">Catalogue Complet</h3>
            <p className="text-gray-600">
              Explorez notre vaste collection de livres avec des informations détaillées 
              sur les auteurs, éditeurs et disponibilité.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Avis et Commentaires</h3>
            <p className="text-gray-600">
              Partagez vos impressions et découvrez les avis d'autres lecteurs 
              pour enrichir votre expérience de lecture.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Gestion Simplifiée</h3>
            <p className="text-gray-600">
              Interface d'administration intuitive pour gérer les livres, 
              auteurs, éditeurs et modérer les commentaires.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Bibliogest en chiffres
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600 mt-2">Livres disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 mt-2">Auteurs référencés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 mt-2">Éditeurs partenaires</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600 mt-2">Accès en ligne</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;