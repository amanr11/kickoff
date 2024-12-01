from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail

import secrets

# Initialize Flask extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    from app.models import User  # Import here to avoid circular import
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = secrets.token_hex(16)
    app.config['SECURITY_PASSWORD_SALT'] = secrets.token_hex(8)  # Add this line
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

    # Mail configuration
    app.config['MAIL_DEBUG'] = True

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'kickoff.officialapp@gmail.com'
    app.config['MAIL_PASSWORD'] = 'qpdw ufju jtqc mbhn'
    app.config['MAIL_DEFAULT_SENDER'] = 'kickoff.officialapp@gmail.com'

    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    from app.routes import main  # Import routes after db is initialized
    app.register_blueprint(main)

    from app import models  # Import models after app is created

    return app
