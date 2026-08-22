const Review = require("../models/reviewModel");

const getOrderItemsWithReviewStatus = async (orderItems, userId) => {
  // Get user's reviewed product IDs
  const reviewedProductIds = await Review.find({ user: userId }).distinct(
    "product"
  );

  // Add review status to each item
  return orderItems.map((item) => {
    // Handle both Mongoose documents and plain objects
    const itemObj = item.toObject ? item.toObject() : item;

    return {
      ...itemObj,
      canReview: !reviewedProductIds.some(
        (reviewedId) => reviewedId.toString() === itemObj.product._id.toString()
      ),
      isReviewed: reviewedProductIds.some(
        (reviewedId) => reviewedId.toString() === itemObj.product._id.toString()
      ),
    };
  });
};

module.exports = { getOrderItemsWithReviewStatus };
