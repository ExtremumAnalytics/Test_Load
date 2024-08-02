# EA/database/database.py
 
from flask_sqlalchemy import SQLAlchemy
# from datetime import datetime
 
# Initialize the database
db = SQLAlchemy()
 
 
# Define FileStorage table
class FileStorage(db.Model):
    __tablename__ = 'file_storage'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_data = db.Column(db.LargeBinary)
    file_description = db.Column(db.Text)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
 
 
# Define UserRoles table
class UserRole(db.Model):
    __tablename__ = 'user_role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    role_id = db.Column(db.String(10), unique=True, nullable=False)
    user_details = db.relationship('UserDetails', backref='user_role', lazy=True)
 
 
# Define UserDetails table
class UserDetails(db.Model):
    __tablename__ = 'user_details'
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.String(10), db.ForeignKey('user_role.role_id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email_id = db.Column(db.String(100), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    modified_date = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    status = db.Column(db.String(20), nullable=False)
    login_pin = db.Column(db.String(20), nullable=False)
 
 
# Define ChatHistory table
class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    login_pin = db.Column(db.String(20), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    source = db.Column(db.Text, nullable=False)
    page_number = db.Column(db.Text, nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
 
# class VectorEmbeddingsData(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     login_pin = db.Column(db.String(20), nullable=False)
#     vector_id = db.Column(db.Text, nullable=False)
#     filename = db.Column(db.Text, nullable=False, unique=True)
#     created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
 
# Define DatabaseDetails table
class DatabaseDetailsSave(db.Model):
    __tablename__ = 'db_details_save'
    id = db.Column(db.Integer, primary_key=True)
    login_pin = db.Column(db.String(20), nullable=False)
    database_type = db.Column(db.Text, nullable=False)
    hostname = db.Column(db.Text, nullable=False)
    port = db.Column(db.Text, nullable=False)
    username = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    db_name = db.Column(db.Text,nullable=False,unique=True)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())

# Function to create all tables
def create_all_tables(app):
    with app.app_context():
        db.create_all()
 