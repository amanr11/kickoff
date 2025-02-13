const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const GamePlayer = require('../models/GamePlayer');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { 
    registrationValidation, 
    loginValidation, 
    profileValidation, 
    gameValidation, 
    contactValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation, 
    validate 
} = require('../middleware/validation');



// Passport Config
require('../config/passport')(passport);

// Home route
router.get('/', (req, res) => res.render('home'));

// Register route
router.get('/register', (req, res) => res.render('register'));

router.post('/register', registrationValidation, validate, async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Register route called with data:", { username, email, password });

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log("User already exists with email:", email);
            return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
        }


        user = new User({ username, email, password });
        await user.save();
        console.log("New user created and saved:", user);

        const token = user.generateAuthToken();
        console.log("Verification token:", token); // Log the token for testing
        const verificationUrl = `http://${req.headers.host}/api/verify/${token}`;

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }
        });

        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Verify Your Email',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", email);

        res.status(200).json({ message: 'You are now registered and a verification email has been sent.' });
    } catch (err) {
        console.error("Error in register route:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Verify email route
router.get('/verify/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, config.secretOrKey);
        let user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }
        user.is_verified = true;
        await user.save();
        res.redirect('http://localhost:3000/login?verified=true'); // Redirect to login with success parameter
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Handle login
router.post('/login', (req, res, next) => {
    console.log("🔵 Login attempt for email:", req.body.email);
    
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("❌ Authentication error:", err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (!user) {
            console.log("❌ Authentication failed:", info.message);
            return res.status(400).json({ message: info.message });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                console.error("❌ Login error:", err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            console.log("✅ User logged in successfully:", {
                id: user._id,
                username: user.username,
                email: user.email
            });
            
            return res.status(200).json({ 
                success: true, 
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
});

// Dashboard route (protected)
router.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You need to log in to access the dashboard.' });
    }

    try {
        const user = await User.findById(req.user.id);  // fetch user details
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // fetch games where the user is either the host or has joined
        const userGames = await Game.find({
            $or: [{ host_id: user.id }, { players: user.id }]
        }).populate('host', 'username');

        // fetch available games (games the user hasn't joined or hosted)
        const availableGames = await Game.find({
            host_id: { $ne: user.id },
            players: { $nin: [user.id] }
        }).populate('host', 'username');

        res.status(200).json({ 
            username: user.username,  // <-- now returning the username
            userGames, 
            availableGames 
        });

    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/check-auth', (req, res) => {
    console.log("Auth check route hit");
    console.log("Session ID:", req.sessionID);
    console.log("Session:", req.session);
    console.log("User:", req.user);
    
    if (req.isAuthenticated()) {
        res.json({ 
            isAuthenticated: true, 
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});



// Profile route
router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('profile', { user: req.user });
});

router.post('/profile', profileValidation, validate, async (req, res) => {
    const { username, email, password, bio, skill_level } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        user.username = username || user.username;
        user.email = email || user.email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        user.bio = bio || user.bio;
        user.skill_level = skill_level || user.skill_level;
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Forgot password route
router.get('/forgot_password', (req, res) => res.render('forgot_password'));

router.post('/forgot_password', forgotPasswordValidation, validate, async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const token = user.generateAuthToken();
        const resetUrl = `http://${req.headers.host}/reset_password/${token}`;

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: 'your-email@gmail.com', pass: 'your-email-password' }
        });

        const mailOptions = {
            to: email,
            from: 'your-email@gmail.com',
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Reset password route
router.get('/reset_password/:token', (req, res) => res.render('reset_password', { token: req.params.token }));

router.post('/reset_password/:token', resetPasswordValidation, validate, async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, config.secretOrKey);
        let user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Contact route
router.get('/contact', (req, res) => res.render('contact'));

router.post('/contact', contactValidation, validate, async (req, res) => {
    const { name, email, message } = req.body;
    try {
        // Send contact email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: 'your-email@gmail.com', pass: 'your-email-password' }
        });

        const mailOptions = {
            to: 'kickoff.officialapp@gmail.com',
            from: 'your-email@gmail.com',
            subject: 'New Contact Query from KickOff Website',
            html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message:</p><p>${message}</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Game routes
router.get('/post_game', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('post_game');
});

router.post('/post_game', gameValidation, validate, async (req, res) => {
    const { location, date_time, players_needed, quality, description } = req.body;
    try {
        const game = new Game({
            host_id: req.user.id,
            location,
            time: new Date(date_time),
            players_needed,
            quality,
            description
        });
        await game.save();
        res.status(200).json({ message: 'Game posted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/join_game/:game_id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const game = await Game.findById(req.params.game_id);
        if (!game) {
            return res.status(400).json({ msg: 'Game not found' });
        }
        if (game.host_id.equals(req.user.id)) {
            return res.status(400).json({ msg: 'You cannot join your own game' });
        }
        if (game.players_needed <= 0) {
            return res.status(400).json({ msg: 'This game is already full' });
        }
        const gamePlayer = new GamePlayer({
            game_id: game.id,
            user_id: req.user.id,
            username: req.user.username
        });
        await gamePlayer.save();
        game.players_needed -= 1;
        await game.save();

        const notification = new Notification({
            user_id: game.host_id,
            message: `${req.user.username} has joined your game: ${game.location}.`
        });
        await notification.save();

        res.status(200).json({ message: 'You have successfully joined the game' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/leave_game/:game_id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const gamePlayer = await GamePlayer.findOne({ game_id: req.params.game_id, user_id: req.user.id });
        if (!gamePlayer) {
            return res.status(400).json({ msg: 'You are not part of this game' });
        }
        await gamePlayer.remove();

        const game = await Game.findById(req.params.game_id);
        game.players_needed += 1;
        await game.save();

        res.status(200).json({ message: 'You have successfully left the game' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/cancel_game/:game_id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const game = await Game.findById(req.params.game_id);
        if (!game) {
            return res.status(400).json({ msg: 'Game not found' });
        }
        if (!game.host_id.equals(req.user.id)) {
            return res.status(400).json({ msg: 'You are not authorized to cancel this game' });
        }
        await GamePlayer.deleteMany({ game_id: game.id });
        await game.remove();
        res.status(200).json({ message: 'The game has been cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/my_hosted_games', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const games = await Game.find({ host_id: req.user.id });
        res.render('my_hosted_games', { games });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/notifications', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const notifications = await Notification.find({ user_id: req.user.id }).sort({ timestamp: -1 });
        res.render('notifications', { notifications });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;