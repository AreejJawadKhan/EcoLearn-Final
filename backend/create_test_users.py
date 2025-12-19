import sys
sys.path.insert(0, '.')

from database import SessionLocal
from models import User

def create_test_users():
    db = SessionLocal()
    
    try:
        existing_teacher = db.query(User).filter(User.email == "teacher@test.com").first()
        if not existing_teacher:
            teacher = User(
                name="Test Teacher",
                email="teacher@test.com",
                password="password123",
                role="teacher"
            )
            db.add(teacher)
            print("Teacher user created: teacher@test.com / password123")
        else:
            print("Teacher user already exists")
        
        existing_student = db.query(User).filter(User.email == "student@test.com").first()
        if not existing_student:
            student = User(
                name="Test Student",
                email="student@test.com",
                password="password123",
                role="student"
            )
            db.add(student)
            print("Student user created: student@test.com / password123")
        else:
            print("Student user already exists")
        
        db.commit()
        print("Test users setup complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
