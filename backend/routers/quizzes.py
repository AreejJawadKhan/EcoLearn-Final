from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from deps import require_teacher, get_current_user
import models
import schemas

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/", response_model=schemas.QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher)
):
    course = db.query(models.Course).filter(models.Course.id == quiz.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add quizzes to this course"
        )
    
    db_quiz = models.Quiz(
        question=quiz.question,
        option_a=quiz.option_a,
        option_b=quiz.option_b,
        option_c=quiz.option_c,
        option_d=quiz.option_d,
        correct_answer=quiz.correct_answer.upper(),
        course_id=quiz.course_id
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/course/{course_id}", response_model=List[schemas.QuizResponse])
def get_course_quizzes(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if current_user.role == "teacher":
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this course"
            )
    else:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to take quizzes"
            )
    
    quizzes = db.query(models.Quiz).filter(models.Quiz.course_id == course_id).all()
    return quizzes

@router.post("/submit", response_model=schemas.QuizResult)
def submit_quiz(
    submission: schemas.QuizSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == submission.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == submission.course_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to take quizzes"
        )

    progress = db.query(models.StudentProgress).filter(
        models.StudentProgress.student_id == current_user.id,
        models.StudentProgress.course_id == submission.course_id
    ).first()

    if progress and progress.quiz_attempts >= 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum quiz attempts (2) reached"
        )

    quizzes = db.query(models.Quiz).filter(models.Quiz.course_id == submission.course_id).all()
    if not quizzes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quiz questions found for this course"
        )

    score = 0
    total = len(quizzes)

    for quiz in quizzes:
        quiz_id_str = str(quiz.id)
        if quiz_id_str in submission.answers:
            if submission.answers[quiz_id_str].upper() == quiz.correct_answer.upper():
                score += 1

    percentage = (score / total) * 100 if total > 0 else 0
    certificate_earned = percentage >= 80

    if not progress:
        progress = models.StudentProgress(
            student_id=current_user.id,
            course_id=submission.course_id,
            quiz_score=score,
            quiz_total=total,
            quiz_attempts=1,
            certificate_earned=certificate_earned
        )
        db.add(progress)
    else:
        progress.quiz_attempts += 1
        if score > progress.quiz_score:
            progress.quiz_score = score
            progress.quiz_total = total
        if certificate_earned:
            progress.certificate_earned = True
    
    db.commit()
    db.refresh(progress)
    
    return schemas.QuizResult(
        score=score,
        total=total,
        percentage=percentage,
        attempts=progress.quiz_attempts,
        certificate_earned=progress.certificate_earned
    )
