const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema(
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
    playbackPosition: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    lastWatched: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

watchHistorySchema.index({ userId: 1, movieId: 1 }, { unique: true });
watchHistorySchema.index({ userId: 1, lastWatched: -1 });
module.exports = mongoose.model('WatchHistory', watchHistorySchema);
