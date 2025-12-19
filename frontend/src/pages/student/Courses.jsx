import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        apiRequest('/courses/'),
        apiRequest(`/enrollments/student/${user.id}`)
      ]);
      setCourses(coursesData);
      setEnrolledIds(enrollmentsData.map(e => e.course_id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiRequest('/enrollments/', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, course_id: courseId })
      });
      setEnrolledIds([...enrolledIds, courseId]);
      alert('Successfully enrolled in the course!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div>
      <nav className="nav">
        <Link to="/dashboard" className="nav-brand">🌿 EcoLearn</Link>
        <div className="nav-links">
          <Link to="/courses">Browse Courses</Link>
          <Link to="/enrolled">My Courses</Link>
          <Link to="/progress">My Progress</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <BackButton />
        <h1>Browse Courses</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Explore and enroll in environmental courses</p>

        {error && <div className="error-message">{error}</div>}

        {courses.length === 0 ? (
          <div className="card">
            <p>No courses available at the moment.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description || 'No description available'}</p>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
                Instructor: {course.teacher_name}
              </p>
              <div className="course-actions">
                {enrolledIds.includes(course.id) ? (
                  <>
                    <span className="badge badge-success">Enrolled</span>
                    <button className="btn btn-secondary" onClick={() => navigate(`/lessons/${course.id}`)}>
                      View Lessons
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate(`/quiz/${course.id}`)}>
                      Take Quiz
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => handleEnroll(course.id)}>
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;
