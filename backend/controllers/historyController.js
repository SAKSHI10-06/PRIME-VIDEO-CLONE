const WatchHistory = require('../models/WatchHistory');

const getHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ userId: req.user._id }).sort({ lastWatched: -1 }).limit(50);
    res.json({ success: true, history });
  } catch (error) { next(error); }
};

const updateHistory = async (req, res, next) => {
  try {
    const { movieId, playbackPosition, duration, movieData } = req.body;
    if (!movieId) return res.status(400).json({ success: false, message: 'movieId is required' });
    const item = await WatchHistory.findOneAndUpdate(
      { userId: req.user._id, movieId: String(movieId) },
      { playbackPosition: playbackPosition || 0, duration: duration || 0, lastWatched: new Date(), completed: duration > 0 && playbackPosition >= duration * 0.9, movieData: movieData || {} },
      { upsert: true, new: true }
    );
    res.json({ success: true, item });
  } catch (error) { next(error); }
};

const removeHistory = async (req, res, next) => {
  try {
    await WatchHistory.findOneAndDelete({ userId: req.user._id, movieId: String(req.params.movieId) });
    res.json({ success: true, message: 'History entry removed' });
  } catch (error) { next(error); }
};

const clearHistory = async (req, res, next) => {
  try {
    await WatchHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) { next(error); }
};

module.exports = { getHistory, updateHistory, removeHistory, clearHistory };
