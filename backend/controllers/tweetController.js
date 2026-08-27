const Tweet = require('../models/Tweet');

// @desc    Create a tweet
// @route   POST /api/tweets
// @access  Private
const createTweet = async (req, res) => {
  const { text, images } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Tweet text is required' });
  }

  try {
    const tweet = await Tweet.create({
      user: req.user._id,
      text,
      images: images || [],
    });

    const populatedTweet = await tweet.populate('user', 'name username profileImage');
    res.status(201).json(populatedTweet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tweets
// @route   GET /api/tweets
// @access  Public
const getTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate('user', 'name username profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name username profileImage' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or Unlike a tweet
// @route   POST /api/tweets/:id/like
// @access  Private
const toggleLikeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const userId = req.user._id;

    if (tweet.likes.includes(userId)) {
      // Unlike
      tweet.likes = tweet.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      tweet.likes.push(userId);
    }

    await tweet.save();
    res.status(200).json({ likes: tweet.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a tweet
// @route   DELETE /api/tweets/:id
// @access  Private
const deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Check if user owns the tweet
    if (tweet.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this tweet' });
    }

    await tweet.deleteOne();
    res.status(200).json({ message: 'Tweet removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a tweet
// @route   POST /api/tweets/:id/reply
// @access  Private
const replyTweet = async (req, res) => {
  const { text, images } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Reply text is required' });
  }

  try {
    const parentTweet = await Tweet.findById(req.params.id);

    if (!parentTweet) {
      return res.status(404).json({ message: 'Parent tweet not found' });
    }

    const reply = await Tweet.create({
      user: req.user._id,
      text,
      images: images || [],
    });

    parentTweet.replies.push(reply._id);
    await parentTweet.save();

    const populatedReply = await reply.populate('user', 'name username profileImage');
    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTweet,
  getTweets,
  toggleLikeTweet,
  deleteTweet,
  replyTweet,
};
