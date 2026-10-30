const router = require('express').Router();
const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');
const {
  validateUserId,
  validateProfile,
  validateAvatar,
} = require('../middlewares/validation');

// O cadastro saiu daqui: agora é o POST /signup, no app.js.
router.get('/', getUsers);
// /me ANTES de /:userId: os dois são GET, e o Express usa a primeira rota
// que casa. Na ordem inversa, "me" chegaria como um userId.
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUserById);
router.patch('/me', validateProfile, updateProfile);
router.patch('/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
