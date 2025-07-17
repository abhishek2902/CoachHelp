// components/StatsSection.jsx
import { useEffect, useState } from "react";
import { Users, ClipboardList, CheckCircle, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Tests Created",
    value: "1,000+",
    icon: ClipboardList,
    description: "Assessments created by educators and organizations worldwide.",
    color: "bg-slate-900"
  },
  {
    title: "Test Attempts",
    value: "100,000+",
    icon: CheckCircle,
    description: "Students and professionals who attempted tests via TalentTest.io.",
    color: "bg-slate-900"
  },
  {
    title: "Customers",
    value: "100+",
    icon: Users,
    description: "Institutes and creators using TalentTest.io for seamless testing.",
    color: "bg-slate-900"
  },
  {
    title: "Questions",
    value: "50,000+",
    icon: TrendingUp,
    description: "Stored questions across various formats (MCQ, MSQ, Theoretical).",
    color: "bg-slate-900"
  },
];

const StatsSection = () => {
  const [publicOrgs, setPublicOrgs] = useState([]);

  useEffect(() => {
    // Fetch public organizations
    const fetchOrgs = async () => {
      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        const res = await fetch(`${base2}/admin/organizations`);
        const data = await res.json();
        const orgs = data.organizations || [];
        setPublicOrgs(orgs.filter(o => o.show_in_public));
      } catch {
        setPublicOrgs([]);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="bg-slate-50 py-20 px-4 sm:px-8 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <TrendingUp className="w-4 h-4" />
          Trusted by thousands
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Powering Education at Scale</h2>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">Here's what we've accomplished with your trust and support.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl transition duration-500 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-2 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.color} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">{stat.title}</h4>
                <p className="text-slate-600 leading-relaxed">{stat.description}</p>
              </div>
            );
          })}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-slate-200">
          <p className="text-slate-600 mb-8">Trusted by leading institutions worldwide</p>
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
            {publicOrgs.map(org => (
              <div key={org.id} className="flex flex-col items-center mx-2">
                {org.image_url ? (
                  <img
                    src={org.image_url}
                    alt={org.name}
                    className="h-16 w-16 bg-white rounded-xl shadow p-2 object-contain transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-xl">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <span className="text-sm text-slate-600 mt-2 text-center font-medium max-w-[100px] truncate">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
