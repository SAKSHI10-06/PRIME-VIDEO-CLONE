const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt } });
  } catch (error) { next(error); }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt } });
  } catch (error) { next(error); }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
