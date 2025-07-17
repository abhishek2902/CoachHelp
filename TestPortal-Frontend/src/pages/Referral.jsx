import { useState, useEffect } from "react";
import axios from "axios";
import { Copy, Gift, TrendingUp, CheckCircle, CopyIcon, CheckIcon, LoaderCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlert.js";
import { handleUnauthorized } from '../utils/handleUnauthorized.js';
import Swal from "sweetalert2";

const ReferralPage = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    rewardsEarned: 0,
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(true);
  // const { handleUnauthorized } = useAuth();
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base}/accounts/referral`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReferralCode(response.data.referralCode);
      setReferralHistory(response.data.history || []);
      setReferralStats(response.data.stats || { totalReferrals: 0, rewardsEarned: 0 });
    } catch (err) {
      if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

   const generateReferralCode = async () => {
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${base}/users/generate_referral_code`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setReferralCode(response.data.referral_code);
      Swal.fire({
        title: 'Referral Code Generated!',
        text: 'You can now share your code with others.',
        icon: 'success',
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#7e22ce',
        background: '#fdfcff',
        color: '#333',
        timer: 2000,
        timerProgressBar: true,
        position: 'center',
      });
    } catch (error) {
       Swal.fire({
        title: 'Oops!',
        text: 'Something went wrong while generating the code.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      console.error("Error generating referral code", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReferralEmail = async () => {
    if (!friendEmail) {
      showErrorAlert("Oops!", "Please enter your friend's email.");
      return;
    }

    if (!isValidEmail(friendEmail)) {
    showErrorAlert("Invalid Email", "Please enter a valid email address.");
    return;
    }

    const alreadyInvited = referralHistory.some(
      (ref) => ref.email.toLowerCase() === friendEmail.toLowerCase()
      );

    if (alreadyInvited) {
      showErrorAlert("Wait!", "You have already sent a referral to this email.");
      return;
    }

    try {
      await axios.post(
    `${base}/users/share_referral_invitation`,
    { email: friendEmail },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
      showSuccessAlert("Referral email sent!", "Your invite has been emailed successfully.");
      setFriendEmail("");
    fetchReferralData();  // refresh referral history list
  } catch (err) {
    console.error(err);
    const message =
    err.response?.data?.error || "Failed to send referral email. Please try again.";
    showErrorAlert("Failed!", message);
  }
};

  return (<>
    <Sidebar tabb="referral"/>
    <div className="max-w-3xl mx-auto py-10 px-6 text-gray-800">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3">
          <Gift className="text-pink-600 w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-gray-800">Invite & Earn Rewards</span>
        </div>
      </h1>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
        <p className="text-base sm:text-lg font-medium">Your Referral Code:</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-28 mt-4">
            <LoaderCircle className="w-8 h-8 text-white animate-spin" />
            <span className="mt-2 text-sm font-medium text-white">Loading...</span>
          </div>
        ) : referralCode ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
            <span className="text-2xl sm:text-3xl font-bold tracking-wide break-all">{referralCode}</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              <span className="text-sm">Copy</span>
            </button>
          </div>
        ) : (
          <button
            onClick={generateReferralCode}
            className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Generate Referral Code
          </button>
        )}
      </div>
        <div className="mt-6">
          <p className="text-white mb-2 font-medium">Invite via TalentTest Email:</p>
          <div className="flex">
            <input
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Friend's email"
              className="p-2 rounded-l-lg text-gray-900 w-full border border-gray-300 focus:border-purple-600 focus:ring-purple-600 focus:outline-none"
            />
            <button
              onClick={sendReferralEmail}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-r-lg font-semibold"
            >
              Send
            </button>
          </div>
        </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" /> Your Stats
        </h2>
        <div className="flex justify-between items-center text-lg">
          <p>Total Referrals:</p>
          <strong className="text-gray-700">{referralStats.totalReferrals}</strong>
        </div>
        <div className="flex justify-between items-center text-lg mt-3">
          <p>Rewards Earned:</p>
          <strong className="text-gray-700">{referralStats.rewardsEarned}</strong>
        </div>
      </div>

      {referralHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Referral History</h2>
          <div className="space-y-4">
            {referralHistory.map((ref, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 flex justify-between items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 w-full">
                    <p className="font-medium break-words">
                      {ref.name}
                    </p>
                    <p className="text-gray-600 break-words">
                      ({ref.email})
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {ref.subscription_status === "not_joined"
                    ? "Not Joined Yet"
                    : `Joined: ${new Date(ref.joined_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    ref.subscription_status === "rewarded"
                    ? "text-green-600"
                    : ref.subscription_status === "subscribed"
                    ? "text-blue-600"
                    : ref.subscription_status === "not_joined"
                    ? "text-gray-500"
                    : "text-yellow-600"
                  }`}>
                  {ref.subscription_status === "rewarded"
                  ? "Rewarded"
                  : ref.subscription_status === "subscribed"
                  ? "Subscribed"
                  : ref.subscription_status === "not_joined"
                  ? "Not Joined Yet"
                  : "Not Subscribed"}
                </p>
                  <p className="text-sm text-gray-500">Reward Earned: ₹{ref.cash_benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Share your unique referral code with your friends.</li>
          <li>When a friend signs up using your code — you will  get rewards.</li>
          <li>No limits on how many people you can invite or rewards you can earn.</li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default ReferralPage;