import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AdminInvoicesPage from './AdminInvoicesPage'
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Settings,
  BarChart,
  LogOut,
  FileQuestion,
  BadgeDollarSign,
  House,
  MessageCircle,
  BanknoteArrowDown,
  Star,
  FileText,
  UsersRound,
  CopyPlus,
  Bot
} from "lucide-react";
// const currentPath = location.pathname;
// console.log(currentPath)

const navItems = [
  { name: "Home", icon: <House size={18} />, href: "/" },
//   { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin/hello" },
  { name: "Tests", icon: <ListChecks size={18} />, href: "/admin/alltests" },
  { name: "Create Clone Test", icon: <CopyPlus className="w-5 h-5" />, href: "/create-test-structure" },
  { name: "AI Mock Test Generator", icon: <Bot size={18} className="text-green-400" />, href: "/admin/ai-mock-tests" },
  { name: "Questions", icon: <FileQuestion size={18} />, href: "/admin/allquestions" },
  { name: "Users", icon: <Users size={18} />, href: "/admin/allusers" },
  { name: "Plans", icon: <BadgeDollarSign size={18} />, href: "/admin/plans" },
  { name: "Reviews", icon: <Star size={18} className="text-yellow-400" />, href: "/admin/reviews" },
  { name: "Organizations", icon: <Users size={18} className="text-indigo-500" />, href: "/admin/organizations" },
  { name: "PromoCodes", icon: <BadgeDollarSign size={18} />, href: "/admin/promo-codes" },
  { name: "Dynamic Pages", icon: <FileText size={18} />, href: "/admin/dynamic-pages" },
  { name: "Analytics", icon: <BarChart size={18} />, href: "/admin/analytics" },
//   { name: "Settings", icon: <Settings size={18} />, href: "/admin/settings" },
  { name: "Messages", icon: <MessageCircle size={18} />, href: "/admin/messages" },
  { name: "Faq", icon: <LayoutDashboard size={18} />, href: "/admin/faq" },
  { name: "Help", icon: <FileQuestion size={18} />, href: "/admin/help" },
  { name: "Invoices", icon: <BanknoteArrowDown size={18} />, href: "/admin/invoices" },
  { name: "Referrals", icon: <UsersRound size={18} />, href: "/admin/referrals" },
  { name: "Trainings", icon: <ListChecks size={18} className="text-indigo-500" />, href: "/admin/trainings" },
  // { name: "Conversations", icon: <MessageCircle size={18} />, href: "/admin/conversations" },
  // { name: "Wallets", icon: <BadgeDollarSign size={18} />, href: "/admin/wallets" },
  // { name: "Token Usage", icon: <BarChart size={18} />, href: "/admin/token-transactions" },
];
// console.log(navItems.href[currentPath])

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab,setTab] =useState("tabb");
  const location = useLocation();

    useEffect(() => {
        const matchedItem = navItems.find(item => item.href === location.pathname);
        if (matchedItem) {
        setTab(matchedItem.name);
        }
    }, []);

  return (<>
    <div className="min-h-screen bg-gray-100 flex ">
      {/* Sidebar */}
      <aside className={`
        fixed z-40 inset-y-0 left-0 w-55 bg-gray-900 text-white border-r border-gray-200 shadow-md transform transition-transform duration-200 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:fixed md:inset-0 mt-16
        overflow-y-auto thin-scrollbar
      `}>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
                    to={item.href}
                    className={`
                      flex items-center p-2 rounded-lg group font-bold
                      ${tab === item.name 
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white " 
                        : "text-gray-300 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                      }
                    `}
                    onClick={()=>setTab(item.name)}
                    key={item.name}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
          ))}
          {/* <button className="flex items-center w-full p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700">
            <LogOut size={18} />
            <span>Logout</span>
          </button> */}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        {/* Top bar */}
        <header className="h-16 border-b flex items-center text-white px-4 shadow-sm  bg-gray-900 fixed top-0 left-0 w-full border-gray-200 dark:bg-gray-900 dark:border-gray-700 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-0 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none  dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 z-50"
            aria-controls="navbar-dropdown"
            aria-expanded={sidebarOpen}
            >
            {sidebarOpen ? (
            // X icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            ) : (
            // Hamburger icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            )}
        </button>
          <h1 className="ml-4 text-lg font-semibold "><Link to="/admin">Admin Panel</Link> </h1>
        </header>

        {/* <main className="p-6 flex-1 overflow-y-auto">
          {children || <div className="text-gray-500">Select a section to manage.</div>}
        </main> */}
        <main className="p-6 flex-1 overflow-y-auto md:ml-60 mt-12">
            {children || <Outlet  />}
        </main>
      </div>
    </div>
    </>
  );
}