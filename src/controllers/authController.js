const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'staff'
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.otp;

    return successResponse(res, { user: userObj }, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.otp;

    return successResponse(res, { accessToken, refreshToken, user: userObj }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    await user.save();

    // Ideally, send email here
    // await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otpCode}`);

    return successResponse(res, {}, 'OTP sent');
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otp || !user.otp.code) {
      return errorResponse(res, 'Invalid OTP', [], 400);
    }

    if (user.otp.expiresAt < new Date()) {
      user.otp = undefined;
      await user.save();
      return errorResponse(res, 'OTP expired', [], 400);
    }

    if (user.otp.code !== otp) {
      return errorResponse(res, 'Invalid OTP', [], 400);
    }

    user.otp = undefined; // clear OTP
    await user.save();

    const resetToken = crypto.randomBytes(20).toString('hex');
    // Store reset token securely in reality. For this demo, we'll just sign it.
    const signedResetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });

    return successResponse(res, { resetToken: signedResetToken }, 'OTP verified');
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch (e) {
      return errorResponse(res, 'Invalid or expired reset token', [], 400);
    }

    if (decoded.type !== 'reset') {
      return errorResponse(res, 'Invalid token type', [], 400);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, {}, 'Password updated');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // In stateless JWT, logout is typically handled client-side.
    // If blacklisting is needed, it would be added here.
    return successResponse(res, {}, 'Logged out');
  } catch (err) {
    next(err);
  }
};
