from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer as Serializer  # Keep this import
from flask import current_app  

# users table
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)  # boolean value for email verification
    profile_picture = db.Column(db.String(120), default='default_profile.png') 
    bio = db.Column(db.Text, nullable=True)  # new field
    skill_level = db.Column(db.String(50), nullable=True)  # new field
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def get_verification_token(self, expires_sec=3600):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps({'user_id': self.id}, salt=current_app.config['SECURITY_PASSWORD_SALT'])

    def get_reset_token(self, expires_sec=1800):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps({'user_id': self.id}, salt='password-reset-salt')

    @staticmethod
    def verify_verification_token(token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, salt=current_app.config['SECURITY_PASSWORD_SALT'], max_age=3600)  # max_age added here
        except:
            return None
        return User.query.get(data['user_id'])
    
    @staticmethod
    def verify_reset_token(token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, salt='password-reset-salt', max_age=1800)  # max_age added here
        except:
            return None
        return User.query.get(data['user_id'])

# games table
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # link to User model
    location = db.Column(db.String(100), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    quality = db.Column(db.String(100), nullable=False)
    players_needed = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)  
    host = db.relationship('User', backref='hosted_games')  # reference to the host user

    # many-to-many rs with User via the game_players table
    players = db.relationship('User', secondary='game_players', backref=db.backref('games', lazy='dynamic'))

# many-to-many association table
class GamePlayer(db.Model):
    __tablename__ = 'game_players'
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    username = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', backref='game_associations')

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(200), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
