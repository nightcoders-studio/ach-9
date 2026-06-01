const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { success, created, error } = require('../utils/response');
const userModel = require('../models/userModel');
const walletModel = require('../models/walletModel');

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !phone || !password || !role) {
      return error(res, 400, 'VALIDATION_ERROR', 'All fields are required');
    }

    if (!['customer', 'buter'].includes(role)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Role must be customer or buter');
    }

    if (password.length < 6) {
      return error(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters');
    }

    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail) {
      return error(res, 409, 'CONFLICT', 'Email already registered');
    }

    const existingPhone = await userModel.getUserByPhone(phone);
    if (existingPhone) {
      return error(res, 409, 'CONFLICT', 'Phone number already registered');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
      full_name,
      email,
      phone,
      password_hash,
      role
    });

    // Create wallet for buter
    if (role === 'buter') {
      await walletModel.createWallet(user.id);
    }

    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: !!user.is_verified,
      buter_detail: user.buter_detail,
      stats: user.stats,
      created_at: user.created_at
    };

    return created(res, 'User registered successfully', userData);
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Registration failed');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 400, 'VALIDATION_ERROR', 'Email and password are required');
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return error(res, 401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return success(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: !!user.is_verified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Login failed');
  }
};

module.exports = { register, login };