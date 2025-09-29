from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
import os
import uuid

# Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/bibliogest')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# Initialize FastAPI
app = FastAPI(title="Bibliogest API", description="Library Management System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = MongoClient(MONGO_URL)
db = client.bibliogest

# Security
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception as e:
    # Fallback to a simpler hashing scheme if bcrypt fails
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    firstname: str
    lastname: str
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    roles: List[str] = ["ROLE_USER"]
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthorBase(BaseModel):
    name: str
    date_of_birth: datetime
    date_of_death: Optional[datetime] = None
    nationality: Optional[str] = None

class AuthorCreate(AuthorBase):
    pass

class AuthorResponse(AuthorBase):
    id: str
    books: List[str] = []  # List of book IDs

class EditorBase(BaseModel):
    name: str

class EditorCreate(EditorBase):
    pass

class EditorResponse(EditorBase):
    id: str

class BookBase(BaseModel):
    title: str
    isbn: str
    cover: str
    plot: Optional[str] = None
    page_number: int
    status: str  # available, borrowed, unavailable
    editor_id: str
    author_ids: List[str] = []

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: str
    edited_at: datetime
    authors: List[AuthorResponse] = []
    editor: Optional[EditorResponse] = None
    comments_count: int = 0

class CommentBase(BaseModel):
    name: str
    email: EmailStr
    content: str

class CommentCreate(CommentBase):
    book_id: str

class CommentResponse(CommentBase):
    id: str
    book_id: str
    status: List[str] = ["pending"]  # pending, published, moderated
    created_at: datetime
    published_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Utility functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_data = {
        "_id": str(uuid.uuid4()),
        "email": user.email,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "username": user.username or f"{user.firstname.lower()}.{user.lastname.lower()}",
        "password": get_password_hash(user.password),
        "roles": ["ROLE_USER"],
        "created_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(user_data)
    user_data["id"] = user_data.pop("_id")
    user_data.pop("password")
    
    return UserResponse(**user_data)

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user["_id"]})
    return Token(access_token=access_token)

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user_data = current_user.copy()
    user_data["id"] = user_data.pop("_id")
    user_data.pop("password", None)
    return UserResponse(**user_data)

# Authors endpoints
@app.post("/api/authors", response_model=AuthorResponse)
async def create_author(author: AuthorCreate, current_user: dict = Depends(get_current_user)):
    author_data = {
        "_id": str(uuid.uuid4()),
        **author.dict(),
        "books": []
    }
    
    result = db.authors.insert_one(author_data)
    author_data["id"] = author_data.pop("_id")
    
    return AuthorResponse(**author_data)

@app.get("/api/authors", response_model=List[AuthorResponse])
async def get_authors():
    authors = []
    for author in db.authors.find():
        author["id"] = author.pop("_id")
        authors.append(AuthorResponse(**author))
    return authors

@app.get("/api/authors/{author_id}", response_model=AuthorResponse)
async def get_author(author_id: str):
    author = db.authors.find_one({"_id": author_id})
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    author["id"] = author.pop("_id")
    return AuthorResponse(**author)

# Editors endpoints
@app.post("/api/editors", response_model=EditorResponse)
async def create_editor(editor: EditorCreate, current_user: dict = Depends(get_current_user)):
    editor_data = {
        "_id": str(uuid.uuid4()),
        **editor.dict()
    }
    
    result = db.editors.insert_one(editor_data)
    editor_data["id"] = editor_data.pop("_id")
    
    return EditorResponse(**editor_data)

@app.get("/api/editors", response_model=List[EditorResponse])
async def get_editors():
    editors = []
    for editor in db.editors.find():
        editor["id"] = editor.pop("_id")
        editors.append(EditorResponse(**editor))
    return editors

# Books endpoints
@app.post("/api/books", response_model=BookResponse)
async def create_book(book: BookCreate, current_user: dict = Depends(get_current_user)):
    # Verify editor exists
    editor = db.editors.find_one({"_id": book.editor_id})
    if not editor:
        raise HTTPException(status_code=400, detail="Editor not found")
    
    # Verify authors exist
    for author_id in book.author_ids:
        author = db.authors.find_one({"_id": author_id})
        if not author:
            raise HTTPException(status_code=400, detail=f"Author {author_id} not found")
    
    book_data = {
        "_id": str(uuid.uuid4()),
        **book.dict(),
        "edited_at": datetime.utcnow()
    }
    
    result = db.books.insert_one(book_data)
    
    # Update author's books list
    for author_id in book.author_ids:
        db.authors.update_one(
            {"_id": author_id},
            {"$addToSet": {"books": book_data["_id"]}}
        )
    
    return await get_book(book_data["_id"])

@app.get("/api/books", response_model=List[BookResponse])
async def get_books():
    books = []
    for book in db.books.find():
        book_response = await _build_book_response(book)
        books.append(book_response)
    return books

@app.get("/api/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    book = db.books.find_one({"_id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return await _build_book_response(book)

async def _build_book_response(book: dict) -> BookResponse:
    # Get authors
    authors = []
    for author_id in book.get("author_ids", []):
        author = db.authors.find_one({"_id": author_id})
        if author:
            author["id"] = author.pop("_id")
            authors.append(AuthorResponse(**author))
    
    # Get editor
    editor = None
    if book.get("editor_id"):
        editor_doc = db.editors.find_one({"_id": book["editor_id"]})
        if editor_doc:
            editor_doc["id"] = editor_doc.pop("_id")
            editor = EditorResponse(**editor_doc)
    
    # Count comments
    comments_count = db.comments.count_documents({"book_id": book["_id"]})
    
    book["id"] = book.pop("_id")
    book["authors"] = authors
    book["editor"] = editor
    book["comments_count"] = comments_count
    
    return BookResponse(**book)

# Comments endpoints
@app.post("/api/books/{book_id}/comments", response_model=CommentResponse)
async def create_comment(book_id: str, comment: CommentCreate):
    # Verify book exists
    book = db.books.find_one({"_id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    comment_data = {
        "_id": str(uuid.uuid4()),
        **comment.dict(),
        "book_id": book_id,
        "status": ["pending"],
        "created_at": datetime.utcnow(),
        "published_at": None
    }
    
    result = db.comments.insert_one(comment_data)
    comment_data["id"] = comment_data.pop("_id")
    
    return CommentResponse(**comment_data)

@app.get("/api/books/{book_id}/comments", response_model=List[CommentResponse])
async def get_book_comments(book_id: str):
    comments = []
    for comment in db.comments.find({"book_id": book_id}):
        comment["id"] = comment.pop("_id")
        comments.append(CommentResponse(**comment))
    return comments

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Bibliogest API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)