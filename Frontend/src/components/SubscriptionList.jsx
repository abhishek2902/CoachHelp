import React, { useState } from "react";
import dayjs from "dayjs";
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  CircleFadingArrowUp,
  LoaderCircle,
  ShoppingBag
} from "lucide-react";

const SubscriptionList = ({ subscriptions, setActiveTab, className }) => {
  // --- Initial Loading State ---
  if (subscriptions === null || subscriptions === undefined) {
    return (
      <div className="flex justify-center items-center h-40 md:h-60 lg:h-80 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 rounded-lg shadow-md p-4">
        <LoaderCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
        <p className="ml-3 text-gray-700 text-lg md:text-xl">Loading your plans...</p>
      </div>
    );
  }

  // --- No Subscriptions Found State ---
  if (subscriptions.length === 0) {
    return (
      <div className={`
        relative
        flex flex-col items-center justify-center
        p-6 xs:p-8 sm:p-10 md:p-12 lg:p-16
        min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px]
        bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200
        shadow-xl rounded-2xl
        border border-gray-200 hover:border-purple-500
        transition-all duration-500 ease-in-out
        overflow-hidden
        group
        text-center
        ${className}
      `}>
        <div className="hidden md:block absolute -top-8 -right-8 md:-top-12 md:-right-12 opacity-10 rotate-12 pointer-events-none transition-transform duration-500 group-hover:scale-110">
          <ShoppingBag className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 text-blue-400" />
        </div>

        <button
          onClick={() => setActiveTab("Subscribe")}
          className="
            absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 lg:top-10 lg:right-10
            bg-green-600 hover:bg-green-700 text-white
            px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3
            rounded-full
            shadow-xl hover:shadow-2xl
            transition-all transform hover:scale-105 active:scale-95 duration-300
            flex items-center gap-1 sm:gap-2
            text-sm sm:text-base lg:text-lg font-semibold
            whitespace-nowrap
            z-10
          "
        >
          <CircleFadingArrowUp className="w-4 h-4 sm:w-5 h-5 lg:w-6 h-6" />
          <span>Upgrade Now</span>
        </button>

        <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 z-10 mt-8 sm:mt-10">
          Unlock Full Potential!
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg leading-relaxed z-10 mx-auto">
          It looks like you don't have any active subscriptions. Choose a plan that fits your needs and elevate your experience!
        </p>

        <p className="text-xs sm:text-sm md:text-md text-gray-500 mt-auto z-10">
          Click 'Upgrade Now' to view our exciting plans.
        </p>
      </div>
    );
  }

  // --- Subscriptions Exist (Active or Inactive) ---

  // Sorting logic for active and inactive plans
  // Sort by end_date in ASCENDING order (earliest expiry first)
  // This typically means the plan that is consumed first (or expires soonest) is at the top.
  const activeSubs = subscriptions
    .filter((sub) => sub.status === "active")
    .sort((a, b) => dayjs(a.end_date).diff(dayjs(b.end_date))); // Changed to 'a.end_date' first

  const inactiveSubs = subscriptions
    .filter((sub) => sub.status !== "active")
    .sort((a, b) => dayjs(a.end_date).diff(dayjs(b.end_date))); // Changed to 'a.end_date' first

  const [visibleActive, setVisibleActive] = useState(3);
  const [visibleInactive, setVisibleInactive] = useState(3);

  const renderPlanCard = (title, subs, isActive, visibleCount, setVisibleCount) => (
    <div className={`mb-8 ${className}`}>
      <h2
        className={`text-xl sm:text-2xl font-bold mb-4 ${
          isActive ? "text-green-700" : "text-red-700"
        }`}
      >
        {title}
      </h2>

      <div className="
        relative overflow-hidden p-4 md:p-6 lg:p-8
        bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200
        shadow-lg rounded-2xl border border-gray-200
        hover:border-green-500 transition-all duration-300
      ">
        <div className="absolute -top-8 -right-8 opacity-10 rotate-12 pointer-events-none">
          <BadgeCheck className="w-32 h-32 sm:w-40 sm:h-40 text-green-300" />
        </div>

        {subs.length === 0 ? (
          <p className="text-gray-600 text-center py-6 sm:py-8">No {title.toLowerCase()}.</p>
        ) : (
          subs.slice(0, visibleCount).map((subscription) => {
            const endDate = dayjs(subscription.end_date);
            return (
              <div
                key={subscription.id}
                className="border-b border-gray-200 py-3 sm:py-4 last:border-none"
              >
                <div className="flex flex-wrap justify-between items-center mb-1 sm:mb-2">
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                    Plan #{subscription.id}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CalendarCheck className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p>End Date: {endDate.format("DD MMMYYYY, hh:mm A")}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <ClipboardList className="w-4 h-4 text-purple-500 mt-0.5" />
                    <p>
                      Remaining Test Attempts:{" "}
                      <span className="font-semibold text-gray-800">
                        {subscription.tests_remaining}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Show More button */}
        {subs.length > visibleCount && (
          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              onClick={() => setVisibleCount(visibleCount + 3)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-white text-sm sm:text-base ${
                isActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              Show More
            </button>
          </div>
        )}

        {/* Upgrade button for individual active plan cards */}
        {setActiveTab && isActive && subs.length > 0 && (
          <div className="mt-4 sm:mt-6 flex justify-end">
            <button
              onClick={() => setActiveTab("Subscribe")}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md transition transform active:scale-95 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <CircleFadingArrowUp className="w-4 h-4 sm:w-5" />
              <span>Upgrade</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12">
      {renderPlanCard(
        "Active Plans",
        activeSubs,
        true,
        visibleActive,
        setVisibleActive
      )}
      {renderPlanCard(
        "Inactive Plans",
        inactiveSubs,
        false,
        visibleInactive,
        setVisibleInactive
      )}
    </div>
  );
};

export default SubscriptionList;