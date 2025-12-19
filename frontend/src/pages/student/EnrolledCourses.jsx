import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function EnrolledCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const enrollmentsData = await apiRequest(`/enrollments/student/${user.id}`);
      setEnrollments(enrollmentsData);
      
      const coursesData = await apiRequest('/courses/?show_inactive=true');
      const coursesMap = {};
      coursesData.forEach(course => {
        coursesMap[course.id] = course;
      });
      setCourses(coursesMap);
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

  if (loading) return <div className="loading">Loading your courses...</div>;

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
        <h1>My Enrolled Courses</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Continue learning from your enrolled courses</p>

        {error && <div className="error-message">{error}</div>}

        {enrollments.length === 0 ? (
          <div className="card">
            <p>You haven't enrolled in any courses yet.</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/courses')}>
              Browse Courses
            </button>
          </div>
        ) : (
          enrollments.map(enrollment => {
            const course = courses[enrollment.course_id];
            return (
              <div key={enrollment.id} className="course-card">
                <h3>{enrollment.course_title || course?.title || 'Course'}</h3>
                <p>{course?.description || 'No description available'}</p>
                <div className="course-actions">
                  <button className="btn btn-secondary" onClick={() => navigate(`/lessons/${enrollment.course_id}`)}>
                    View Lessons
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate(`/quiz/${enrollment.course_id}`)}>
                    Take Quiz
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EnrolledCourses;
