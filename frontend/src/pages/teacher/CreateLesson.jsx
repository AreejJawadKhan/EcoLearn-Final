import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function CreateLesson() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setCoursesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiRequest('/lessons/', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          content, 
          course_id: parseInt(courseId) 
        })
      });
      setSuccess('Lesson added successfully!');
      setTitle('');
      setContent('');
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
        <h1>Add New Lesson</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Add educational content to your courses</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {coursesLoading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card">
            <p>You need to create a course first before adding lessons.</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/teacher/create-course')}>
              Create Course
            </button>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Course</label>
                <select
                  className="input"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  <option value="">-- Select a course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lesson Title</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Understanding the Greenhouse Effect"
                  required
                />
              </div>

              <div className="form-group">
                <label>Lesson Content</label>
                <textarea
                  className="input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the lesson content here..."
                  rows="8"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Lesson'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateLesson;
