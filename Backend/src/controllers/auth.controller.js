const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

/**
 * - user register controller
 * - POST /api/auth/register
 */
async function userRegisterController(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password, and name are required",
        status: "failed",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        status: "failed",
      });
    }

    const isExists = await userModel.findOne({ email });

    if (isExists) {
      return res.status(422).json({
        message: "User already exists with this email address.",
        status: "failed",
      });
    }

    const user = await userModel.create({
      email,
      password,
      name,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    // Send welcome email and await socket completion
    try {
      await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (err) {
      console.error("Welcome email failed to send:", err.message);
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * - User Login Controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email }).select("+password +systemUser");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        systemUser: Boolean(user.systemUser),
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await tokenBlackListModel.create({ token });
    }

    res.clearCookie("token", COOKIE_OPTIONS);

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
};
