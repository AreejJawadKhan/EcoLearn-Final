from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from deps import get_current_user
import models
import schemas

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/student/{student_id}", response_model=List[schemas.ProgressResponse])
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    progress_list = db.query(models.StudentProgress).filter(
        models.StudentProgress.student_id == student_id
    ).all()
    
    result = []
    for progress in progress_list:
        result.append(schemas.ProgressResponse(
            id=progress.id,
            student_id=progress.student_id,
            course_id=progress.course_id,
            lesson_completed=progress.lesson_completed,
            quiz_score=progress.quiz_score,
            quiz_total=progress.quiz_total,
            quiz_attempts=progress.quiz_attempts,
            certificate_earned=progress.certificate_earned,
            course_title=progress.course.title if progress.course else None,
            student_name=progress.student.name if progress.student else None
        ))
    return result

@router.get("/course/{course_id}", response_model=List[schemas.ProgressResponse])
def get_course_progress(course_id: int, db: Session = Depends(get_db)):
    progress_list = db.query(models.StudentProgress).filter(
        models.StudentProgress.course_id == course_id
    ).all()
    
    result = []
    for progress in progress_list:
        result.append(schemas.ProgressResponse(
            id=progress.id,
            student_id=progress.student_id,
            course_id=progress.course_id,
            lesson_completed=progress.lesson_completed,
            quiz_score=progress.quiz_score,
            quiz_total=progress.quiz_total,
            quiz_attempts=progress.quiz_attempts,
            certificate_earned=progress.certificate_earned,
            course_title=progress.course.title if progress.course else None,
            student_name=progress.student.name if progress.student else None
        ))
    return result

@router.post("/update", response_model=schemas.ProgressResponse)
def update_progress(
    progress_data: schemas.ProgressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    progress = db.query(models.StudentProgress).filter(
        models.StudentProgress.student_id == progress_data.student_id,
        models.StudentProgress.course_id == progress_data.course_id
    ).first()
    
    if not progress:
        progress = models.StudentProgress(
            student_id=progress_data.student_id,
            course_id=progress_data.course_id,
            lesson_completed=progress_data.lesson_completed,
            quiz_score=progress_data.quiz_score,
            quiz_total=progress_data.quiz_total,
            quiz_attempts=progress_data.quiz_attempts,
            certificate_earned=progress_data.certificate_earned
        )
        db.add(progress)
    else:
        if progress_data.lesson_completed is not None:
            progress.lesson_completed = progress_data.lesson_completed
        if progress_data.quiz_score is not None:
            progress.quiz_score = progress_data.quiz_score
        if progress_data.quiz_total is not None:
            progress.quiz_total = progress_data.quiz_total
        if progress_data.quiz_attempts is not None:
            progress.quiz_attempts = progress_data.quiz_attempts
        if progress_data.certificate_earned is not None:
            progress.certificate_earned = progress_data.certificate_earned
    
    db.commit()
    db.refresh(progress)
    
    return schemas.ProgressResponse(
        id=progress.id,
        student_id=progress.student_id,
        course_id=progress.course_id,
        lesson_completed=progress.lesson_completed,
        quiz_score=progress.quiz_score,
        quiz_total=progress.quiz_total,
        quiz_attempts=progress.quiz_attempts,
        certificate_earned=progress.certificate_earned,
        course_title=progress.course.title if progress.course else None,
        student_name=progress.student.name if progress.student else None
    )
