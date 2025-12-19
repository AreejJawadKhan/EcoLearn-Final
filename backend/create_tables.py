import sys
sys.path.insert(0, '.')

from database import engine, Base
from models import User, Course, Lesson, Quiz, Enrollment, StudentProgress

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

if __name__ == "__main__":
    create_tables()
