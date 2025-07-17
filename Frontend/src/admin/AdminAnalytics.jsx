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

const AdminAnalytics = () => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState({ user_growth: {}, test_distribution: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [activitySearch, setActivitySearch] = useState('');

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;

      const response = await axios.get(`${base2}/admin/analytics/stats?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      setStats(response.data.stats || []);
      setActivities(response.data.activities || []);
      setChartData({
        user_growth: response.data.user_growth || {},
        test_distribution: response.data.test_distribution || {}
      });
      setMeta(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats([]);
      setActivities([]);
      setChartData({ user_growth: {}, test_distribution: {} });
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [page]);

  const userGrowthChart = {
    labels: Object.keys(chartData.user_growth),
    datasets: [
      {
        label: "New Users",
        data: Object.values(chartData.user_growth),
        backgroundColor: "rgba(59, 130, 246, 0.7)"
      }
    ]
  };
  
  const testDistChart = {
    labels: Object.keys(chartData.test_distribution),
    datasets: [
      {
        label: "Test Types",
        data: Object.values(chartData.test_distribution),
        backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444"]
      }
    ]
  };

  const filteredActivities = activities.filter(activity =>
    activity.name?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    activity.action?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    activity.date?.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Analytics Dashboard</h1>
      { loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
        </div>
        ):( <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md p-5 rounded-lg flex items-center space-x-4"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Growth</h2>
              <BarChart2 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">

              <div className="h-64 bg-white">
                <Bar
                  data={userGrowthChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                              // display: false,
                        position: "bottom"
                      },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                          // min: 0,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Test Distribution</h2>
              <PieChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
              {/* Replace with pie chart */}
              {/* Pie Chart Placeholder */}
              {/* <Pie data={testDistChart} /> */}

              <Pie
                data={testDistChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom"
                    },
                    tooltip: { enabled: true }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <input
              type="text"
              placeholder="Search by name, action, or date..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="mt-2 sm:mt-0 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">{activity.name}</td>
                    <td className="px-4 py-3">{activity.action}</td>
                    <td className="px-4 py-3">{activity.date}</td>
                  </tr>
                  ))}
              </tbody>

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 py-4">
                    No activities found
                  </td>
                </tr>
              )}
            </table>
            {meta.total_pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-gray-700 font-medium">
                  Page {meta.current_page || page} of {meta.total_pages || "?"}
                </span>

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.total_pages))}
                  disabled={page === meta.total_pages}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>

              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
      );
};

export default AdminAnalytics;
