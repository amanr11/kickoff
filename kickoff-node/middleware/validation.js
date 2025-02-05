const { check, validationResult } = require('express-validator');

exports.registrationValidation = [
    check('username', 'Username is required').not().isEmpty().isLength({ min: 2, max: 20 }),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password must be at least 6 characters, contain one letter, one number, and one special character').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/),
    check('confirm_password', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
];

exports.loginValidation = [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty()
];

exports.profileValidation = [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Email is required').isEmail()
];

exports.gameValidation = [
    check('location', 'Location is required').not().isEmpty().isLength({ max: 100 }),
    check('date_time', 'Date and Time are required').not().isEmpty(),
    check('players_needed', 'Players Needed is required').isInt({ min: 1 }),
    check('quality', 'Game Quality is required').not().isEmpty().isLength({ max: 100 })
];

exports.contactValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('message', 'Message is required').not().isEmpty()
];

exports.forgotPasswordValidation = [
    check('email', 'Email Address is required').isEmail()
];

exports.resetPasswordValidation = [
    check('password', 'New Password must be at least 6 characters, contain one letter, one number, and one special character').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
];

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};