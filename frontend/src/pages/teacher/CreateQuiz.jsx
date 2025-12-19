import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function CreateQuiz() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addedQuestions, setAddedQuestions] = useState([]);
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
      await apiRequest('/quizzes/', {
        method: 'POST',
        body: JSON.stringify({
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer,
          course_id: parseInt(courseId)
        })
      });
      setSuccess('Quiz question added successfully!');
      setAddedQuestions([...addedQuestions, { question, correct_answer: correctAnswer }]);
      setQuestion('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('');
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
        <h1>Add Quiz Question</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Create quiz questions to test student knowledge</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {addedQuestions.length > 0 && (
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#e8f5e9' }}>
            <h4>Questions Added This Session: {addedQuestions.length}</h4>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              {addedQuestions.map((q, i) => (
                <li key={i}>{q.question} (Answer: {q.correct_answer})</li>
              ))}
            </ul>
          </div>
        )}

        {coursesLoading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card">
            <p>You need to create a course first before adding quiz questions.</p>
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
                <label>Question</label>
                <textarea
                  className="input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option A</label>
                <input
                  type="text"
                  className="input"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="Enter option A"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option B</label>
                <input
                  type="text"
                  className="input"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="Enter option B"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option C</label>
                <input
                  type="text"
                  className="input"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="Enter option C"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option D</label>
                <input
                  type="text"
                  className="input"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="Enter option D"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  className="input"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  required
                >
                  <option value="">-- Select correct answer --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Question'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateQuiz;
