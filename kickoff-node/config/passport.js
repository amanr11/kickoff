const LocalStrategy = require('passport-local').Strategy; 
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {  
            try {  
                console.log(`Authenticating user with email: ${email}`);  
                const user = await User.findOne({ email: email.toLowerCase() });  
        
                if (!user) {  
                    return done(null, false, { message: 'That email is not registered' });  
                }  
        
                const isMatch = await user.comparePassword(password);
                
                if (!isMatch) {
                    return done(null, false, { message: 'Password incorrect' });
                }
        
                if (!user.is_verified) {  
                    return done(null, false, { message: 'Please verify your email before logging in.' });  
                }  
        
                return done(null, user);  
            } catch (err) {  
                console.error("Error during authentication:", err);  
                return done(err);  
            }  
        })
    );

    passport.serializeUser((user, done) => {
        console.log(`🔵 Serializing user:`, {
            id: user._id,
            username: user.username,
            email: user.email
        });
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            console.log(`🔵 Deserializing user with id:`, id);
            const user = await User.findById(id).select('-password');
            if (!user) {
                console.log(`❌ No user found during deserialization with id:`, id);
                return done(null, false);
            }
            console.log(`✅ User deserialized successfully:`, {
                id: user._id,
                username: user.username,
                email: user.email
            });
            done(null, user);
        } catch (err) {
            console.error("❌ Error during deserialization:", err);
            done(err);
        }
    });
};
