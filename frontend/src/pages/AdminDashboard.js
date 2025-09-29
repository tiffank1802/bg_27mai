import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { booksApi, authorsApi, editorsApi, commentsApi } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    books: 0,
    authors: 0,
    editors: 0,
    comments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [booksRes, authorsRes, editorsRes] = await Promise.all([
        booksApi.getAll(),
        authorsApi.getAll(),
        editorsApi.getAll()
      ]);

      setStats({
        books: booksRes.data.length,
        authors: authorsRes.data.length,
        editors: editorsRes.data.length,
        comments: 0 // Will be calculated from books
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Chargement du dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-gray-600">
          Gérez votre bibliothèque depuis cette interface d'administration
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-500 mr-4">📚</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.books}</div>
              <div className="text-gray-600">Livres</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-500 mr-4">✍️</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.authors}</div>
              <div className="text-gray-600">Auteurs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-purple-500 mr-4">🏢</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.editors}</div>
              <div className="text-gray-600">Éditeurs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-yellow-500 mr-4">💬</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.comments}</div>
              <div className="text-gray-600">Commentaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="btn-primary p-4 text-left">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">Ajouter un livre</div>
            <div className="text-sm opacity-75">Créer une nouvelle entrée</div>
          </button>

          <button className="btn-secondary p-4 text-left">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium">Gérer les auteurs</div>
            <div className="text-sm opacity-75">Ajouter/modifier des auteurs</div>
          </button>

          <button className="btn-success p-4 text-left">
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-medium">Gérer les éditeurs</div>
            <div className="text-sm opacity-75">Ajouter/modifier des éditeurs</div>
          </button>

          <button className="btn-secondary p-4 text-left">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-medium">Modérer commentaires</div>
            <div className="text-sm opacity-75">Approuver/rejeter des avis</div>
          </button>

          <button className="btn-secondary p-4 text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Statistiques</div>
            <div className="text-sm opacity-75">Voir les rapports détaillés</div>
          </button>

          <button className="btn-secondary p-4 text-left">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium">Paramètres</div>
            <div className="text-sm opacity-75">Configuration système</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité récente</h2>
        
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>Interface d'administration complète en cours de développement</p>
          <p className="text-sm mt-2">Les fonctionnalités CRUD complètes seront ajoutées dans la prochaine version</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;