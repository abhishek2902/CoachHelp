import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailConfirmation = () => {
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("confirmation_token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing confirmation token.");
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL2;
    // Replace with your actual API URL
    const apiUrl = `${base}/confirmation?confirmation_token=${token}`;

    fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setStatus("success");
          setMessage(data.message || "Your email has been confirmed successfully!");

          // Optional: redirect to login after a delay
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const errorData = await res.json();
          setStatus("error");
          // Check for email already exists error
          const errorMsg = errorData.errors?.join(", ") || "Failed to confirm email.";
          if (errorMsg.toLowerCase().includes("email") && errorMsg.toLowerCase().includes("exist")) {
            setMessage("Email is already exist");
          } else {
            setMessage(errorMsg);
          }
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4 text-center">
      {status === "loading" && (
        <div className="text-lg font-medium text-gray-700">Confirming your email...</div>
      )}

      {status === "success" && (
        <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Success!</h2>
          <p>{message}</p>
          <p className="mt-2 text-sm text-gray-600">Redirecting to login...</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-100 text-red-800 px-6 py-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Oops!</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default EmailConfirmation;
