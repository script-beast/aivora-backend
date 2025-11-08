import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest, generateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    provider: 'credentials',
  });

  // Generate token
  const token = generateToken(String(user._id));

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Generate token
  const token = generateToken(String(user._id));

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});
