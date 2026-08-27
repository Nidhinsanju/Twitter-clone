const express = require('express');
const router = express.Router();
const {
  createTweet,
  getTweets,
  toggleLikeTweet,
  deleteTweet,
  replyTweet,
} = require('../controllers/tweetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getTweets).post(protect, createTweet);
router.route('/:id').delete(protect, deleteTweet);
router.route('/:id/like').post(protect, toggleLikeTweet);
router.route('/:id/reply').post(protect, replyTweet);

module.exports = router;
