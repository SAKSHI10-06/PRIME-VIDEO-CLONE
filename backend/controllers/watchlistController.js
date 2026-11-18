const Watchlist = require('../models/Watchlist');

const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, watchlist: items });
  } catch (error) { next(error); }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, movieData } = req.body;
    if (!movieId) return res.status(400).json({ success: false, message: 'movieId is required' });
    const existing = await Watchlist.findOne({ userId: req.user._id, movieId: String(movieId) });
    if (existing) return res.status(400).json({ success: false, message: 'Already in watchlist' });
    const item = await Watchlist.create({ userId: req.user._id, movieId: String(movieId), movieData: movieData || {} });
    res.status(201).json({ success: true, item });
  } catch (error) { next(error); }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const result = await Watchlist.findOneAndDelete({ userId: req.user._id, movieId: String(req.params.movieId) });
    if (!result) return res.status(404).json({ success: false, message: 'Item not found in watchlist' });
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) { next(error); }
};

const checkWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findOne({ userId: req.user._id, movieId: String(req.params.movieId) });
    res.json({ success: true, inWatchlist: !!item });
  } catch (error) { next(error); }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, checkWatchlist };
