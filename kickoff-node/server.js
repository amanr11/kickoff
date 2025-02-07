require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const userRoutes = require('./routes/main');

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.danger = req.flash('danger');
    next();
});

app.use('/api', userRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));