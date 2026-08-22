const express = require("express");
const { uploadCategory } = require("../config/cloudinary");
const {
    createSubcategory,
    getSubcategories,
    getSubcategory,
    updateSubcategory,
    deleteSubcategory,
    recalculateProductCounts,
    getSubcategoriesByCategory
} = require("../controllers/subcategoryController");
const { validateSubcategory } = require("../validators/subcategory");
const { validateRequest } = require("../middlewares/validateRequest");
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const subcategoryRouter = express.Router();

// POST /api/subcategories
subcategoryRouter.post(
    "/",
    isLoggedIn,
    isAdmin,
    uploadCategory.single("image"),
    validateSubcategory,
    validateRequest,
    createSubcategory
);

// POST /api/subcategories/recalculate-counts (for admin)
subcategoryRouter.post("/recalculate-counts", isLoggedIn, isAdmin, recalculateProductCounts);

// GET /api/subcategories
subcategoryRouter.get("/", getSubcategories);

// GET /api/subcategories/:slug
subcategoryRouter.get("/:slug", getSubcategory);

// GET /api/subcategories/category/:categoryId
subcategoryRouter.get("/category/:categoryId", getSubcategoriesByCategory);

// PUT /api/subcategories/:slug
subcategoryRouter.put(
    "/:slug",
    isLoggedIn,
    isAdmin,
    uploadCategory.single("image"),
    validateSubcategory,
    validateRequest,
    updateSubcategory
);

// DELETE /api/subcategories/:slug
subcategoryRouter.delete("/:slug", isLoggedIn, isAdmin, deleteSubcategory);

module.exports = subcategoryRouter; 