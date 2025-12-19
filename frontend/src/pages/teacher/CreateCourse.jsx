import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/courses/', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
      alert('Course created successfully!');
      navigate('/teacher/courses');
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

      <div className="container" style={{ maxWidth: '700px' }}>
        <BackButton />
        <h1>Create New Course</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Create a new environmental course for your students</p>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Course Title</label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Climate Change"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
