import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      available: 'status-available',
      borrowed: 'status-borrowed',
      unavailable: 'status-unavailable'
    };

    const statusLabels = {
      available: 'Disponible',
      borrowed: 'Emprunté',
      unavailable: 'Indisponible'
    };

    return (
      <span className={statusClasses[status] || 'status-unavailable'}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="card book-card">
      {/* Book Cover */}
      <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            📖
          </div>
        )}
        <div className="absolute top-4 right-4">
          {getStatusBadge(book.status)}
        </div>
      </div>

      {/* Book Info */}
      <div className="card-body">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Auteur(s):</span>
            {book.authors && book.authors.length > 0 ? (
              <span className="ml-1">
                {book.authors.map(author => author.name).join(', ')}
              </span>
            ) : (
              <span className="ml-1 italic">Non renseigné</span>
            )}
          </div>
          
          {book.editor && (
            <div>
              <span className="font-medium">Éditeur:</span>
              <span className="ml-1">{book.editor.name}</span>
            </div>
          )}
          
          <div>
            <span className="font-medium">ISBN:</span>
            <span className="ml-1">{book.isbn}</span>
          </div>
          
          {book.page_number && (
            <div>
              <span className="font-medium">Pages:</span>
              <span className="ml-1">{book.page_number}</span>
            </div>
          )}
          
          {book.comments_count > 0 && (
            <div>
              <span className="font-medium">Commentaires:</span>
              <span className="ml-1">{book.comments_count}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link
            to={`/books/${book.id}`}
            className="btn-primary w-full text-center inline-block"
          >
            Voir les détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;