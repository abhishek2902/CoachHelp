import { useState } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';

const FeedbackForm = ({ onSubmitted, attemptId }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingChange = (newRating) => {
    if (!isSubmitted) setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/test_attempts/${attemptId}/feedbacks`,
    {
      feedback: {
        test_attempt_id: attemptId,
        rating,
        comment: comments,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
    );

      setMessage(response.data.message || 'Feedback submitted successfully.');
      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-form max-w-lg mx-auto p-6 border border-gray-200 rounded-xl bg-white shadow-md">
    <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">We Value Your Feedback</h2>

    {message && (
      <div className="mb-4 text-green-700 bg-green-100 border border-green-300 p-3 rounded text-center">
      ✅ {message}
      </div>
      )}

    {error && (
      <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded text-center">
      ❌ {error}
      </div>
      )}

    {!isSubmitted &&(
      <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
      <p className="mb-2 font-medium text-gray-700">Your Rating:</p>
      <div className="flex justify-center">
      <ReactStars
      count={5}
      onChange={handleRatingChange}
      size={36}
      value={rating}
      isHalf={false}
      edit={!isSubmitted}
      activeColor="#ffd700"
      />
      </div>
      </div>

      <div>
      <label htmlFor="comments" className="block mb-1 font-medium text-gray-700">
      Comments:
      </label>
      <textarea
      id="comments"
      value={comments}
      onChange={(e) => setComments(e.target.value)}
      rows={4}
      disabled={submitting || isSubmitted}
      placeholder="Write your feedback here..."
      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-200"
      />
      </div>

      <button
      type="submit"
      disabled={submitting || isSubmitted}
      className={`w-full p-3 font-semibold rounded-md text-white transition ${
        submitting || isSubmitted
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
      }`}
      >
      {isSubmitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      </form>
      )}
    </div>
    );
};

export default FeedbackForm;
