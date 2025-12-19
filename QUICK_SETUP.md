# Quick Setup Guide - EcoLearn LMS

## Prerequisites Installation

### 1. Install PostgreSQL
**Windows:**
```bash
Download from: https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Install Python 3.11+
```bash
python --version  # Should be 3.11 or higher
```

### 3. Install Node.js 18+
```bash
node --version  # Should be 18 or higher
npm --version
```

---

## Database Setup

### Step 1: Create Database
```bash
psql -U postgres
```

Inside PostgreSQL prompt:
```sql
CREATE DATABASE ecolearn_db;
\q
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` if needed (default settings work for local PostgreSQL):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecolearn_db
SECRET_KEY=your-secret-key-here
```

---

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
pip install -r ../requirements.txt
```

### Step 2: Create Tables
```bash
python create_tables.py
```

Expected output:
```
All tables created successfully!
```

### Step 3: Create Test Users
```bash
python create_test_users.py
```

Expected output:
```
Teacher user created: teacher@test.com / password123
Student user created: student@test.com / password123
Test users setup complete!
```

### Step 4: Run Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server should be running at: `http://localhost:8000`

Verify by visiting: `http://localhost:8000/docs` (Swagger UI)

---

## Frontend Setup

### Step 1: Install Dependencies
Open a new terminal window:
```bash
cd frontend
npm install
```

This may take 2-3 minutes.

### Step 2: Run Development Server
```bash
npm run dev
```

Frontend should be running at: `http://localhost:5173`

---

## Testing the Application

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Login as Student
- Email: `student@test.com`
- Password: `password123`

### 3. Test Student Features
1. Click "Browse Courses"
2. Find a course and click "Enroll Now"
3. Click "View Lessons" to see course content
4. Click "Take Quiz" to attempt the quiz
5. After submission, view progress and certificate

### 4. Login as Teacher
Logout and login with:
- Email: `teacher@test.com`
- Password: `password123`

### 5. Test Teacher Features
1. Click "Create Course"
2. Fill in course details and submit
3. Click "Add Lesson" and select your course
4. Add lesson content
5. Click "Add Quiz" to create quiz questions
6. Go to "My Courses" and click "View Progress" to see student results

---

## Common Issues and Solutions

### Issue: "Database connection failed"
**Solution:**
1. Check if PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -U postgres -l`
3. Check credentials in `.env` file

### Issue: "Module not found" (Python)
**Solution:**
```bash
pip install -r requirements.txt --upgrade
```

### Issue: "Module not found" (Node)
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"
**Backend (8000):**
```bash
lsof -ti:8000 | xargs kill -9
```

**Frontend (5173):**
```bash
lsof -ti:5173 | xargs kill -9
```

### Issue: "CORS error"
**Solution:** Make sure both backend (8000) and frontend (5173) are running.

---

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Run Backend in Production
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Development Tips

### Backend Development
- Auto-reload is enabled (changes reflect automatically)
- API docs available at: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Development
- Hot reload is enabled (changes reflect automatically)
- React DevTools recommended for debugging
- Check browser console for errors

### Database Management
View data directly:
```bash
psql -U postgres -d ecolearn_db
\dt  # List tables
SELECT * FROM users;
SELECT * FROM courses;
```

---

## File Structure Reference

```
project/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # DB connection
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── security.py          # JWT functions
│   ├── deps.py              # Dependencies
│   ├── routers/             # API endpoints
│   ├── create_tables.py     # DB setup script
│   └── create_test_users.py # Test data script
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app
│   │   ├── api.js           # API functions
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── .env.example             # Environment template
├── requirements.txt         # Python dependencies
└── README.md               # Full documentation
```

---

## Next Steps After Setup

1. Read `README.md` for complete documentation
2. Review `SECURITY_NOTES.md` for security considerations
3. Check `IMPROVEMENTS.md` for potential enhancements
4. Review `PROJECT_REVIEW_SUMMARY.md` for project analysis

---

## Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review `IMPROVEMENTS.md` for known issues
3. Check backend logs in terminal
4. Check browser console for frontend errors

---

**Setup Time**: 10-15 minutes
**First Time User**: Follow each step carefully
**Experienced Developer**: Can skip to "Run" commands directly

Good luck with your project!
