require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo'); 
const userRoutes = require('./routes/main');

const app = express();
const port = process.env.PORT || 5000;

// connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// allow frontend to send cookies for authentication
app.use(cors({
    origin: 'http://localhost:3000', // frontend url
    credentials: true 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Update session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Only use secure in production
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// manually force session save & debug session issues
app.use((req, res, next) => {
    console.log("🔵 [DEBUG] Session before saving:", req.session);
    req.session.save(err => {
        if (err) {
            console.error("❌ Error saving session:", err);
        }
        console.log("🟢 [DEBUG] Session after saving:", req.session);
        next();
    });
});

// flash messages
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.danger = req.flash('danger');
    next();
});

// Add this middleware AFTER passport initialization
app.use((req, res, next) => {
    console.log("🔵 [DEBUG] Session ID:", req.sessionID);
    console.log("🔵 [DEBUG] Session data:", {
        ...req.session,
        passport: req.session.passport // This should now show the user ID
    });
    console.log("🔵 [DEBUG] Authenticated user:", req.user ? {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
    } : undefined);
    next();
});

// routes
app.use('/api', userRoutes);

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
