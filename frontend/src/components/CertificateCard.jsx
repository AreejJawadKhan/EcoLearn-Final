import { useNavigate } from 'react-router-dom';

function CertificateCard({ progress, courseName }) {
  const navigate = useNavigate();
  const percentage = progress.quiz_total > 0 
    ? Math.round((progress.quiz_score / progress.quiz_total) * 100) 
    : 0;

  return (
    <div className="course-card">
      <h3>{courseName}</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <div>
          <span style={{ color: '#666' }}>Score: </span>
          <strong>{progress.quiz_score}/{progress.quiz_total}</strong>
        </div>
        <div>
          <span style={{ color: '#666' }}>Percentage: </span>
          <strong style={{ color: percentage >= 80 ? '#4caf50' : '#ff9800' }}>{percentage}%</strong>
        </div>
        <div>
          <span style={{ color: '#666' }}>Attempts: </span>
          <strong>{progress.quiz_attempts}/2</strong>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span className={`badge ${progress.certificate_earned ? 'badge-success' : 'badge-warning'}`}>
          {progress.certificate_earned ? '✓ Certificate Earned' : 'Certificate Pending'}
        </span>
        {progress.certificate_earned && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/certificate/${progress.student_id}/${progress.course_id}`)}
          >
            View Certificate
          </button>
        )}
      </div>
    </div>
  );
}

export default CertificateCard;
