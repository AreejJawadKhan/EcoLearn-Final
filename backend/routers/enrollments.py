from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from deps import get_current_user
import models
import schemas

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=schemas.EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if not course.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot enroll in inactive course"
        )
    
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == enrollment.user_id,
        models.Enrollment.course_id == enrollment.course_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    db_enrollment = models.Enrollment(
        user_id=enrollment.user_id,
        course_id=enrollment.course_id
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    
    return schemas.EnrollmentResponse(
        id=db_enrollment.id,
        user_id=db_enrollment.user_id,
        course_id=db_enrollment.course_id,
        course_title=course.title
    )

@router.get("/student/{user_id}", response_model=List[schemas.EnrollmentResponse])
def get_student_enrollments(user_id: int, db: Session = Depends(get_db)):
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user_id
    ).all()
    
    result = []
    for enrollment in enrollments:
        result.append(schemas.EnrollmentResponse(
            id=enrollment.id,
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            course_title=enrollment.course.title if enrollment.course else None
        ))
    return result

@router.get("/course/{course_id}", response_model=List[schemas.EnrollmentResponse])
def get_course_enrollments(course_id: int, db: Session = Depends(get_db)):
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    ).all()
    
    result = []
    for enrollment in enrollments:
        result.append(schemas.EnrollmentResponse(
            id=enrollment.id,
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            course_title=enrollment.course.title if enrollment.course else None
        ))
    return result
