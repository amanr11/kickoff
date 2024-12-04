from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app.forms import RegistrationForm, LoginForm, ContactForm
from app.models import User,Game
from app import db,mail
from werkzeug.security import generate_password_hash
from flask_mail import Message


main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('home.html')

@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        # Hash the password before storing
        hashed_password = generate_password_hash(form.password.data)
        # Create the new user object
        user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        db.session.add(user)
        db.session.commit()

        # Generate verification token
        token = user.get_verification_token()
        verification_url = url_for('main.verify_email', token=token, _external=True)

        # Send the email with the verification link
        msg = Message(
            subject='Verify Your Email - KickOff',
            recipients=[user.email]
        )
        msg.html = f"""
        <h2>Welcome to KickOff, {user.username}!</h2>
        <p>Thanks for signing up. To complete your registration, please verify your email by clicking the link below:</p>
        <a href="{verification_url}" style="display:inline-block;padding:10px 20px;color:#fff;background-color:#f1c40f;border-radius:5px;text-decoration:none;">Verify Email</a>
        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p>{verification_url}</p>
        <p>Thank you for joining KickOff!</p>
        """

        try:
            mail.send(msg)
            flash('Account created successfully! A verification email has been sent.', 'success')
        except Exception as e:
            flash(f'Error sending email: {str(e)}', 'danger')
            print(f"Error sending email: {str(e)}")  # Log the error for debugging
            return redirect(url_for('main.home'))  # Redirect if email fails

        return redirect(url_for('main.home'))  # Redirect to home page after account creation

    return render_template('register.html', form=form)

@main.route('/verify/<token>')
def verify_email(token):
    # Verify the token and get the corresponding user
    user = User.verify_verification_token(token)
    if user is None:
        flash('The verification link is invalid or has expired.', 'danger')
        return redirect(url_for('main.home'))

    # Mark the user as verified
    user.is_verified = True
    db.session.commit()
    flash('Your email has been verified!', 'success')
    return redirect(url_for('main.login'))

@main.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()  # Query by email
        if user and user.check_password(form.password.data):  # Check hashed password
            if not user.is_verified:
                flash('Please verify your email before logging in.', 'warning')
                return redirect(url_for('main.login'))  # Prevent login if email not verified
            login_user(user)
            flash('You have successfully logged in!', 'success')
            return redirect(url_for('main.dashboard'))  # Redirect to dashboard or main page
        else:
            flash('Login Unsuccessful. Please check email and password.', 'danger')
    return render_template('login.html', form=form)

@main.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.login'))  # Redirect to login page after logout

@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@main.route('/profile')
def profile():
    return render_template('profile.html')

@main.route('/upload_picture', methods=['POST'])
def upload_picture():
    # Handle the file upload here
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        # Save the file logic (ensure you save it securely)
        # Example: file.save('path_to_save_file')
        return redirect(url_for('main.profile'))  # Redirect to the profile page after upload
    return "No file selected", 400

@main.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    if request.method == 'POST':
        # Update the user profile details here
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Save changes to the database (mock logic here)
        # Example:
        # current_user.username = username
        # current_user.email = email
        # current_user.set_password(password)

        return redirect(url_for('main.profile'))  # Redirect to the profile page
    return render_template('edit_profile.html')

from datetime import datetime

@main.route('/post_game', methods=['GET', 'POST'])
@login_required  # Optional: Ensure only logged-in users can post a game
def post_game():
    if request.method == 'POST':  # Handle form submission
        location = request.form.get('location')
        date_time_str = request.form.get('date_time')  # Get the datetime from the form
        player_count = request.form.get('player_count')
        quality = request.form.get('quality')  # Get the quality from the form
        description = request.form.get('description')  # Get the description from the form (optional)
        
        # Validate the form inputs
        if not location or not date_time_str or not player_count or not quality:
            flash('All fields except description are required!', 'danger')
            return redirect(url_for('main.post_game'))
        
        # Convert the date-time string to a datetime object
        try:
            date_time = datetime.fromisoformat(date_time_str)  # Convert to datetime object
        except ValueError:
            flash('Invalid date/time format. Please use a valid date-time.', 'danger')
            return redirect(url_for('main.post_game'))
        
        # Save to the database
        new_game = Game(
            host_id=current_user.id,  # Assume logged-in user's ID is the host
            location=location,
            time=date_time,  # Store the datetime object
            players_needed=int(player_count),
            quality=quality,  # Store the quality of the game
            description=description  # Optional description
        )
        db.session.add(new_game)
        db.session.commit()
        
        flash('Game posted successfully!', 'success')
        return redirect(url_for('main.dashboard'))  # Redirect after successful submission

    return render_template('post_game.html')

@main.route('/search_game')
def search_game():
    return render_template('search_game.html')

@main.route('/contact', methods=['GET', 'POST'])
def contact():
    # Handle the AJAX POST request
    if request.method == 'POST':
        # Manually validate the fields
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        if not name or not email or not message:
            return jsonify({'success': False, 'error': 'All fields are required.'})

        # Send the email
        msg = Message(
            subject="New Contact Query from KickOff Website",
            recipients=["kickoff.officialapp@gmail.com"],  # Replace with your email address
            body=f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
        )

        try:
            mail.send(msg)
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

    # Return the contact page if it's a GET request
    return render_template('contact.html')
