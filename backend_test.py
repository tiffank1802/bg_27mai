#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Bibliogest API
Tests all endpoints and creates sample data as requested
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# Configuration
BASE_URL = "http://localhost:8001"
API_BASE = f"{BASE_URL}/api"

class BibliogestTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.sample_data = {
            'editors': [],
            'authors': [],
            'books': [],
            'comments': []
        }
        
    def log(self, message, level="INFO"):
        """Log test messages"""
        print(f"[{level}] {message}")
        
    def test_health_check(self):
        """Test API health endpoint"""
        self.log("Testing API Health Check...")
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Health check passed: {data}")
                return True
            else:
                self.log(f"❌ Health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Health check error: {str(e)}", "ERROR")
            return False
    
    def register_user(self, email, password, firstname, lastname, username=None):
        """Register a new user"""
        user_data = {
            "email": email,
            "password": password,
            "firstname": firstname,
            "lastname": lastname
        }
        if username:
            user_data["username"] = username
            
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            if response.status_code == 200:
                user = response.json()
                self.log(f"✅ User registered: {user['email']}")
                return user
            else:
                self.log(f"❌ Registration failed for {email}: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Registration error for {email}: {str(e)}", "ERROR")
            return None
    
    def login_user(self, email, password):
        """Login user and return token"""
        login_data = {
            "email": email,
            "password": password
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                token_data = response.json()
                token = token_data["access_token"]
                self.log(f"✅ Login successful for {email}")
                return token
            else:
                self.log(f"❌ Login failed for {email}: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Login error for {email}: {str(e)}", "ERROR")
            return None
    
    def test_protected_route(self, token):
        """Test protected route with token"""
        headers = {"Authorization": f"Bearer {token}"}
        try:
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            if response.status_code == 200:
                user = response.json()
                self.log(f"✅ Protected route access successful for user: {user['email']}")
                return user
            else:
                self.log(f"❌ Protected route failed: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Protected route error: {str(e)}", "ERROR")
            return None
    
    def create_editor(self, name, token):
        """Create an editor"""
        headers = {"Authorization": f"Bearer {token}"}
        editor_data = {"name": name}
        
        try:
            response = self.session.post(f"{API_BASE}/editors", json=editor_data, headers=headers)
            if response.status_code == 200:
                editor = response.json()
                self.log(f"✅ Editor created: {editor['name']}")
                self.sample_data['editors'].append(editor)
                return editor
            else:
                self.log(f"❌ Editor creation failed for {name}: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Editor creation error for {name}: {str(e)}", "ERROR")
            return None
    
    def create_author(self, name, date_of_birth, nationality, token, date_of_death=None):
        """Create an author"""
        headers = {"Authorization": f"Bearer {token}"}
        author_data = {
            "name": name,
            "date_of_birth": date_of_birth,
            "nationality": nationality
        }
        if date_of_death:
            author_data["date_of_death"] = date_of_death
            
        try:
            response = self.session.post(f"{API_BASE}/authors", json=author_data, headers=headers)
            if response.status_code == 200:
                author = response.json()
                self.log(f"✅ Author created: {author['name']}")
                self.sample_data['authors'].append(author)
                return author
            else:
                self.log(f"❌ Author creation failed for {name}: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Author creation error for {name}: {str(e)}", "ERROR")
            return None
    
    def create_book(self, title, isbn, cover, plot, page_number, status, editor_id, author_ids, token):
        """Create a book"""
        headers = {"Authorization": f"Bearer {token}"}
        book_data = {
            "title": title,
            "isbn": isbn,
            "cover": cover,
            "plot": plot,
            "page_number": page_number,
            "status": status,
            "editor_id": editor_id,
            "author_ids": author_ids
        }
        
        try:
            response = self.session.post(f"{API_BASE}/books", json=book_data, headers=headers)
            if response.status_code == 200:
                book = response.json()
                self.log(f"✅ Book created: {book['title']}")
                self.sample_data['books'].append(book)
                return book
            else:
                self.log(f"❌ Book creation failed for {title}: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Book creation error for {title}: {str(e)}", "ERROR")
            return None
    
    def create_comment(self, book_id, name, email, content):
        """Create a comment on a book"""
        comment_data = {
            "name": name,
            "email": email,
            "content": content,
            "book_id": book_id
        }
        
        try:
            response = self.session.post(f"{API_BASE}/books/{book_id}/comments", json=comment_data)
            if response.status_code == 200:
                comment = response.json()
                self.log(f"✅ Comment created by {name} on book {book_id}")
                self.sample_data['comments'].append(comment)
                return comment
            else:
                self.log(f"❌ Comment creation failed: {response.status_code} - {response.text}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Comment creation error: {str(e)}", "ERROR")
            return None
    
    def get_books(self):
        """Get all books"""
        try:
            response = self.session.get(f"{API_BASE}/books")
            if response.status_code == 200:
                books = response.json()
                self.log(f"✅ Retrieved {len(books)} books")
                return books
            else:
                self.log(f"❌ Failed to get books: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Get books error: {str(e)}", "ERROR")
            return None
    
    def get_book_details(self, book_id):
        """Get book details"""
        try:
            response = self.session.get(f"{API_BASE}/books/{book_id}")
            if response.status_code == 200:
                book = response.json()
                self.log(f"✅ Retrieved book details: {book['title']}")
                return book
            else:
                self.log(f"❌ Failed to get book {book_id}: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Get book details error: {str(e)}", "ERROR")
            return None
    
    def get_book_comments(self, book_id):
        """Get comments for a book"""
        try:
            response = self.session.get(f"{API_BASE}/books/{book_id}/comments")
            if response.status_code == 200:
                comments = response.json()
                self.log(f"✅ Retrieved {len(comments)} comments for book {book_id}")
                return comments
            else:
                self.log(f"❌ Failed to get comments for book {book_id}: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Get book comments error: {str(e)}", "ERROR")
            return None
    
    def get_authors(self):
        """Get all authors"""
        try:
            response = self.session.get(f"{API_BASE}/authors")
            if response.status_code == 200:
                authors = response.json()
                self.log(f"✅ Retrieved {len(authors)} authors")
                return authors
            else:
                self.log(f"❌ Failed to get authors: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Get authors error: {str(e)}", "ERROR")
            return None
    
    def get_editors(self):
        """Get all editors"""
        try:
            response = self.session.get(f"{API_BASE}/editors")
            if response.status_code == 200:
                editors = response.json()
                self.log(f"✅ Retrieved {len(editors)} editors")
                return editors
            else:
                self.log(f"❌ Failed to get editors: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"❌ Get editors error: {str(e)}", "ERROR")
            return None
    
    def test_validation_errors(self):
        """Test API validation with invalid data"""
        self.log("Testing validation errors...")
        
        # Test invalid registration
        invalid_user = {
            "email": "invalid-email",
            "password": "123",
            "firstname": "",
            "lastname": ""
        }
        response = self.session.post(f"{API_BASE}/auth/register", json=invalid_user)
        if response.status_code != 200:
            self.log("✅ Invalid user registration properly rejected")
        else:
            self.log("❌ Invalid user registration was accepted", "ERROR")
        
        # Test unauthorized access
        response = self.session.get(f"{API_BASE}/auth/me")
        if response.status_code == 401:
            self.log("✅ Unauthorized access properly rejected")
        else:
            self.log("❌ Unauthorized access was allowed", "ERROR")
    
    def create_sample_data(self):
        """Create comprehensive sample data"""
        self.log("Creating sample data...")
        
        if not self.admin_token:
            self.log("❌ No admin token available for creating sample data", "ERROR")
            return False
        
        # Create editors
        editors_data = [
            "Gallimard",
            "Flammarion", 
            "Le Seuil",
            "Albin Michel"
        ]
        
        for editor_name in editors_data:
            self.create_editor(editor_name, self.admin_token)
        
        # Create authors
        authors_data = [
            ("Victor Hugo", "1802-02-26T00:00:00", "Française", "1885-05-22T00:00:00"),
            ("Marcel Proust", "1871-07-10T00:00:00", "Française", "1922-11-18T00:00:00"),
            ("Albert Camus", "1913-11-07T00:00:00", "Française", "1960-01-04T00:00:00"),
            ("Simone de Beauvoir", "1908-01-09T00:00:00", "Française", "1986-04-14T00:00:00"),
            ("Jean-Paul Sartre", "1905-06-21T00:00:00", "Française", "1980-04-15T00:00:00"),
            ("Marguerite Duras", "1914-04-04T00:00:00", "Française", "1996-03-03T00:00:00")
        ]
        
        for name, birth, nationality, death in authors_data:
            self.create_author(name, birth, nationality, self.admin_token, death)
        
        # Create books (only if we have editors and authors)
        if len(self.sample_data['editors']) > 0 and len(self.sample_data['authors']) > 0:
            books_data = [
                {
                    "title": "Les Misérables",
                    "isbn": "978-2-07-036194-1",
                    "cover": "https://example.com/covers/les-miserables.jpg",
                    "plot": "L'histoire de Jean Valjean, ancien forçat en quête de rédemption dans la France du XIXe siècle.",
                    "page_number": 1232,
                    "status": "available",
                    "author_names": ["Victor Hugo"]
                },
                {
                    "title": "À la recherche du temps perdu",
                    "isbn": "978-2-07-010907-8",
                    "cover": "https://example.com/covers/recherche-temps-perdu.jpg",
                    "plot": "Une œuvre monumentale sur la mémoire, le temps et l'art.",
                    "page_number": 3200,
                    "status": "available",
                    "author_names": ["Marcel Proust"]
                },
                {
                    "title": "L'Étranger",
                    "isbn": "978-2-07-036002-9",
                    "cover": "https://example.com/covers/etranger.jpg",
                    "plot": "L'histoire de Meursault, un homme indifférent face à l'absurdité de l'existence.",
                    "page_number": 186,
                    "status": "available",
                    "author_names": ["Albert Camus"]
                },
                {
                    "title": "Le Deuxième Sexe",
                    "isbn": "978-2-07-020717-4",
                    "cover": "https://example.com/covers/deuxieme-sexe.jpg",
                    "plot": "Essai fondamental sur la condition féminine et l'égalité des sexes.",
                    "page_number": 722,
                    "status": "borrowed",
                    "author_names": ["Simone de Beauvoir"]
                },
                {
                    "title": "La Nausée",
                    "isbn": "978-2-07-036003-6",
                    "cover": "https://example.com/covers/nausee.jpg",
                    "plot": "Roman philosophique sur l'existence et l'angoisse existentielle.",
                    "page_number": 253,
                    "status": "available",
                    "author_names": ["Jean-Paul Sartre"]
                },
                {
                    "title": "L'Amant",
                    "isbn": "978-2-07-037084-4",
                    "cover": "https://example.com/covers/amant.jpg",
                    "plot": "Récit autobiographique sur l'amour et la jeunesse en Indochine.",
                    "page_number": 142,
                    "status": "available",
                    "author_names": ["Marguerite Duras"]
                },
                {
                    "title": "La Peste",
                    "isbn": "978-2-07-036001-2",
                    "cover": "https://example.com/covers/peste.jpg",
                    "plot": "Allégorie de la condition humaine face à l'épidémie qui frappe Oran.",
                    "page_number": 329,
                    "status": "unavailable",
                    "author_names": ["Albert Camus"]
                },
                {
                    "title": "Notre-Dame de Paris",
                    "isbn": "978-2-07-036195-8",
                    "cover": "https://example.com/covers/notre-dame.jpg",
                    "plot": "Roman historique se déroulant dans le Paris médiéval autour de la cathédrale.",
                    "page_number": 635,
                    "status": "available",
                    "author_names": ["Victor Hugo"]
                }
            ]
            
            for book_data in books_data:
                # Find author IDs
                author_ids = []
                for author_name in book_data["author_names"]:
                    for author in self.sample_data['authors']:
                        if author['name'] == author_name:
                            author_ids.append(author['id'])
                            break
                
                # Use first editor
                editor_id = self.sample_data['editors'][0]['id']
                
                if author_ids:
                    self.create_book(
                        book_data["title"],
                        book_data["isbn"],
                        book_data["cover"],
                        book_data["plot"],
                        book_data["page_number"],
                        book_data["status"],
                        editor_id,
                        author_ids,
                        self.admin_token
                    )
        
        # Create sample comments
        if len(self.sample_data['books']) > 0:
            comments_data = [
                {
                    "name": "Marie Dubois",
                    "email": "marie.dubois@example.fr",
                    "content": "Un chef-d'œuvre intemporel qui nous rappelle l'importance de la compassion et de la justice sociale."
                },
                {
                    "name": "Pierre Martin",
                    "email": "pierre.martin@example.fr", 
                    "content": "Une lecture difficile mais enrichissante. L'écriture de Proust est d'une beauté saisissante."
                },
                {
                    "name": "Sophie Laurent",
                    "email": "sophie.laurent@example.fr",
                    "content": "Un roman qui marque profondément. Camus nous confronte à nos propres questionnements existentiels."
                },
                {
                    "name": "Jean Moreau",
                    "email": "jean.moreau@example.fr",
                    "content": "Texte fondateur du féminisme moderne. Toujours d'actualité aujourd'hui."
                }
            ]
            
            # Add comments to different books
            for i, comment_data in enumerate(comments_data):
                if i < len(self.sample_data['books']):
                    book_id = self.sample_data['books'][i]['id']
                    self.create_comment(
                        book_id,
                        comment_data["name"],
                        comment_data["email"],
                        comment_data["content"]
                    )
        
        return True
    
    def run_comprehensive_tests(self):
        """Run all tests"""
        self.log("=== STARTING COMPREHENSIVE BIBLIOGEST API TESTS ===")
        
        # 1. Health check
        if not self.test_health_check():
            return False
        
        # 2. User registration
        self.log("\n=== TESTING USER REGISTRATION ===")
        admin_user = self.register_user(
            "admin@bibliogest.fr", 
            "password123", 
            "Admin", 
            "User", 
            "admin"
        )
        
        regular_user = self.register_user(
            "user@bibliogest.fr",
            "password123",
            "Regular",
            "User",
            "user"
        )
        
        if not admin_user or not regular_user:
            self.log("❌ User registration failed", "ERROR")
            return False
        
        # 3. User authentication
        self.log("\n=== TESTING USER AUTHENTICATION ===")
        self.admin_token = self.login_user("admin@bibliogest.fr", "password123")
        self.user_token = self.login_user("user@bibliogest.fr", "password123")
        
        if not self.admin_token or not self.user_token:
            self.log("❌ User authentication failed", "ERROR")
            return False
        
        # 4. Test protected routes
        self.log("\n=== TESTING PROTECTED ROUTES ===")
        admin_profile = self.test_protected_route(self.admin_token)
        user_profile = self.test_protected_route(self.user_token)
        
        if not admin_profile or not user_profile:
            self.log("❌ Protected route access failed", "ERROR")
            return False
        
        # 5. Create sample data
        self.log("\n=== CREATING SAMPLE DATA ===")
        if not self.create_sample_data():
            self.log("❌ Sample data creation failed", "ERROR")
            return False
        
        # 6. Test CRUD operations
        self.log("\n=== TESTING CRUD OPERATIONS ===")
        
        # Test getting all entities
        books = self.get_books()
        authors = self.get_authors()
        editors = self.get_editors()
        
        if books is None or authors is None or editors is None:
            self.log("❌ CRUD operations failed", "ERROR")
            return False
        
        # Test book details and comments
        if len(self.sample_data['books']) > 0:
            first_book = self.sample_data['books'][0]
            book_details = self.get_book_details(first_book['id'])
            book_comments = self.get_book_comments(first_book['id'])
            
            if book_details is None or book_comments is None:
                self.log("❌ Book details/comments retrieval failed", "ERROR")
                return False
        
        # 7. Test validation errors
        self.log("\n=== TESTING VALIDATION ERRORS ===")
        self.test_validation_errors()
        
        # 8. Summary
        self.log("\n=== TEST SUMMARY ===")
        self.log(f"✅ Created {len(self.sample_data['editors'])} editors")
        self.log(f"✅ Created {len(self.sample_data['authors'])} authors")
        self.log(f"✅ Created {len(self.sample_data['books'])} books")
        self.log(f"✅ Created {len(self.sample_data['comments'])} comments")
        
        self.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===")
        return True

def main():
    """Main test execution"""
    tester = BibliogestTester()
    
    try:
        success = tester.run_comprehensive_tests()
        if success:
            print("\n🎉 All tests passed! Bibliogest API is working correctly.")
            sys.exit(0)
        else:
            print("\n💥 Some tests failed. Check the logs above.")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()