const createError = require("http-errors");
const { successResponse } = require("./responseController");
const Banner = require("../models/bannerModel");
const { uploadImage, deleteImage } = require("../helper/cloudinaryHelper");

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * GET /api/banners
 * Returns all active banners sorted by their display order.
 * No authentication required — consumed by the public homepage.
 */
const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: "Banners fetched successfully",
      payload: { banners },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/banners/all
 * Returns ALL banners (active + inactive) for the admin panel.
 */
const getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 }).lean();

    return successResponse(res, {
      statusCode: 200,
      message: "All banners fetched successfully",
      payload: { banners },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/banners
 * Creates a new banner. Requires an image file (multipart/form-data).
 */
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, badge, ctaText, ctaLink, isActive, order } =
      req.body;
    const image = req.file;

    if (!image) {
      throw createError(400, "Banner image is required");
    }

    const timestamp = Date.now();
    const imageUrl = await uploadImage(
      image,
      "banner",
      `banner-${timestamp}`
    );

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      imageUrl,
      badge: badge || "",
      ctaText: ctaText || "Shop Now",
      ctaLink: ctaLink || "/products",
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      order: order !== undefined ? Number(order) : 0,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Banner created successfully",
      payload: { banner },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/banners/:id
 * Updates any field on a banner. Image re-upload is optional.
 */
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, badge, ctaText, ctaLink, isActive, order } =
      req.body;
    const image = req.file;

    const banner = await Banner.findById(id);
    if (!banner) {
      throw createError(404, "Banner not found");
    }

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (badge !== undefined) updates.badge = badge;
    if (ctaText !== undefined) updates.ctaText = ctaText;
    if (ctaLink !== undefined) updates.ctaLink = ctaLink;
    if (isActive !== undefined)
      updates.isActive = isActive === "true" || isActive === true;
    if (order !== undefined) updates.order = Number(order);

    // Replace image if a new file was uploaded
    if (image) {
      // Delete the old image from Cloudinary first
      if (banner.imageUrl) {
        try {
          await deleteImage(banner.imageUrl);
        } catch (err) {
          console.error("Error deleting old banner image:", err);
          // Continue even if deletion fails
        }
      }

      const timestamp = Date.now();
      updates.imageUrl = await uploadImage(
        image,
        "banner",
        `banner-${timestamp}`
      );
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updates, {
      new: true,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Banner updated successfully",
      payload: { banner: updatedBanner },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/banners/:id
 * Deletes a banner and removes its image from Cloudinary.
 */
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      throw createError(404, "Banner not found");
    }

    // Remove the image from Cloudinary
    if (banner.imageUrl) {
      try {
        await deleteImage(banner.imageUrl);
      } catch (err) {
        console.error("Error deleting banner image from Cloudinary:", err);
        // Continue with document deletion even if Cloudinary removal fails
      }
    }

    await Banner.findByIdAndDelete(id);

    return successResponse(res, {
      statusCode: 200,
      message: "Banner deleted successfully",
      payload: { banner },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/banners/:id/toggle
 * Quickly flips the isActive flag for a banner.
 */
const toggleBannerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      throw createError(404, "Banner not found");
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      payload: { banner },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/banners/reorder
 * Bulk-updates the display order of multiple banners.
 * Body: { banners: [{ id: string, order: number }, ...] }
 */
const reorderBanners = async (req, res, next) => {
  try {
    const { banners } = req.body;

    if (!Array.isArray(banners) || banners.length === 0) {
      throw createError(400, "banners must be a non-empty array");
    }

    const bulkOps = banners.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: Number(order) } },
      },
    }));

    await Banner.bulkWrite(bulkOps);

    const updatedBanners = await Banner.find({}).sort({ order: 1 }).lean();

    return successResponse(res, {
      statusCode: 200,
      message: "Banners reordered successfully",
      payload: { banners: updatedBanners },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
};
