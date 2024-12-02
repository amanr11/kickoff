from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, DateTimeField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Regexp, NumberRange

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6), 
                                                     Regexp('^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$', 
                                                     message="Password must contain at least one letter, one number, and one special character.")])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class GameForm(FlaskForm):
    title = StringField('Game Title', validators=[DataRequired(), Length(max=100)])
    location = StringField('Location', validators=[DataRequired(), Length(max=100)])
    date_time = DateTimeField('Date and Time', validators=[DataRequired()])
    players_needed = IntegerField('Players Needed', validators=[DataRequired(), NumberRange(min=1)])
    submit = SubmitField('Post Game')
