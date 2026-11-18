const User = require('../models/User');

const getProfile = async (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, bio } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) { next(error); }
};

module.exports = { getProfile, updateProfile, updatePassword };
