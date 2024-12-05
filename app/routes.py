#essential imports
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app.forms import RegistrationForm, LoginForm, ContactForm
from app.models import User,Game,GamePlayer
from app import db,mail
from werkzeug.security import generate_password_hash
from flask_mail import Message
from datetime import datetime

#for file-handling
import os
from werkzeug.utils import secure_filename

#for db duplicate entries
from sqlalchemy.exc import IntegrityError

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('home.html')

@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        # hash the password before storing
        hashed_password = generate_password_hash(form.password.data)

        user = User(username=form.username.data, email=form.email.data, password=hashed_password)

        try:
            db.session.add(user)
            db.session.commit()

            # generate verification token
            token = user.get_verification_token()
            verification_url = url_for('main.verify_email', token=token, _external=True)

            # send an email with the verification link
            msg = Message(
                subject='Verify Your Email - KickOff',
                recipients=[user.email]
            )
            msg.html = f"""
            <h2>Welcome to KickOff, {user.username}!</h2>
            <p>Thanks for signing up! To complete your registration, please verify your email by clicking the link below:</p>
            <a href="{verification_url}" style="display:inline-block;padding:10px 20px;color:#fff;background-color:#f1c40f;border-radius:5px;text-decoration:none;">Verify Email</a>
            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <p>{verification_url}</p>
            <p>Thank you again for joining KickOff!</p>
            """
            try:
                mail.send(msg)
                flash('Account created successfully! A verification email has been sent.', 'success')
            except Exception as e:
                flash(f'Error sending email: {str(e)}', 'danger')
                print(f"Error sending email: {str(e)}")  #debug
                return redirect(url_for('main.home'))  

            return redirect(url_for('main.login'))

        except IntegrityError as e:
            db.session.rollback()  
            if 'user.username' in str(e.orig):  
                flash('Username already exists. Please try a different one.', 'danger')
            elif 'user.email' in str(e.orig):
                flash('Email Address already in use. Please use a different one.', 'danger')
            else:
                flash('An unexpected error occurred. Please try again.', 'danger')

    return render_template('register.html', form=form)

@main.route('/verify/<token>')
def verify_email(token):
    # verify the token and get the corresponding user
    user = User.verify_verification_token(token)
    if user is None:
        flash('The verification link is invalid or has expired.', 'danger')
        return redirect(url_for('main.home'))

    # mark the user as verified
    user.is_verified = True
    db.session.commit()
    flash('Your email has been verified!', 'success')
    return redirect(url_for('main.login'))

@main.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()  # query by email
        if user and user.check_password(form.password.data):  # check hashed password
            if not user.is_verified:
                flash('Please verify your email before logging in.', 'warning')
                return redirect(url_for('main.login'))  # prevent login if email not verified
            login_user(user)
            return redirect(url_for('main.dashboard'))  # redirect to dashboard
        else:
            flash('Login Failed. Please check email and password.', 'danger')
    return render_template('login.html', form=form)

@main.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.login'))  # redirect to login page after logout

@main.route('/dashboard')
def dashboard():
    if not current_user.is_authenticated:
        flash("You need to log in to access the arena.", "warning")
        return redirect(url_for('main.login'))
    
    # user's games: games that they are hosting or have joined
    user_games = Game.query.filter(
        (Game.host_id == current_user.id) | 
        (Game.players.any(id=current_user.id))  
    ).all()
    
    # available games: games they haven't joined and are not hosting
    available_games = Game.query.filter(
        (Game.host_id != current_user.id) & 
        (~Game.players.any(id=current_user.id))  
    ).all()
    
    return render_template(
        'dashboard.html', 
        username=current_user.username, 
        user_games=user_games, 
        available_games=available_games
    )


@main.route('/filter-games', methods=['POST'])
def filter_games():
    data = request.json
    print('Received filter data:', data)  #debug

    search_query = data.get('search_query', '').lower()
    skill_level = data.get('skill_level', '')

    query = Game.query
    if search_query:
        query = query.filter(Game.location.ilike(f"%{search_query}%"))
    if skill_level:
        query = query.filter_by(quality=skill_level)

    games = query.all()
    print('Filtered games:', games)  #debug

    game_data = [
        {
            "id": game.id,
            "quality": game.quality,
            "time": game.time.strftime('%Y-%m-%d %H:%M'),
            "location": game.location,
        }
        for game in games
    ]

    return jsonify(game_data)

# cancel a game (for hosts)
@main.route('/cancel_game/<int:game_id>', methods=['POST'])
def cancel_game(game_id):
    game = Game.query.get_or_404(game_id)
    if game.host_id != current_user.id:
        flash("You are not authorized to cancel this game.", "danger")
        return redirect(url_for('main.dashboard'))
    
    # remove all associated players before deleting the game
    GamePlayer.query.filter_by(game_id=game.id).delete()
    db.session.delete(game)
    db.session.commit()
    flash("The game has been canceled successfully.", "success")
    return redirect(url_for('main.dashboard'))


# backing out of a game (for players)
@main.route('/back_out/<int:game_id>', methods=['POST'])
def back_out(game_id):
    game = Game.query.get_or_404(game_id)
    association = GamePlayer.query.filter_by(game_id=game.id, user_id=current_user.id).first()

    if not association:
        flash("You are not part of this game.", "danger")
        return redirect(url_for('main.dashboard'))
    
    # remove the player from the game and increment players_needed
    db.session.delete(association)
    game.players_needed += 1
    db.session.commit()
    flash("You have successfully backed out of the game.", "success")
    return redirect(url_for('main.dashboard'))


