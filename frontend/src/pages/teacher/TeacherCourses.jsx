import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';
import StudentRow from '../../components/StudentRow';

function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await apiRequest(`/courses/?show_inactive=true&teacher_id=${user.id}`);
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (courseId) => {
    try {
      await apiRequest(`/courses/${courseId}/toggle`, { method: 'PATCH' });
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewProgress = async (course) => {
    setSelectedCourse(course);
    setProgressLoading(true);
    try {
      const data = await apiRequest(`/progress/course/${course.id}`);
      setStudentProgress(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await apiRequest(`/courses/${courseId}`, { method: 'DELETE' });
      fetchCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setStudentProgress([]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading your courses...</div>;

  return (
    <div>
      <nav className="nav">
        <Link to="/dashboard" className="nav-brand">🌿 EcoLearn</Link>
        <div className="nav-links">
          <Link to="/teacher/courses">My Courses</Link>
          <Link to="/teacher/create-course">Create Course</Link>
          <Link to="/teacher/create-lesson">Add Lesson</Link>
          <Link to="/teacher/create-quiz">Add Quiz</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <BackButton />
        <h1>My Courses</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Manage your created courses</p>

        {error && <div className="error-message">{error}</div>}

        {courses.length === 0 ? (
          <div className="card">
            <p>You haven't created any courses yet.</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/teacher/create-course')}>
              Create Your First Course
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3>{course.title}</h3>
                  <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {course.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p>{course.description || 'No description'}</p>
                <div className="course-actions" style={{ marginTop: '15px' }}>
                  <button className="btn btn-secondary" onClick={() => handleViewProgress(course)}>
                    View Progress
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate(`/lessons/${course.id}`)}>
                    View Lessons
                  </button>
                  <button 
                    className={`btn ${course.is_active ? 'btn-warning' : 'btn-primary'}`}
                    onClick={() => handleToggle(course.id)}
                  >
                    {course.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(course.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="card" style={{ marginTop: '30px' }}>
            <h2>Student Progress: {selectedCourse.title}</h2>
            
            {progressLoading ? (
              <p>Loading progress...</p>
            ) : studentProgress.length === 0 ? (
              <p style={{ color: '#666', marginTop: '15px' }}>No students have taken the quiz yet.</p>
            ) : (
              <table style={{ marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Lessons</th>
                    <th>Quiz Score</th>
                    <th>Attempts</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgress.map((student, index) => (
                    <StudentRow key={student.id} student={student} index={index} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherCourses;
