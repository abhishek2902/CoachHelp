import React, { useEffect, useState } from "react";
import {
  BarChart2,
  PieChart,
  Activity,
  Users,
  FileText,
  ListChecks,
  LoaderCircle
} from "lucide-react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { handleUnauthorized } from "../utils/handleUnauthorized";
import Sidebar from "../components/Sidebar";


ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

const iconMap = {
  Users: <Users className="w-6 h-6 text-blue-600" />,
  ListChecks: <ListChecks className="w-6 h-6 text-green-600" />,
  FileText: <FileText className="w-6 h-6 text-purple-600" />,
  Activity: <Activity className="w-6 h-6 text-red-500" />,
};

const Analytics = () => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    user_growth: {},
    test_distribution: {},
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const base = import.meta.env.VITE_API_BASE_URL;

        const response = await axios.get(`${base}/analytics/my_status`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setStats(Array.isArray(response.data?.stats) ? response.data.stats : []);
        setActivities(Array.isArray(response.data?.recent_attempts) ? response.data.recent_attempts : []);

        setChartData({
          user_growth: response.data?.user_growth || {},
          test_distribution: response.data?.test_distribution || {},
        });
      } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error("Error fetching stats:", err);
        }
        setStats([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

const userGrowthChart = {
    labels: chartData.user_growth ? Object.keys(chartData.user_growth) : [],
    datasets: [
      {
        label: "New Users",
        data: chartData.user_growth ? Object.values(chartData.user_growth) : [],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  };
  
  const testDistChart = {
    labels: chartData.test_distribution ? Object.keys(chartData.test_distribution) : [],
    datasets: [
      {
        label: "Test Types",
        data: chartData.test_distribution ? Object.values(chartData.test_distribution) : [],
        backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
      </div>
    );
  }
  return (<>
    <Sidebar tabb="analytics"/>
    <div className={`p-6 md:ml-50 md:pt-5 pt-15`}>
      <h1 className="md:text-xl text-xl font-semibold mb-6">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ">
        {Array.isArray(stats) && stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md p-5 rounded-lg flex items-center space-x-4 bg-gradient-to-r from-gray-50 via-white to-gray-100"
          >
            <div>{iconMap[item.icon]}</div>
            <div>
              <h4 className="text-sm text-gray-500">{item.title}</h4>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 ">
        {/* User Growth Chart */}
        <div className="bg-white shadow-md p-6 rounded-lg bg-gradient-to-r from-gray-50 via-white to-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">User Growth</h2>
            <BarChart2 className="w-5 h-5 text-gray-600" />
          </div>
          <div className="h-64">
            <Bar
              data={userGrowthChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: { enabled: true },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Test Distribution Chart */}
        <div className="bg-white shadow-md p-6 rounded-lg bg-gradient-to-r from-gray-50 via-white to-gray-100 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Test Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-600" />
          </div>

          {/* Chart container constrained for large screens */}
          <div className="h-64 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <Pie
              data={testDistChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: { enabled: true },
                },
              }}
            />
          </div>
        </div>

        
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white shadow-md rounded-lg p-6 bg-gradient-to-r from-gray-50 via-white to-gray-100">
        <h2 className="text-lg font-semibold mb-4">Recent Applicants</h2>
        <div className="overflow-x-auto ">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Test Title</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(activities) && activities.map((activity, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">{activity.name}</td>
                  <td className="px-4 py-3">{activity.test_title}</td>
                  <td className="px-4 py-3">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Analytics;
