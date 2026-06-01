const { success, error } = require('../utils/response');
const userModel = require('../models/userModel');
const walletModel = require('../models/walletModel');

const getMe = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }
    return success(res, null, user);
  } catch (err) {
    console.error('GetMe error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get user');
  }
};

const updateMe = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await userModel.updateUser(req.user.id, { full_name, phone });
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }
    return success(res, 'Profile updated successfully', user);
  } catch (err) {
    console.error('UpdateMe error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to update profile');
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const bcrypt = require('bcryptjs');

    if (!current_password || !new_password) {
      return error(res, 400, 'VALIDATION_ERROR', 'Current and new password required');
    }

    if (new_password.length < 6) {
      return error(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters');
    }

    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return error(res, 401, 'UNAUTHORIZED', 'Current password is incorrect');
    }

    const pool = require('../config/database');
    const password_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);

    return success(res, 'Password changed successfully');
  } catch (err) {
    console.error('ChangePassword error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to change password');
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await userModel.getPublicProfile(req.params.id);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }
    return success(res, null, user);
  } catch (err) {
    console.error('GetPublicProfile error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get profile');
  }
};

module.exports = { getMe, updateMe, changePassword, getPublicProfile };