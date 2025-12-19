# EcoLearn - Environmental Learning Management System

## Table of Contents
1. [Project Scope](#project-scope)
2. [Business Overview](#business-overview)
3. [System Architecture](#system-architecture)
4. [Data Design](#data-design)
5. [REST API Design](#rest-api-design)
6. [Frontend Design](#frontend-design)
7. [Setup Instructions](#setup-instructions)
8. [Testing](#testing)
9. [UI Screenshots](#ui-screenshots)
10. [Contributors](#contributors)

---

## Project Scope

### Business Name
**EcoLearn** - Environmental Learning Management System

### Purpose
EcoLearn is a web-based Learning Management System (LMS) designed to promote environmental education through interactive online courses. The platform facilitates knowledge sharing between educators and students in the field of environmental science, climate change, sustainability, and related topics.

### Target Audience
- **Teachers/Instructors**: Create and manage environmental courses, lessons, and assessments
- **Students/Learners**: Access educational content, take quizzes, and earn certificates

### Services Offered
1. **Course Management**: Teachers can create, update, enable/disable, and delete courses
2. **Lesson Delivery**: Structured lesson content for each course
3. **Assessment System**: Multiple-choice quizzes with automated grading
4. **Progress Tracking**: Real-time tracking of student performance and quiz attempts
5. **Certificate Generation**: Automatic certificate issuance for students achieving 80% or higher
6. **Enrollment System**: Students can browse and enroll in active courses
7. **Role-Based Access Control**: Separate functionalities for teachers and students

### Key Features
- **Authentication**: JWT-based secure login system
- **Quiz Attempt Limitation**: Students can attempt each quiz maximum 2 times
- **Best Score Tracking**: System retains the highest score achieved
- **Certificate Criteria**: Automatic certificate generation for 80%+ scores
- **Course Visibility Control**: Teachers can enable/disable courses
- **Student Progress Dashboard**: Comprehensive view of learning progress
- **Teacher Analytics**: View all students' progress for each course

---

## Business Overview

### Problem Statement
Traditional classroom-based environmental education has limited reach and lacks interactive assessment tools. There is a need for a digital platform that enables:
- Remote learning access to environmental education
- Standardized assessment and certification
- Progress tracking and analytics
- Scalable course delivery

### Solution
EcoLearn provides a comprehensive web-based LMS that addresses these challenges by offering:
- 24/7 access to environmental courses
- Automated quiz evaluation and instant feedback
- Digital certificate generation
- Teacher tools for content creation and student monitoring

### Business Logic
1. **Enrollment Logic**: Students must enroll before accessing course content
2. **Quiz Attempts**: Limited to 2 attempts per course to encourage focused learning
3. **Certificate Eligibility**: Requires minimum 80% score on quiz
4. **Course Protection**: Courses with enrolled students cannot be deleted (data integrity)
5. **Active Course Filter**: Only active courses are visible to students

---

## System Architecture

### Technology Stack

**Frontend:**
- React 19+ (Single Page Application)
- React Router DOM v7 (Client-side routing)
- Vite (Build tool and development server)
- Vanilla CSS (Custom styling)

**Backend:**
- FastAPI (Python 3.11+)
- Uvicorn (ASGI server)
- SQLAlchemy ORM (Database interaction)
- Pydantic (Data validation)
- Python-Jose (JWT authentication)

**Database:**
- PostgreSQL (Relational database)

### Application Flow
```
User Login → JWT Token Generation → Role-Based Dashboard
    ↓
Teacher Dashboard              Student Dashboard
    ↓                              ↓
Create Courses              Browse Courses
Add Lessons                 Enroll in Courses
Create Quizzes              View Lessons
View Student Progress       Take Quizzes
                           View Progress
                           Download Certificates
```

---

## Data Design

### Database Schema

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher'))
);
```

**Purpose**: Store user account information with role-based access
**Relationships**: One-to-Many with courses, enrollments, and student_progress

#### 2. Courses Table
```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);
```

**Purpose**: Store course information created by teachers
**Relationships**:
- Many-to-One with users (teacher)
- One-to-Many with lessons, quizzes, enrollments, student_progress

#### 3. Lessons Table
```sql
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);
```

**Purpose**: Store educational content for each course
**Relationships**: Many-to-One with courses

#### 4. Quizzes Table
```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(200) NOT NULL,
    option_b VARCHAR(200) NOT NULL,
    option_c VARCHAR(200) NOT NULL,
    option_d VARCHAR(200) NOT NULL,
    correct_answer VARCHAR(10) NOT NULL,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);
```

**Purpose**: Store quiz questions with multiple-choice options
**Relationships**: Many-to-One with courses

#### 5. Enrollments Table
```sql
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);
```

**Purpose**: Track student enrollments in courses
**Relationships**:
- Many-to-One with users (students)
- Many-to-One with courses
**Constraint**: Prevents duplicate enrollments

#### 6. Student Progress Table
```sql
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_completed BOOLEAN DEFAULT FALSE,
    quiz_score INTEGER DEFAULT 0,
    quiz_total INTEGER DEFAULT 0,
    quiz_attempts INTEGER DEFAULT 0,
    certificate_earned BOOLEAN DEFAULT FALSE
);
```

**Purpose**: Track student quiz performance and certificate eligibility
**Relationships**:
- Many-to-One with users (students)
- Many-to-One with courses

### Entity Relationship Diagram (ERD)

```
[Users] 1---* [Courses] (teacher creates courses)
[Users] 1---* [Enrollments] (student enrolls)
[Courses] 1---* [Enrollments]
[Courses] 1---* [Lessons]
[Courses] 1---* [Quizzes]
[Users] 1---* [Student_Progress]
[Courses] 1---* [Student_Progress]
```

---

## REST API Design

### Authentication Endpoints

#### POST /auth/login
**Purpose**: Authenticate user and return JWT token
**Request Body**:
```json
{
  "email": "student@test.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Test Student",
    "email": "student@test.com",
    "role": "student"
  }
}
```

#### GET /auth/me
**Purpose**: Get current user information
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "id": 1,
  "name": "Test Student",
  "email": "student@test.com",
  "role": "student"
}
```

### User Endpoints

#### POST /users/
**Purpose**: Create new user account
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student"
}
```

#### GET /users/
**Purpose**: Get all users

#### GET /users/{user_id}
**Purpose**: Get specific user by ID

#### DELETE /users/{user_id}
**Purpose**: Delete user account

### Course Endpoints

#### POST /courses/
**Purpose**: Create new course (Teacher only)
**Headers**: `Authorization: Bearer <teacher_token>`
**Request Body**:
```json
{
  "title": "Introduction to Climate Change",
  "description": "Learn about the science behind climate change"
}
```

#### GET /courses/
**Purpose**: Get all active courses
**Query Parameters**:
- `show_inactive=true` (optional): Include disabled courses
- `teacher_id=<id>` (optional): Filter by teacher

#### GET /courses/{course_id}
**Purpose**: Get specific course details

#### PUT /courses/{course_id}
**Purpose**: Update course information (Teacher only)

#### PATCH /courses/{course_id}/toggle
**Purpose**: Enable/disable course (Teacher only)

#### DELETE /courses/{course_id}
**Purpose**: Delete course (Teacher only, no enrollments allowed)

### Lesson Endpoints

#### POST /lessons/
**Purpose**: Create new lesson (Teacher only)
**Request Body**:
```json
{
  "title": "The Greenhouse Effect",
  "content": "Detailed lesson content...",
  "course_id": 1
}
```

#### GET /lessons/course/{course_id}
**Purpose**: Get all lessons for a course (Enrolled students or course teacher)

### Quiz Endpoints

#### POST /quizzes/
**Purpose**: Create quiz question (Teacher only)
**Request Body**:
```json
{
  "question": "What is the main greenhouse gas?",
  "option_a": "Oxygen",
  "option_b": "Carbon Dioxide",
  "option_c": "Nitrogen",
  "option_d": "Helium",
  "correct_answer": "B",
  "course_id": 1
}
```

#### GET /quizzes/course/{course_id}
**Purpose**: Get all quiz questions for a course

#### POST /quizzes/submit
**Purpose**: Submit quiz answers
**Request Body**:
```json
{
  "course_id": 1,
  "student_id": 2,
  "answers": {
    "1": "B",
    "2": "A",
    "3": "C"
  }
}
```
**Response**:
```json
{
  "score": 2,
  "total": 3,
  "percentage": 66.67,
  "attempts": 1,
  "certificate_earned": false
}
```

### Enrollment Endpoints

#### POST /enrollments/
**Purpose**: Enroll student in course
**Request Body**:
```json
{
  "user_id": 2,
  "course_id": 1
}
```

#### GET /enrollments/student/{user_id}
**Purpose**: Get all enrollments for a student

#### GET /enrollments/course/{course_id}
**Purpose**: Get all enrollments for a course

### Progress Endpoints

#### GET /progress/student/{student_id}
**Purpose**: Get student's progress across all courses

#### GET /progress/course/{course_id}
**Purpose**: Get all students' progress for a course (Teacher view)

#### POST /progress/update
**Purpose**: Create or update progress record

---

## Frontend Design

### Component Structure

```
App.jsx (Root)
├── Login.jsx
├── Dashboard.jsx (Role-based content)
├── Student Pages
│   ├── Courses.jsx (Browse & Enroll)
│   ├── EnrolledCourses.jsx
│   ├── Lessons.jsx
│   ├── Quiz.jsx
│   ├── Progress.jsx
│   └── Certificate.jsx
├── Teacher Pages
│   ├── TeacherCourses.jsx
│   ├── CreateCourse.jsx
│   ├── CreateLesson.jsx
│   └── CreateQuiz.jsx
└── Components
    ├── BackButton.jsx
    ├── CertificateCard.jsx
    └── StudentRow.jsx
```

### React Hooks Used
- **useState**: State management for forms, loading states, errors
- **useEffect**: Data fetching on component mount
- **useNavigate**: Programmatic navigation
- **useParams**: Extract URL parameters

### Props Usage
- **CertificateCard**: `{ progress, courseName }`
- **StudentRow**: `{ student, index }`

### Routing Structure
```
/ → Login Page
/dashboard → Role-based Dashboard
/courses → Browse Courses (Student)
/enrolled → Enrolled Courses (Student)
/lessons/:courseId → Course Lessons
/quiz/:courseId → Take Quiz (Student)
/progress → Student Progress
/certificate/:studentId/:courseId → Certificate View
/teacher/courses → Teacher Courses Management
/teacher/create-course → Create New Course
/teacher/create-lesson → Add Lesson
/teacher/create-quiz → Add Quiz Question
```

---

## Setup Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Backend Setup

1. **Create PostgreSQL Database**
```bash
psql -U postgres
CREATE DATABASE ecolearn_db;
\q
```

2. **Configure Environment Variables**
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/ecolearn_db
```

3. **Install Python Dependencies**
```bash
pip install -r requirements.txt
```
Or if using uv:
```bash
uv sync
```

4. **Create Database Tables**
```bash
cd backend
python create_tables.py
```

5. **Create Test Users**
```bash
python create_test_users.py
```

6. **Run Backend Server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Run Development Server**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Accessing the Application

**Login Credentials:**
- **Teacher Account**:
  - Email: `teacher@test.com`
  - Password: `password123`

- **Student Account**:
  - Email: `student@test.com`
  - Password: `password123`

### API Documentation
Once the backend is running, access Swagger documentation at:
`http://localhost:8000/docs`

---

## Testing

### Manual Testing Steps

#### Teacher Workflow
1. Login with teacher credentials
2. Create a new course with title and description
3. Add lessons to the course
4. Create quiz questions for the course
5. Enable/disable course visibility
6. View student progress for courses

#### Student Workflow
1. Login with student credentials
2. Browse available courses
3. Enroll in a course
4. View lessons for enrolled course
5. Take quiz (maximum 2 attempts)
6. View progress dashboard
7. Download certificate if score ≥ 80%

#### Testing Scenarios
- **Authentication**: Invalid credentials, expired tokens
- **Authorization**: Student accessing teacher routes (should fail)
- **Business Logic**:
  - Attempt quiz 3 times (should block after 2)
  - Score 79% (no certificate) vs 80% (certificate earned)
  - Delete course with enrolled students (should fail)
- **Data Validation**: Invalid email format, missing required fields

---

## Contributors

This project was developed as part of a web development course project.

**Group Members:**
- Member 1: [Areej Jawad Khan] - Frontend & Backend Development
- Member 2: [Faryal Shariq] - Frontend & Backend Development

---

## License
This is an academic project for educational purposes.

---

## Acknowledgments
- FastAPI framework documentation
- React official documentation
- PostgreSQL documentation
- Environmental education community for inspiration
