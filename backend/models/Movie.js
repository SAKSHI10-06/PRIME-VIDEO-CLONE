const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    poster: { type: String, default: '' },
    backdrop: { type: String, default: '' },
    genres: [{ type: String }],
    releaseDate: { type: String, default: '' },
    releaseYear: { type: Number },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    duration: { type: Number, default: 0 },
    trailerUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    type: { type: String, enum: ['movie', 'show'], default: 'movie' },
    language: { type: String, default: 'en' },
    popularity: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    cast: [{ name: String, character: String, profilePath: String }],
    isLocal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ type: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ popularity: -1 });

module.exports = mongoose.model('Movie', movieSchema);
