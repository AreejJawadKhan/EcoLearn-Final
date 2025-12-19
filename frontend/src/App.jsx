import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, isAuthenticated } from './utils/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/student/Courses';
import EnrolledCourses from './pages/student/EnrolledCourses';
import Lessons from './pages/student/Lessons';
import Quiz from './pages/student/Quiz';
import Progress from './pages/student/Progress';
import Certificate from './pages/student/Certificate';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import CreateLesson from './pages/teacher/CreateLesson';
import CreateQuiz from './pages/teacher/CreateQuiz';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/enrolled" element={<ProtectedRoute><EnrolledCourses /></ProtectedRoute>} />
        <Route path="/lessons/:courseId" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
        <Route path="/quiz/:courseId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/certificate/:studentId/:courseId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute><TeacherCourses /></ProtectedRoute>} />
        <Route path="/teacher/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
        <Route path="/teacher/create-lesson" element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} />
        <Route path="/teacher/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
