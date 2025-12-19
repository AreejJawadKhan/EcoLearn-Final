from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from deps import get_current_user, require_teacher
import models
import schemas

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=schemas.CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher)
):
    db_course = models.Course(
        title=course.title,
        description=course.description,
        teacher_id=current_user.id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return schemas.CourseResponse(
        id=db_course.id,
        title=db_course.title,
        description=db_course.description,
        teacher_id=db_course.teacher_id,
        is_active=db_course.is_active,
        teacher_name=current_user.name
    )

@router.get("/", response_model=List[schemas.CourseResponse])
def get_courses(
    show_inactive: bool = Query(False),
    teacher_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Course)
    
    if teacher_id:
        query = query.filter(models.Course.teacher_id == teacher_id)
    
    if not show_inactive:
        query = query.filter(models.Course.is_active == True)
    
    courses = query.all()
    result = []
    for course in courses:
        result.append(schemas.CourseResponse(
            id=course.id,
            title=course.title,
            description=course.description,
            teacher_id=course.teacher_id,
            is_active=course.is_active,
            teacher_name=course.teacher.name if course.teacher else None
        ))
    return result

@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return schemas.CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        teacher_id=course.teacher_id,
        is_active=course.is_active,
        teacher_name=course.teacher.name if course.teacher else None
    )

@router.put("/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )
    
    if course_update.title:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    
    db.commit()
    db.refresh(course)
    return schemas.CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        teacher_id=course.teacher_id,
        is_active=course.is_active,
        teacher_name=course.teacher.name if course.teacher else None
    )

@router.patch("/{course_id}/toggle", response_model=schemas.CourseResponse)
def toggle_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this course"
        )
    
    course.is_active = not course.is_active
    db.commit()
    db.refresh(course)
    return schemas.CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        teacher_id=course.teacher_id,
        is_active=course.is_active,
        teacher_name=course.teacher.name if course.teacher else None
    )

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this course"
        )
    
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).count()
    if enrollments > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete course with enrolled students"
        )
    
    db.delete(course)
    db.commit()
    return None
