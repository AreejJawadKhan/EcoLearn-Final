import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      className="btn btn-secondary" 
      onClick={() => navigate(-1)}
      style={{ marginBottom: '20px' }}
    >
      ← Back
    </button>
  );
}

export default BackButton;
