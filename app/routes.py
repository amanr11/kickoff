from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user
from app.forms import RegistrationForm, LoginForm
from app.models import User
from app import db
from werkzeug.security import generate_password_hash
from flask_mail import Message
from app import mail

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
        <a href="{verification_url}" style="display:inline-block;padding:10px 20px;color:#fff;background-color:#007bff;border-radius:5px;text-decoration:none;">Verify Email</a>
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

@main.route('/post_game', methods=['GET', 'POST'])
@login_required
def post_game():
    from app.forms import GameForm  # Ensure import if not at the top
    from app.models import Game  # Import the Game model
    from flask_login import current_user  # For the logged-in user's ID

    form = GameForm()
    if form.validate_on_submit():  # When the form is submitted and valid
        new_game = Game(
            host_id=current_user.id,  # Assuming the user is logged in
            title=form.title.data,
            location=form.location.data,
            time=form.date_time.data,
            players_needed=form.players_needed.data
        )
        db.session.add(new_game)
        db.session.commit()  # Save the game to the database
        flash('Game posted successfully!', 'success')
        return redirect(url_for('main.dashboard'))  # Redirect to the dashboard

    return render_template('post_game.html', form=form)


@main.route('/search_game')
def search_game():
    return render_template('search_game.html')

@main.route('/contact')
def contact():
    return render_template('contact.html')
