const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const { jwtAccessKey } = require("../secret");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");

const isLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw createError(401, "You are not logged in");
    }
    const decoded = jwt.verify(token, jwtAccessKey);
    req.user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
      profilePicture: decoded.profilePicture,
      isBanned: decoded.isBanned,
      verificationStatus: decoded.verificationStatus,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const isOwner = (req, res, next) => {
  try {
    const userId = req.params.id;
    const loggedInUserId = req.user._id;
    if (userId !== loggedInUserId.toString()) {
      throw createError(
        403,
        "Not authorized, You can only access your own data"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

const isNotBanned = async (req, res, next) => {
  try {
    const requesterId = req.user?._id;
    if (!requesterId) {
      throw createError(401, "You are not logged in");
    }

    // The ban flag on the token is whatever was true when the token was
    // signed, so a ban only takes effect once that token expires. Fifteen
    // minutes is a long time to keep serving someone their customers' names,
    // addresses and phone numbers, so this reads the live record instead.
    //
    // Admins have no row in the User collection; a missing user is therefore
    // not a rejection here, it just means this is not a customer account and
    // the route's own admin check is what governs.
    const user = await User.findById(requesterId).select("isBanned").lean();
    if (user?.isBanned) {
      throw createError(403, "Your account is banned");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const isLoggedOut = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();

  try {
    jwt.verify(token, jwtAccessKey);
  } catch (error) {
    // Expired or malformed means they are NOT logged in, so let them log in.
    //
    // This used to reject: the verify happened inside a try whose catch called
    // next(error), so a stale cookie answered /login with 500 "jwt expired"
    // instead of signing the person in. Since access tokens last 15 minutes,
    // that is the ordinary state of anyone returning after a break - they were
    // locked out until they cleared cookies by hand.
    return next();
  }

  // A token that verifies means there is a live session already.
  return next(createError(401, "You are already logged in"));
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw createError(401, "Access denied. No token provided");
    }
    const decoded = jwt.verify(token, jwtAccessKey);
    const admin = await Admin.findOne({
      _id: decoded._id,
      email: decoded.email,
    });
    if (!admin) {
      throw createError(403, "Access denied. Admin privileges required");
    }
    // Add admin info to request object
    req.admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw createError(401, "Access denied. No token provided");
    }
    const decoded = jwt.verify(token, jwtAccessKey);
    const admin = await Admin.findOne({
      _id: decoded._id,
      email: decoded.email,
    });
    if (!admin || admin.role !== "superadmin") {
      throw createError(403, "Access denied. Super admin privileges required");
    }
    next();
  } catch (error) {
    next(error);
  }
};

const isAdminLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw createError(401, "Admin not logged in");
    }
    const decoded = jwt.verify(token, jwtAccessKey);
    const admin = await Admin.findOne({
      _id: decoded._id,
      email: decoded.email,
    });
    if (!admin) {
      throw createError(403, "Admin not found");
    }
    req.admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const isAdminLoggedOut = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();

  let decoded;
  try {
    decoded = jwt.verify(token, jwtAccessKey);
  } catch (error) {
    // Same as isLoggedOut: a stale cookie is not a live session, and must not
    // stand between an admin and the login form.
    return next();
  }

  try {
    const admin = await Admin.findOne({
      _id: decoded._id,
      email: decoded.email,
    });
    if (admin) {
      return next(createError(400, "Admin already logged in"));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  isLoggedIn,
  isOwner,
  isNotBanned,
  isLoggedOut,
  isAdmin,
  isSuperAdmin,
  isAdminLoggedIn,
  isAdminLoggedOut,
};
