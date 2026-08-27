const User = require('../models/User');
const Tweet = require('../models/Tweet');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user's tweets
    const tweets = await Tweet.find({ user: user._id })
      .populate('user', 'name username profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ user, tweets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow or Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id;

    if (userToFollowId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userToFollowId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      // Follow
      currentUser.following.push(userToFollowId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      following: currentUser.following
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search/:query
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('name username profileImage').limit(10);
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  toggleFollowUser,
  searchUsers
};
