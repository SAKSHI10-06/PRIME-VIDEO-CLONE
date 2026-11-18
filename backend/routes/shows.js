const express = require('express');
const router = express.Router();
const { getShows, getShowById } = require('../controllers/movieController');
router.get('/', getShows);
router.get('/:id', getShowById);
module.exports = router;
