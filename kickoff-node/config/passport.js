const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            console.log(`Authenticating user with email: ${email}`);
            User.findOne({ email: email.toLowerCase() })
                .then(user => {
                    if (!user) {
                        console.log(`User not found with email: ${email}`);
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    console.log(`User found: ${user.email}`);
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.error("Error comparing passwords:", err);
                            throw err;
                        }
                        if (isMatch) {
                            if (!user.is_verified) {
                                console.log(`User not verified: ${user.email}`);
                                return done(null, false, { message: 'Please verify your email before logging in.' });
                            }
                            console.log(`Password matched for user: ${user.email}`);
                            return done(null, user);
                        } else {
                            console.log(`Password incorrect for user: ${user.email}`);
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                .catch(err => {
                    console.error("Error finding user:", err);
                    done(err);
                });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};