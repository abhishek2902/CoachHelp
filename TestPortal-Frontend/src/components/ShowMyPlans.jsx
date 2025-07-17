import SubscriptionList from './SubscriptionList';
import { fetchSubscriptions } from '../services/subscriptions';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
// Assuming LoaderCircle is a shared component or part of lucide-react if needed here directly
import { LoaderCircle } from 'lucide-react'; // Ensure LoaderCircle is imported if used here

// ShowMyPlans now MUST accept setActiveTab as a prop
const ShowMyPlans = ({ setActiveTab }) => {

	// Initialize subscriptions as null to clearly indicate a loading state
	const [subscriptions, setSubscription] = useState(null);

	useEffect(() => {
		// Set a loading delay for demonstration, remove in production
		// setTimeout(() => {
		fetchSubscriptions()
			.then(data => {
				console.log("Fetched subscriptions:", data); // Debugging: Check what's fetched
				setSubscription(data);
			})
			.catch(error => {
				console.error("Error fetching subscriptions:", error);
				// Set to empty array on error so the "No Active Plans" message is shown
				setSubscription([]);
			});
		// }, 1000); // Remove this setTimeout in your actual application
	}, []);

	// Render a loading state if subscriptions are still null (data is being fetched)
	if (subscriptions === null) {
		return (
			<>
				{/* Sidebar only on md and up */}
				<div className="hidden md:block"><Sidebar/></div>
				<div className="p-10 flex justify-center items-center min-h-[calc(100vh-80px)]"> {/* Adjust height as needed */}
					<LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" />
					<p className="ml-4 text-gray-700 text-xl">Loading your subscriptions...</p>
				</div>
			</>
		);
	}

	return (
		<>
			{/* Sidebar only on md and up */}
			<div className="hidden md:block"><Sidebar/></div>
			<div className="p-10">
				{/* Pass setActiveTab down to SubscriptionList */}
				{/* This is the crucial line: SubscriptionList needs setActiveTab to call */}
				<SubscriptionList className="mt-0" subscriptions={subscriptions} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}

export default ShowMyPlans;