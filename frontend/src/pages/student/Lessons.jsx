import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function Lessons() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [lessonsData, courseData] = await Promise.all([
        apiRequest(`/lessons/course/${courseId}`),
        apiRequest(`/courses/${courseId}`)
      ]);
      setLessons(lessonsData);
      setCourse(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading lessons...</div>;

  return (
    <div>
      <nav className="nav">
        <Link to="/dashboard" className="nav-brand">🌿 EcoLearn</Link>
        <div className="nav-links">
          {user.role === 'student' ? (
            <>
              <Link to="/courses">Browse Courses</Link>
              <Link to="/enrolled">My Courses</Link>
              <Link to="/progress">My Progress</Link>
            </>
          ) : (
            <>
              <Link to="/teacher/courses">My Courses</Link>
              <Link to="/teacher/create-course">Create Course</Link>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <BackButton />
        <h1>{course?.title} - Lessons</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>{course?.description}</p>

        {error && <div className="error-message">{error}</div>}

        {lessons.length === 0 ? (
          <div className="card">
            <p>No lessons available for this course yet.</p>
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <div key={lesson.id} className="card">
              <h3>Lesson {index + 1}: {lesson.title}</h3>
              <div style={{ marginTop: '15px', whiteSpace: 'pre-wrap' }}>
                {lesson.content || 'No content available'}
              </div>
            </div>
          ))
        )}

        {user.role === 'student' && (
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => navigate(`/quiz/${courseId}`)}
          >
            Take Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default Lessons;
