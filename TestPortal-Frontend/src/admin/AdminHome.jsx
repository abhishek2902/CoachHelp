import React from 'react';
import { ListChecks, FileQuestion, Users, BadgeDollarSign, BarChart, Settings, Star, Handshake, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const adminFeatures = [
  {
    title: "Tests",
    description: "Create, view, approve, or delete tests submitted by users.",
    icon: <ListChecks className="w-6 h-6 text-blue-600" />,
    link: "alltests"
  },
  {
    title: "Questions",
    description: "Browse all questions, filter by type or tags, and moderate content.",
    icon: <FileQuestion className="w-6 h-6 text-green-600" />,
    link: "allquestions"
  },
  {
    title: "Users",
    description: "View all registered users and manage their access or roles.",
    icon: <Users className="w-6 h-6 text-orange-500" />,
    link: "allusers"
  },
  {
    title: "Subscription Plans",
    description: "Create or edit pricing plans and manage user subscriptions.",
    icon: <BadgeDollarSign className="w-6 h-6 text-yellow-500" />,
    link: "plans"
  },
  {
    title: "Analytics",
    description: "View performance metrics, test stats, and user activity.",
    icon: <BarChart className="w-6 h-6 text-purple-500" />,
    link: "analytics"
  },
  {
    title: "Settings",
    description: "Configure admin preferences and system-wide settings.",
    icon: <Settings className="w-6 h-6 text-gray-600" />,
    link: "/admin/alltests"
  },
  {
    title: "Reviews",
    description: "Create, view, edit, or delete user reviews and ratings.",
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    link: "reviews"
  },
  {
    title: "Referrals",
    description: "Track, manage, and reward users for referring others to the platform.",
    icon: <Handshake className="w-6 h-6 text-pink-400" />,
    link: "referrals"
  },
  {
    title: "Trainings",
    description: "Create, view, manage and delete training modules.",
    icon: <ListChecks className="w-6 h-6 text-indigo-600" />,
    link: "trainings"
  },
  {
    title: "AI Mock Test Generator",
    description: "Generate AI-powered mock tests for all categories using advanced language models.",
    icon: <Bot className="w-6 h-6 text-green-600" />,
    link: "ai-mock-tests"
  },
];

const AdminHome = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Welcome to Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        From here, you can manage all critical aspects of the platform:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
            <div className="flex items-center mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold ml-3">{feature.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{feature.description}</p>
            <Link
              to={feature.link}
              className="mt-6 inline-block px-6 py-2 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 transition duration-300"
            >
              Manage
            </Link>
          </div>          
        ))}
      </div>
    </div>
  );
};

export default AdminHome;