"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { submitReview, getMovieReviews, getUserReviewForMovie } from '../actions/reviews';

export default function ReviewSection({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get or generate username
    let savedUsername = localStorage.getItem('cinematch_username');
    if (!savedUsername) {
      savedUsername = `User${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem('cinematch_username', savedUsername);
    }
    setUsername(savedUsername);

    fetchReviews();
    fetchUserReview();
  }, [movieId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await getMovieReviews(movieId);
      if (result.success) {
        setReviews(result.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const result = await getUserReviewForMovie(movieId, username);
      if (result.success && result.review) {
        setUserReview(result.review);
        setRating(result.review.rating);
        setReviewText(result.review.review_text || '');
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview(movieId, rating, reviewText, username);
      
      if (result.success) {
        // Update local state
        if (userReview) {
          // Update existing review
          setReviews(prev => prev.map(r => 
            r.id === userReview.id ? result.review : r
          ));
        } else {
          // Add new review
          setReviews(prev => [result.review, ...prev]);
        }
        
        setUserReview(result.review);
        
        // Clear form if it's a new review
        if (!userReview) {
          setReviewText('');
        }
      } else {
        alert('Failed to submit review: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <ThumbsUp className="w-4 h-4 text-green-400" />;
      case 'Negative':
        return <ThumbsDown className="w-4 h-4 text-red-400" />;
      default:
        return <Meh className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <div className="bg-[#111827] rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#ec4899]" />
          {userReview ? 'Your Review' : 'Write a Review'}
        </h3>
        
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating *
            </label>
            {renderStars(rating, true, setRating)}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Review (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              className="w-full bg-[#1f2937] text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {reviewText.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="bg-gradient-to-r from-[#ec4899] to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {userReview ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {userReview ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#ec4899]" />
          User Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-[#111827] rounded-lg border border-gray-700">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#111827] rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {review.username}
                        </span>
                        {review.sentiment_label && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getSentimentColor(review.sentiment_label)}`}>
                            {review.sentiment_emoji} {review.sentiment_label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.review_text && (
                  <p className="text-gray-300 leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
