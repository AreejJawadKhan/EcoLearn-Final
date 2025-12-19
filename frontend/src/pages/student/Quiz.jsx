import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getUser, logout } from '../../utils/auth';
import BackButton from '../../components/BackButton';

function Quiz() {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [quizzesData, courseData, progressData] = await Promise.all([
        apiRequest(`/quizzes/course/${courseId}`),
        apiRequest(`/courses/${courseId}`),
        apiRequest(`/progress/student/${user.id}`)
      ]);
      setQuizzes(quizzesData);
      setCourse(courseData);
      
      const courseProgress = progressData.find(p => p.course_id === parseInt(courseId));
      setProgress(courseProgress);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (quizId, answer) => {
    setAnswers({ ...answers, [quizId]: answer });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const resultData = await apiRequest('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify({
          course_id: parseInt(courseId),
          answers
        })
      });
      setResult(resultData);
      
      if (resultData.certificate_earned) {
        setTimeout(() => {
          navigate(`/certificate/${user.id}/${courseId}`);
        }, 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const maxAttemptsReached = progress && progress.quiz_attempts >= 2;

  if (loading) return <div className="loading">Loading quiz...</div>;

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
        <h1>{course?.title} - Quiz</h1>
        
        {progress && (
          <div style={{ marginBottom: '20px' }}>
            <span className={`badge ${maxAttemptsReached ? 'badge-danger' : 'badge-warning'}`}>
              Attempts: {progress.quiz_attempts}/2
            </span>
            {progress.quiz_score > 0 && (
              <span className="badge badge-success" style={{ marginLeft: '10px' }}>
                Best Score: {progress.quiz_score}/{progress.quiz_total}
              </span>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className={`card ${result.certificate_earned ? 'success-message' : ''}`} style={{ marginBottom: '20px' }}>
            <h3>Quiz Results</h3>
            <p>Score: {result.score}/{result.total} ({result.percentage.toFixed(1)}%)</p>
            <p>Attempts Used: {result.attempts}/2</p>
            {result.certificate_earned && (
              <p style={{ color: '#4caf50', fontWeight: 'bold' }}>
                🎉 Congratulations! You earned a certificate! Redirecting...
              </p>
            )}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="card">
            <p>No quiz questions available for this course yet.</p>
          </div>
        ) : maxAttemptsReached ? (
          <div className="card">
            <p>You have used all your quiz attempts (2/2).</p>
            <p>Final Score: {progress.quiz_score}/{progress.quiz_total}</p>
            {progress.certificate_earned && (
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '15px' }}
                onClick={() => navigate(`/certificate/${user.id}/${courseId}`)}
              >
                View Certificate
              </button>
            )}
          </div>
        ) : (
          <>
            {quizzes.map((quiz, index) => (
              <div key={quiz.id} className="quiz-question">
                <h4>Question {index + 1}: {quiz.question}</h4>
                <div className="quiz-options">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <label key={option} className="quiz-option">
                      <input
                        type="radio"
                        name={`quiz-${quiz.id}`}
                        value={option}
                        checked={answers[quiz.id] === option}
                        onChange={() => handleAnswerChange(quiz.id.toString(), option)}
                        disabled={submitting || result}
                      />
                      <span><strong>{option}.</strong> {quiz[`option_${option.toLowerCase()}`]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={submitting || result}
              style={{ marginTop: '20px' }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Quiz;
