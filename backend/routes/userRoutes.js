const express = require('express');
const router = express.Router();
const { getUserProfile, toggleFollowUser, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search/:query', searchUsers);
router.get('/:username', getUserProfile);
router.post('/:id/follow', protect, toggleFollowUser);

module.exports = router;
