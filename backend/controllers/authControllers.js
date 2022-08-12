const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");

const registerUser = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("please add all fields");
    }
    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user account
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});
const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    //check for user email
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid credentials");
    }
});
const getme = asyncHandler(async(req, res) => {
    const { _id, name, email } = await User.findById(req.user.id);
    res.status(200).json({
        id: _id,
        name,
        email,
    });
});

//generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "20d",
    });
};
module.exports = {
    registerUser,
    loginUser,
    getme,
};