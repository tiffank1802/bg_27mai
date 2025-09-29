import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { booksApi, commentsApi } from '../services/api';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchComments();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await booksApi.getById(id);
      setBook(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Livre non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getByBookId(id);
      // Filter only published comments for public view
      const publishedComments = response.data.filter(comment => 
        comment.status.includes('published')
      );
      setComments(publishedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);

    try {
      await commentsApi.create(id, commentForm);
      setCommentForm({ name: '', email: '', content: '' });
      // Don't refresh comments since new comment will be pending
      alert('Votre commentaire a été soumis et est en attente de modération.');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    });
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Chargement du livre..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
        <Link to="/catalog" className="btn-primary">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/catalog" className="text-blue-600 hover:text-blue-500">
          Catalogue
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg aspect-[3/4] flex items-center justify-center text-white text-8xl shadow-lg">
            {book.cover ? (
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              '📖'
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mr-4">
                {book.title}
              </h1>
              {getStatusBadge(book.status)}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">Auteur(s):</span>
                  {book.authors && book.authors.length > 0 ? (
                    <div className="mt-1">
                      {book.authors.map((author, index) => (
                        <div key={author.id} className="text-gray-900">
                          {author.name}
                          {author.nationality && (
                            <span className="text-gray-500 ml-1">
                              ({author.nationality})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Non renseigné</p>
                  )}
                </div>

                {book.editor && (
                  <div>
                    <span className="font-semibold text-gray-700">Éditeur:</span>
                    <p className="text-gray-900">{book.editor.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">ISBN:</span>
                  <p className="text-gray-900 font-mono">{book.isbn}</p>
                </div>

                {book.page_number && (
                  <div>
                    <span className="font-semibold text-gray-700">Pages:</span>
                    <p className="text-gray-900">{book.page_number}</p>
                  </div>
                )}

                {book.edited_at && (
                  <div>
                    <span className="font-semibold text-gray-700">Date d'édition:</span>
                    <p className="text-gray-900">
                      {new Date(book.edited_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Plot */}
            {book.plot && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Résumé
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {book.plot}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Commentaires ({comments.length})
        </h2>

        {/* Comment Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ajouter un commentaire
          </h3>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={commentForm.name}
                  onChange={handleCommentChange}
                  required
                  className="form-input"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={commentForm.email}
                  onChange={handleCommentChange}
                  required
                  className="form-input"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="form-label">
                Commentaire
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                value={commentForm.content}
                onChange={handleCommentChange}
                required
                className="form-input"
                placeholder="Partagez votre avis sur ce livre..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingComment}
              className="btn-primary disabled:opacity-50"
            >
              {submittingComment ? 'Envoi...' : 'Publier le commentaire'}
            </button>
          </form>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-600">
              Aucun commentaire pour l'instant. Soyez le premier à partager votre avis !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;