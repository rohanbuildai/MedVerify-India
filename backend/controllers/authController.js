const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');

/**
 * Normalizes email address
 * - Trims and lowercases
 * - Drops dots for GMAIL accounts (j.ohn.doe@gmail.com -> johndoe@gmail.com)
 *   as Gmail ignores dots in the local part.
 */
const normalizeEmail = (email) => {
  if (!email) return null;
  let normalized = email.trim().toLowerCase();

  // Gmail dot normalization
  if (normalized.endsWith('@gmail.com')) {
    const [local, domain] = normalized.split('@');
    normalized = `${local.replace(/\./g, '')}@${domain}`;
  }

  return normalized;
};

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        city: user.city,
        isEmailVerified: user.isEmailVerified,
        reportsCount: user.reportsCount,
        verificationCount: user.verificationCount
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, password, phone, state, city, role, adminKey } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check for admin registration
    if (role === 'admin' && adminKey !== process.env.ADMIN_SECRET_KEY) {
      return next(new AppError('Invalid admin registration key', 403));
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      state,
      city,
      role: role === 'pharmacist' || (role === 'admin' && adminKey === process.env.ADMIN_SECRET_KEY) ? role : 'user'
    });

    // Send verification email
    try {
      const verToken = user.getEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verUrl = `${process.env.CLIENT_URL}/verify-email/${verToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Verify your MedVerify account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a6b3c;">Welcome to MedVerify India! 🏥</h2>
            <p>Hello ${user.name},</p>
            <p>Thank you for joining MedVerify India — together we fight fake medicines.</p>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verUrl}" style="background: #1a6b3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't fail registration if email fails
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if account is locked
    if (user.isLocked) {
      return next(new AppError('Account temporarily locked due to too many failed attempts. Try again in 30 minutes.', 423));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 min lock
      }
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Invalid credentials', 401));
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with that email', 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - MedVerify India',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a6b3c;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your MedVerify account.</p>
            <a href="${resetUrl}" style="background: #1a6b3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
            <p>This link expires in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};