# view games hosted by the current user
@main.route('/my_hosted_games')
def my_hosted_games():
    if not current_user.is_authenticated:
        flash("You need to log in to see games you hosted.", "warning")
        return redirect(url_for('main.login'))

    hosted_games = Game.query.filter_by(host_id=current_user.id).all()
    return render_template('my_hosted_games.html', hosted_games=hosted_games)

# allowed extensions for profile pictures
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# function to check if file is a valid image type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# view and edit profile for users
@main.route('/profile', methods=['GET', 'POST'])
def profile():
    if not current_user.is_authenticated:  
        flash("You need to log in to view your profile.", "warning")
        return redirect(url_for('main.login'))  

    hosted_games = current_user.hosted_games  # games hosted by the user
    joined_games = Game.query.filter(Game.players.any(id=current_user.id)).all()  # games the user has joined

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # update the user profile details
        if username:
            current_user.username = username
        if email:
            current_user.email = email
        if password:
            current_user.set_password(generate_password_hash(password))

        # save changes to the db
        db.session.commit()

        flash('Profile updated successfully.', 'success')
        return redirect(url_for('main.profile'))  # redirect to the profile page

    return render_template('profile.html', hosted_games=hosted_games, joined_games=joined_games)


# uploading a profile picture 
@main.route('/upload_picture', methods=['POST'])
def upload_picture():
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        if file.filename == '':
            flash("No selected file", "warning")
            return redirect(url_for('main.profile'))
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            static_folder = os.path.join(os.getcwd(), 'app', 'static')
            profile_pics_folder = os.path.join(static_folder, 'profile_pics')

            if not os.path.exists(profile_pics_folder):
                os.makedirs(profile_pics_folder)

            file_path = os.path.join(profile_pics_folder, filename)

            try:
                file.save(file_path)
            except Exception as e:
                print("Error saving file:", str(e))

            current_user.profile_picture = filename
            db.session.commit()

            flash("Profile picture uploaded successfully.", "success")
        else:
            flash("Invalid file type. Please upload a PNG or JPG image", "danger")
        
    return redirect(url_for('main.profile'))



@main.route('/post_game', methods=['GET', 'POST'])
def post_game():
    if not current_user.is_authenticated:  
        flash("You need to log in to post a game.", "warning")
        return redirect(url_for('main.login'))  
    
    if request.method == 'POST':  # handle form submission
        location = request.form.get('location')
        date_time_str = request.form.get('date_time')  
        player_count = request.form.get('player_count')
        quality = request.form.get('quality')  
        description = request.form.get('description')  
        
        # validate the form inputs
        if not location or not date_time_str or not player_count or not quality:
            flash('All fields except description are required!', 'danger')
            return redirect(url_for('main.post_game'))
        
        # convert the date-time string to a datetime object
        try:
            date_time = datetime.fromisoformat(date_time_str)
        except ValueError:
            flash('Invalid date/time format. Please use a valid date-time.', 'danger')
            return redirect(url_for('main.post_game'))
        
        # save to the db
        new_game = Game(
            host_id=current_user.id,  # assume logged-in user's ID is the host
            location=location,
            time=date_time,  
            players_needed=int(player_count),
            quality=quality, 
            description=description  
        )
        db.session.add(new_game)
        db.session.commit()
        
        flash('Game posted successfully!', 'success')
        return redirect(url_for('main.dashboard'))  # redirect after successful submission

    return render_template('post_game.html')


@main.route('/join_game/<int:game_id>', methods=['POST'])
def join_game(game_id):
    if not current_user.is_authenticated:
        flash("You need to log in to join a game.", "warning")
        return redirect(url_for('main.login'))

    game = Game.query.get_or_404(game_id)

    # prevent the host from joining their own game
    if game.host_id == current_user.id:
        flash("You cannot join a game you are hosting.", "info")
        return redirect(url_for('main.dashboard'))
    
    # check if the user is already in the game
    if GamePlayer.query.filter_by(game_id=game.id, user_id=current_user.id).first():
        flash("You are already part of this game.", "info")
    # check if game already got required players
    elif game.players_needed <= 0:
        flash("This game is already full.", "warning")
    else:
        # add the user to the game and decrement players_needed
        association = GamePlayer(game_id=game.id, user_id=current_user.id, username=current_user.username)
        db.session.add(association)
        game.players_needed -= 1
        db.session.commit()
        flash("You have successfully joined the game.", "success")
    
    return redirect(url_for('main.dashboard'))


@main.route('/contact', methods=['GET', 'POST'])
def contact():
    # handle the AJAX POST request
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        if not name or not email or not message:
            return jsonify({'success': False, 'error': 'All fields are required.'})

        # automatically send email with the query
        msg = Message(
            subject="New Contact Query from KickOff Website",
            recipients=["kickoff.officialapp@gmail.com"],
            body=f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
        )

        try:
            mail.send(msg)
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

    return render_template('contact.html')

@main.route('/delete_account', methods=['POST'])
@login_required
def delete_account():
    user = User.query.get(current_user.id)
    if user:
        try:
            db.session.delete(user)
            db.session.commit()
            logout_user()  # log out the user after deleting their account
            flash('Your account has been successfully deleted.', 'success')
            return redirect(url_for('main.home'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred while deleting your account. Please try again later.', 'danger')
            print(f"Error deleting account: {str(e)}")  # debug
    else:
        flash('User not found.', 'danger')
    return redirect(url_for('main.profile'))