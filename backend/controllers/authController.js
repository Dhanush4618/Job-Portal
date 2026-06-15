import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate access tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });
};

// Helper to generate refresh tokens
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Ensure role is valid
    const userRole = role || 'Candidate';
    if (!['Candidate', 'Recruiter', 'Admin'].includes(userRole)) {
      res.status(400);
      throw new Error('Invalid user role');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user model
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    // Find user & include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    // Read from cookie or body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      res.status(403);
      throw new Error('Invalid or expired refresh token');
    }

    // Verify token signature
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        res.status(403);
        throw new Error('Token verification failed');
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user._id);
      res.json({ token: newAccessToken });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User / Clear Tokens
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    // Clear refresh token in database if available
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    } else if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    // Clear HTTP-only cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        resumePath: user.resumePath,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companyDescription: user.companyDescription,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;

      if (user.role === 'Candidate') {
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

        // Parse skills if provided as string or array
        if (req.body.skills !== undefined) {
          if (Array.isArray(req.body.skills)) {
            user.skills = req.body.skills;
          } else if (typeof req.body.skills === 'string') {
            user.skills = req.body.skills
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
          }
        }

        if (req.file) {
          user.resumePath = `/uploads/resumes/${req.file.filename}`;
        } else if (req.body.resumePath !== undefined) {
          user.resumePath = req.body.resumePath;
        }
      }

      if (user.role === 'Recruiter') {
        user.companyName = req.body.companyName !== undefined ? req.body.companyName : user.companyName;
        user.companyWebsite = req.body.companyWebsite !== undefined ? req.body.companyWebsite : user.companyWebsite;
        user.companyDescription = req.body.companyDescription !== undefined ? req.body.companyDescription : user.companyDescription;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        resumePath: updatedUser.resumePath,
        companyName: updatedUser.companyName,
        companyWebsite: updatedUser.companyWebsite,
        companyDescription: updatedUser.companyDescription,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
