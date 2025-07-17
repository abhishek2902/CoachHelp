import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import OverviewSection from './OverviewSection';
import Sidebar from '../components/Sidebar';
import UserProfileEdit from './AccountEdit';
import NotificationPage from './NotificationPage';
import Plans from '../components/Plans';
import { fetchSubscriptions } from '../services/subscriptions';
import Analytics from './Analytics';
import UserInvoicesPage from './UserInvoicesPage';
import MyTokenTransactions from './MyTokenTransactions';
import MyConversations from './MyConversations';
import SubscriptionList from '../components/SubscriptionList'
import ShowMyPlans from '../components/ShowMyPlans'
import { handleUnauthorized } from '../utils/handleUnauthorized.js';
import { AlertTriangle, X } from 'lucide-react';
import { useApiLoading } from '../hooks/useApiLoading';

const TABS = ['Overview', 'Notification', 'Edit', 'Subscribe', 'Token', 'Conversations', 'Invoices','My Plans'];

const AccountPage = ({page}) => {
  // console.log(page)
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(page || 'Overview');
  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchaccountagain,setfetchaccountagain] =useState(0);
  const [unreadnotification,setunreadnotification] =useState(0);
  const [subscription,setSubscription]=useState([]);
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const { withLoading } = useApiLoading('account-page');

  // Check for alert parameter and handle token purchase alert
  useEffect(() => {
    const alertParam = searchParams.get('alert');
    const fromPurchase = searchParams.get('from_purchase');
    
    if (alertParam === 'purchase_tokens') {
      setShowTokenAlert(true);
      setActiveTab('Token'); // Automatically switch to Token tab
    }
    
    if (fromPurchase === 'true') {
      setShowPurchaseSuccess(true);
      setActiveTab('Token'); // Switch to Token tab to show the updated balance
    }
  }, [searchParams]);

  //fetch subscription
  useEffect(() => {
    fetchSubscriptions().then(setSubscription);
    
  }, []);

  //fetch account
  useEffect(() => {
    const fetchAccount = async () => {
      await withLoading(async () => {
        const base= import.meta.env.VITE_API_BASE_URL
        // console.log(base)
        try {
          const res = await axios.get(`${base}/accounts/give`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setAccount(res.data);
        } catch (err) {
          console.error("Error fetching account info", err);
        } finally {
          setLoading(false);
        }
      });
    };
    
    fetchAccount();
  }, [fetchaccountagain, withLoading]);

  useEffect(()=>{
    const base = import.meta.env.VITE_API_BASE_URL;
    axios
      .get(`${base}/notifications/unread_count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        console.log(res.data.unread_count)
        setunreadnotification(res.data.unread_count);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error(err);
        }
      })
      .finally(() => {
      });
  },[subscription])

  const renderSection = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewSection account={account} setActiveTab={setActiveTab} subscriptions={subscription}/>
      case 'Notification':
        return <NotificationPage activeTab={activeTab} setunreadnotification={setunreadnotification}/>;
      case 'Edit':
        return <UserProfileEdit setActiveTab={setActiveTab} account={account} setfetchaccountagain={setfetchaccountagain} fetchaccountagain={fetchaccountagain} setAccount={setAccount} acc_loading={loading}/>
      case 'Subscribe':
        return <Plans subscriptions={subscription} setActiveTab={setActiveTab} setSubscription={setSubscription} userCountry={account?.country} />
      case 'Token':
        return <MyTokenTransactions />
      case 'Conversations':
        return <MyConversations />
      case 'Analytics':
        return <Analytics/>
      case 'Invoices':
        return <UserInvoicesPage/>
      case 'My Plans':
        return <ShowMyPlans setActiveTab={setActiveTab}/>
      default:
        return null;
    }
  };

  return (
    <>
    <Sidebar  tabb="account"/>
    <div className=" mx-auto p-4 md:ml-50 bg-gray- min-h-screen ">
      
      {/* Token Purchase Alert */}
      {showTokenAlert && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Purchase Tokens Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You need tokens to use AI features. Please purchase tokens to continue using the AI conversation and other AI-powered features.
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowTokenAlert(false)}
                className="inline-flex text-yellow-400 hover:text-yellow-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Purchase Success Alert */}
      {showPurchaseSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Tokens Purchased Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your tokens have been added to your wallet. You can now use AI features.
                </p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setShowPurchaseSuccess(false);
                    window.location.href = '/ai-conversation?from_account=true';
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Continue to AI Conversation
                </button>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowPurchaseSuccess(false)}
                className="inline-flex text-green-400 hover:text-green-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    {/*<div className="pl-1 pr-1 md:px-5 flex md:justify-start justify-between space-x-0 gap-1 md:space-x-4 lg:space-x-12 bg-gray-200 md:p-4 py-3 rounded-md overflow-x-auto shadow-md mb-4 md:mt-0 mt-12 md:text-md text-sm bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-2 md:px-4 py-2 rounded-md font-medium transition  ${
            activeTab === tab
              ? 'bg-gray-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>*/}
    <div className="pl-1 pr-1 md:px-5 flex md:justify-start justify-between space-x-0 gap-1 md:space-x-4 lg:space-x-12 bg-gray-200 md:p-4 py-3 rounded-md overflow-x-auto shadow-md mb-4 md:mt-0 mt-12 md:text-md text-sm bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300">
  {TABS.map((tab) => {
    const isNotification = tab === 'Notification';
    const displayTabName = isNotification && unreadnotification > 0
      ? `Notification (${unreadnotification})`
      : tab;

    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-2 md:px-4 py-2 rounded-md font-medium transition  ${
          activeTab === tab
            ? 'bg-gray-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-500'
        }`}
      >
        {displayTabName}
      </button>
    );
  })}
</div>

      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        renderSection()
      )}
    </div>
    </>
  );
};

export default AccountPage;
