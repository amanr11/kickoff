const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    profile_picture: {
        type: String,
        default: 'default_profile.png'
    },
    bio: {
        type: String
    },
    skill_level: {
        type: String
    }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    try {
        console.log("🔵 Comparing passwords for user:", this.email);
        const isMatch = await bcrypt.compare(password, this.password);
        console.log(`${isMatch ? '✅' : '❌'} Password match result:`, isMatch);
        return isMatch;
    } catch (err) {
        console.error("❌ Error comparing passwords:", err);
        throw err;
    }
};

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, config.secretOrKey, { expiresIn: '1h' });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;