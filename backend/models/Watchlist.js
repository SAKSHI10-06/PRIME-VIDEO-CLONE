const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: String, required: true },
    movieData: {
      title: String,
      poster: String,
      backdrop: String,
      rating: Number,
      releaseYear: Number,
      genres: [String],
      type: String,
      duration: Number,
    },
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
module.exports = mongoose.model('Watchlist', watchlistSchema);
