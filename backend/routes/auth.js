// routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe,
  forgotPassword, resetPassword, verifyEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', body('email').isEmail(), forgotPassword);
router.put('/reset-password/:token', body('password').isLength({ min: 8 }), resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
