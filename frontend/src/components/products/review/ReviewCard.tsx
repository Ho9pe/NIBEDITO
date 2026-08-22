"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { FiThumbsUp, FiUser } from "react-icons/fi";
import { Review } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewCardProps {
  review: Review;
  onHelpfulClick: (reviewId: string) => void;
  onImageClick: (images: string[], index: number) => void;
}

const ReviewCard = memo(function ReviewCard({ review, onHelpfulClick, onImageClick }: ReviewCardProps) {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  const reviewUser = typeof review.user === "object" ? review.user : null;
  const reviewUserId = typeof review.user === "object" ? review.user._id : review.user;
  const isOwnReview = user && user._id === reviewUserId;
  const isHelpful = user && review.helpfulUsers.includes(user._id);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleHelpfulClick = () => {
    setIsAnimating(true);
    onHelpfulClick(review._id);

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleImageClick = (index: number) => {
    if (review.image && review.image.length > 0) {
      onImageClick(review.image, index);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {reviewUser?.name || "Anonymous"}
              {isOwnReview && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </h4>
            <p className="text-xs sm:text-sm text-text-secondary">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
                star <= review.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-foreground mb-4 text-sm sm:text-base leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Images */}
      {review.image && review.image.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
          {review.image.map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <Image
                src={img}
                alt={`Review image ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful Button - Only show if not own review */}
      {!isOwnReview && (
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isAnimating ? 'scale-95' : 'scale-100'
          } ${
            isHelpful
              ? "bg-primary/10 text-primary"
              : "bg-background hover:bg-primary/5 text-text-secondary hover:text-primary"
          }`}
        >
          <FiThumbsUp
            className={`w-4 h-4 transition-all duration-200 ${
              isHelpful ? "fill-current" : ""
            } ${isAnimating ? 'scale-125' : 'scale-100'}`}
          />
          <span>Helpful {review.helpful > 0 && `(${review.helpful})`}</span>
        </button>
      )}

      {/* Show helpful count for own review without button */}
      {isOwnReview && review.helpful > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary">
          <FiThumbsUp className="w-4 h-4" />
          <span>{review.helpful} {review.helpful === 1 ? 'person found' : 'people found'} this helpful</span>
        </div>
      )}
    </div>
  );
});

export default ReviewCard;
