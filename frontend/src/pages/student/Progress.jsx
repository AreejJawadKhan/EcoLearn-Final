import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';
import CertificateCard from '../../components/CertificateCard';

function Progress() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiRequest(`/progress/student/${user.id}`);
      setProgressList(data);
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

  if (loading) return <div className="loading">Loading your progress...</div>;

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
        <h1>My Progress</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Track your learning progress and certificates</p>

        {error && <div className="error-message">{error}</div>}

        {progressList.length === 0 ? (
          <div className="card">
            <p>No progress recorded yet. Start taking quizzes to track your progress!</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/courses')}>
              Browse Courses
            </button>
          </div>
        ) : (
          progressList.map(progress => (
            <CertificateCard 
              key={progress.id} 
              progress={progress} 
              courseName={progress.course_title} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Progress;
