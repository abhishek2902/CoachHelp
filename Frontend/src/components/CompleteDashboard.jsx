import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import FeedbackForm from './FeedbackForm'

const Dashboard = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Fetch attempt info
  useEffect(() => {
    axios.get(`/api/v1/test_attempts/${attemptId}/dashboard`)
      .then((res) => setAttempt(res.data))
      .catch(() => setAttempt(null));
  }, [attemptId]);

  // Prompt for feedback
  useEffect(() => {
    Swal.fire({
      title: "Exit Test",
      text: "Your test has been submitted successfully. Would you like to leave feedback before closing?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Yes, Leave Feedback",
      cancelButtonText: "No, Close Now"
    }).then((result) => {
      if (result.isConfirmed) {
        setShowFeedback(true);
      } else {
        try {
          window.close();
        } catch (e) {
          console.log("Unable to close window:", e);
        }
      }
    });
  }, []);

  // Auto close after feedback
  useEffect(() => {
    if (feedbackSubmitted) {
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.log("Unable to close window:", e);
        }
      }, 3000);
    }
  }, [feedbackSubmitted]);

  if (attempt === null) {
    return (
      <div className="text-center mt-10">
        Attempt not found. <a href="/" className="underline">Back to home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-full max-w-3xl bg-white p-6 rounded shadow space-y-6 overflow-y-auto border-b-3 border-gray-300">
        <h1 className="text-2xl font-bold mb-4">Thank you, {attempt.name || "Candidate"}!</h1>
        <p className="text-lg mb-2">You've completed the test.</p>
        <p className="text-sm text-gray-500">We’ve saved your responses.</p>

        {showFeedback && (
          <div className="mt-6">
            <FeedbackForm attemptId={attemptId} onSubmitted={() => setFeedbackSubmitted(true)} />
            <p className="text-sm text-gray-400 mt-2">This tab will close automatically after submission.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
