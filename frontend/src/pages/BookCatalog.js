import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { booksApi } from '../services/api';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, statusFilter]);

  const fetchBooks = async () => {
    try {
      const response = await booksApi.getAll();
      setBooks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.authors && book.authors.some(author => 
          author.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (book.editor && book.editor.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(book => book.status === statusFilter);
    }

    setFilteredBooks(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Chargement du catalogue..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 Catalogue des livres
        </h1>
        <p className="text-lg text-gray-600">
          Découvrez notre collection de {books.length} livres
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="form-label">
              Rechercher un livre
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Titre, auteur, ISBN, éditeur..."
              className="form-input"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="form-label">
              Filtrer par disponibilité
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={handleStatusChange}
              className="form-input"
            >
              <option value="all">Tous les livres</option>
              <option value="available">Disponibles</option>
              <option value="borrowed">Empruntés</option>
              <option value="unavailable">Indisponibles</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredBooks.length} livre(s) trouvé(s)
          {searchTerm && ` pour "${searchTerm}"`}
          {statusFilter !== 'all' && ` (${statusFilter})`}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Le catalogue est actuellement vide'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;