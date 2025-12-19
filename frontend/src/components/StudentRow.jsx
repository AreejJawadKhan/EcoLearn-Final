function StudentRow({ student, index }) {
  const percentage = student.quiz_total > 0 
    ? Math.round((student.quiz_score / student.quiz_total) * 100) 
    : 0;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{student.student_name}</td>
      <td>
        <span className={`badge ${student.lesson_completed ? 'badge-success' : 'badge-warning'}`}>
          {student.lesson_completed ? 'Completed' : 'In Progress'}
        </span>
      </td>
      <td>
        {student.quiz_score}/{student.quiz_total} ({percentage}%)
      </td>
      <td>{student.quiz_attempts}/2</td>
      <td>
        <span className={`badge ${student.certificate_earned ? 'badge-success' : 'badge-danger'}`}>
          {student.certificate_earned ? 'Yes' : 'No'}
        </span>
      </td>
    </tr>
  );
}

export default StudentRow;
