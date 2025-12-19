import { useNavigate, Link } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/');
    return null;
  }

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
              <Link to="/teacher/create-lesson">Add Lesson</Link>
              <Link to="/teacher/create-quiz">Add Quiz</Link>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h1 style={{ marginBottom: '10px' }}>Welcome, {user.name}!</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Role: <span className={`badge ${user.role === 'teacher' ? 'badge-success' : 'badge-warning'}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </p>

        {user.role === 'student' ? (
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => navigate('/courses')}>
              <h3>📚 Browse Courses</h3>
              <p>Explore and enroll in environmental courses</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/enrolled')}>
              <h3>📖 My Courses</h3>
              <p>View your enrolled courses and continue learning</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/progress')}>
              <h3>📊 My Progress</h3>
              <p>Track your learning progress and certificates</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => navigate('/teacher/courses')}>
              <h3>📚 My Courses</h3>
              <p>Manage your created courses</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/teacher/create-course')}>
              <h3>➕ Create Course</h3>
              <p>Create a new environmental course</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/teacher/create-lesson')}>
              <h3>📝 Add Lesson</h3>
              <p>Add lessons to your courses</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/teacher/create-quiz')}>
              <h3>❓ Add Quiz</h3>
              <p>Create quiz questions for courses</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
