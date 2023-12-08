const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    roles: [{
        type: String,
        default: 'user',
    }],
    completed: {
        type: Boolean,
        default: true,
    },
})
module.exports = mongoose.model('User', UserSchema)