from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    teacher_id: int
    is_active: bool
    teacher_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class LessonCreate(BaseModel):
    title: str
    content: Optional[str] = None
    course_id: int

class LessonResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    course_id: int
    
    class Config:
        from_attributes = True

class QuizCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    course_id: int

class QuizResponse(BaseModel):
    id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    course_id: int
    
    class Config:
        from_attributes = True

class QuizSubmit(BaseModel):
    course_id: int
    answers: Dict[str, str]

class QuizResult(BaseModel):
    score: int
    total: int
    percentage: float
    attempts: int
    certificate_earned: bool

class EnrollmentCreate(BaseModel):
    user_id: int
    course_id: int

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    course_title: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProgressCreate(BaseModel):
    student_id: int
    course_id: int
    lesson_completed: Optional[bool] = False
    quiz_score: Optional[int] = 0
    quiz_total: Optional[int] = 0
    quiz_attempts: Optional[int] = 0
    certificate_earned: Optional[bool] = False

class ProgressResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    lesson_completed: bool
    quiz_score: int
    quiz_total: int
    quiz_attempts: int
    certificate_earned: bool
    course_title: Optional[str] = None
    student_name: Optional[str] = None
    
    class Config:
        from_attributes = True
