import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function Certificate() {
  const { studentId, courseId } = useParams();
  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, [studentId, courseId]);

  const fetchData = async () => {
    try {
      const [progressData, courseData, userData] = await Promise.all([
        apiRequest(`/progress/student/${studentId}`),
        apiRequest(`/courses/${courseId}`),
        apiRequest(`/users/${studentId}`)
      ]);
      
      const courseProgress = progressData.find(p => p.course_id === parseInt(courseId));
      if (!courseProgress || !courseProgress.certificate_earned) {
        setError('Certificate not available for this course.');
      } else {
        setProgress(courseProgress);
      }
      setCourse(courseData);
      setStudent(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading certificate...</div>;

  return (
    <div>
      <nav className="nav no-print">
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
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="no-print">
          <BackButton />
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="certificate">
              <h1>🌿 Certificate of Completion</h1>
              <p className="award-text">This is to certify that</p>
              <p className="student-name">{student?.name}</p>
              <p className="award-text">has successfully completed the course</p>
              <p className="course-name">"{course?.title}"</p>
              <p style={{ color: '#666', marginTop: '20px' }}>
                Score: {progress?.quiz_score}/{progress?.quiz_total} ({Math.round((progress?.quiz_score / progress?.quiz_total) * 100)}%)
              </p>
              <p style={{ color: '#888', marginTop: '30px', fontSize: '14px' }}>
                EcoLearn Environmental Learning Management System
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ Print Certificate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Certificate;
