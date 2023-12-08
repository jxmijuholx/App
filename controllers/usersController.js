const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcypt = require('bcrypt');

// @desc    Get all users
// @route   GET /users
// @access  Private
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean();
    if(!users?.length){
       return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
});

// @desc    create new user
// @route   POST /users
// @access  Private
const createNewUser = asyncHandler(async(req, res) => {
    const {username, password, roles} = req.body
    //Confirm data
    if(!username || !password || !Array.isArray(roles) || roles.length === 0){
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();
    if(duplicate){
        return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashPassword = await bcypt.hash(password, 10); // 10 is the salt

    const userObject = {username, "password": hashPassword, roles};

    // Create new user
    const user = await User.create(userObject);

    if(user){ // If user is created
        res.status(201).json({ message: 'New user ${username} created' });
    }else{
        res.status(400).json({ message: 'User creation failed' });
    }
});

// @desc    update user
// @route   PATCH /users
// @access  Private
const updateUser = asyncHandler(async(req, res) => {
    const {id, username, roles, active, password} = req.body

    // Confrim data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' ){
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({ message: 'User not found' });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();
    // Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Username already exists' });
    }

    // Update user
    user.username = username;
    user.roles = roles;
    user.active = active;
    if(password){
        // hash password
        user.password = await bcypt.hash(password, 10);
    }

    const updatedUser = await user.save();

   res.json({ message: 'User updated ${updatedUser.username}'});
});

// @desc    Delete a user
// @route   DELETE /users
// @access  Private
const deleteUser = asyncHandler(async(req, res) => {
    const {id} = req.body;

    if(!id){
        return res.status(400).json({ message: 'User ID required' });
    }

    const notes = await Note.findOne({user: id}).lean().exec();
    if(notes?.length){
        return res.status(400).json({ message: 'User has assigned notes' });
    }

    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({ message: 'User not found' });
    }

    const result = await user.deleteOne();

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)


});


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}



