const express = require("express");
const { uploadBanner } = require("../config/cloudinary");
const {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
} = require("../controllers/bannerController");
const { validateBanner, validateBannerReorder } = require("../validators/banner");
const { validateRequest } = require("../middlewares/validateRequest");
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const bannerRouter = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/banners — active banners for the homepage slider
bannerRouter.get("/", getBanners);

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/banners/all — all banners (active + inactive) for admin panel
bannerRouter.get("/all", isLoggedIn, isAdmin, getAllBannersAdmin);

// PATCH /api/banners/reorder — bulk reorder (must come BEFORE /:id routes)
bannerRouter.patch(
  "/reorder",
  isLoggedIn,
  isAdmin,
  validateBannerReorder,
  validateRequest,
  reorderBanners
);

// POST /api/banners — create a new banner
bannerRouter.post(
  "/",
  isLoggedIn,
  isAdmin,
  uploadBanner.single("image"),
  validateBanner,
  validateRequest,
  createBanner
);

// PUT /api/banners/:id — update an existing banner
bannerRouter.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  uploadBanner.single("image"),
  validateBanner,
  validateRequest,
  updateBanner
);

// PATCH /api/banners/:id/toggle — toggle isActive
bannerRouter.patch("/:id/toggle", isLoggedIn, isAdmin, toggleBannerStatus);

// DELETE /api/banners/:id — delete a banner
bannerRouter.delete("/:id", isLoggedIn, isAdmin, deleteBanner);

module.exports = bannerRouter;
