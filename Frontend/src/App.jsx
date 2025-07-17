import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,Link, Outlet, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Test from './pages/Test';
import TestAttemptPage from './pages/TestAttempt';

import './index.css';
import Landing from './pages/Landing';
import NewTests from './pages/NewTests';
import TestPreview from './pages/TestPreview';
import EditTest from './pages/EditTest';
import RespondentDetailsForm from './components/ResForm';
import AttemptTest from './pages/TestAttempt';
import Dashboard from './components/CompleteDashboard';
import TestResults from './pages/TestResult';
import ResultPreview from './components/ResultPreview';
import AdminDashboard from './admin/AdminUsersDasboard';
import AdminTestDashboard from './admin/AdminTestDashboard';
import AdminTestShow from './admin/AdminTestShow';
import AdminTrainingShow from './admin/AdminTrainingShow';
import AdminQuestionsPage from './admin/AdminQuestionsPage';
import AccountPage from './pages/AccountPage';
import Plans from './components/Plans';
import Subscriptions from './pages/Subscriptions';
import AttemptDetails from './components/ResultAttemptDetails';
import HelpPage from './pages/HelpPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { TestAttemptProvider } from './context/TestAttemptContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LoadingProvider } from './components/LoadingProvider';
import AdminLayout from './admin/AdminLayout';
import AdminHello from './admin/AdminUsersDasboard';
import AdminPlans from './admin/AdminPlans';
import AdminHome from './admin/AdminHome';
import AdminAnalytics from './admin/AdminAnalytics';
import NotFoundPage from './pages/NotFoundPage';
import AdminRoute from './components/AdminRoute';
import ContactPage from './pages/Contact';
import MessagesPage from './admin/MessagePage';
import FAQChat from './components/FAQChat';
import AdminFaqPage from './admin/FaqPage';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';
import ShowMyPlans from './components/ShowMyPlans'
import ShareTestForm from './components/ShareTestForm'

import AdminInvoicesPage from './admin/AdminInvoicesPage'
import AiNewTest from './pages/AiNewTest';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EmailConfirmation from './components/EmailConfirmation';
import FaceDetectionSetup from './components/FaceDetectionSetup';
import FeedbackForm from './components/FeedbackForm';
import GTMTracker from './components/GTMTracker';
import Checkout from './components/Checkout';
import GitHubCallback from './components/GitHubCallback';
import OTPVerification from './components/OTPVerification';
import TokenCheckout from './components/TokenCheckout';
import AdminHelpManage from './pages/AdminHelpManage';
import AdminPromoCodesManage from './pages/AdminPromoCodesManage';
import ResultShow from './components/ResultShow';
import TestPortalUnder2000INR from './pages/TestPortalUnder2000INR';
import AdminReviews from './admin/AdminReviews';
import AdminOrganizations from './admin/AdminOrganizations';
import Referral from './pages/Referral';
import Pricing from './pages/Pricing';
import Educators from './pages/solutions/Educators';
import Recruiters from './pages/solutions/Recruiters';
import OnlineExams from './pages/solutions/OnlineExams';
import Proctoring from './pages/solutions/Proctoring';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TokenRefresher from './components/TokenRefresher';
import AdminDynamicPages from './admin/AdminDynamicPages';
import DynamicPage from './pages/DynamicPage';
import NewTraining from './pages/NewTraining';
import CreatedTrainings from './pages/Trainings';
import {EnrollTraining} from './pages/Trainings';
import TrainingAttempt from './pages/TrainingAttempt';
import TrainingPreview from './pages/TrainingPreview';
import EditTraining from './pages/EditTraining';
import TrainingResultShow from './pages/TrainingResultShow';
import AdminReferralsPage from './admin/AdminReferralsPage';
import CookieConsent from './components/CookieConsent';
import { initializeCookies } from './utils/cookieUtils';
import CookiePreferences from './pages/CookiePreferences';
import Mock from './pages/MockTests';
import CategoryDetails from './pages/CategoryDetails';
import CategoryQuestions from './pages/CategoryQuestions';
import CreateTestStructure from './pages/CreateTestStructure';
import AdminTrainings from './admin/AdminTrainings';
import ScrollToTop from './components/ScrollToTop';
import AiConversation from './pages/AiConversation';
import AiConversationPromo from './pages/AiConversationPromo';
import BookDemo from './pages/BookDemo';
import AdminAiMockTestGenerator from './admin/AdminAiMockTestGenerator';
import GlobalTawkCleaner from './components/GlobalTawkCleaner';
import TawkWidgetLoader from './components/TawkWidgetLoader';


const AppRoutes = () => {
  const location = useLocation();
  return (
    <>
      {location.pathname === '/' && <TawkWidgetLoader />}
      {location.pathname !== '/' && <GlobalTawkCleaner />}
      <ScrollToTop />
      <GTMTracker />
      <TokenRefresher/>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/help" element={<><Navbar/><HelpPage /></>} />
        <Route path="/contact" element={<><Navbar/><ContactPage /></>} />
        <Route path="/faq" element={<><Navbar/><FAQChat /></>} />
        <Route path="/newtest" element={<ProtectedRoute><NewTests /></ProtectedRoute>} />
        <Route path="/newtraining" element={<ProtectedRoute><NewTraining /> </ProtectedRoute>} />
        <Route path="/training/edit/:id" element={<ProtectedRoute><EditTraining /> </ProtectedRoute>} />
        <Route path="/my-trainings" element={<ProtectedRoute><CreatedTrainings /> </ProtectedRoute>} />
        <Route path="/enrolled-trainings" element={<ProtectedRoute><EnrollTraining /> </ProtectedRoute>} />
        <Route path="/training/attempt/:id" element={<ProtectedRoute><TrainingAttempt /> </ProtectedRoute>} />
        <Route path="/training/:id" element={<ProtectedRoute><TrainingPreview /> </ProtectedRoute>} />
        <Route path="/training/result/:id" element={<ProtectedRoute><Sidebar/> <TrainingResultShow /></ProtectedRoute>} />
        <Route path="/training/share-link/:id" element={<ProtectedRoute><ShareTestForm/> </ProtectedRoute>} />
        <Route path="/ainewtest" element={<ProtectedRoute><AiNewTest /></ProtectedRoute>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/login/confirmation" element={<EmailConfirmation />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/login/password/edit" element={<ResetPassword />} />
        <Route path="/mock" element={<ProtectedRoute><Mock /></ProtectedRoute>} />
        <Route path="/mock-tests/:domainSlug/category/:categorySlug" element={<ProtectedRoute><CategoryDetails /></ProtectedRoute>} />
        <Route path="/mock-tests/:domainSlug/:categorySlug" element={<ProtectedRoute><CategoryQuestions /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
        <Route path="/test/:slug" element={<ProtectedRoute><TestPreview /></ProtectedRoute>} />
        <Route path="/edittest/:slug" element={<ProtectedRoute><EditTest /></ProtectedRoute>} />
        <Route path="/respondent-details/:test_id" element={<RespondentDetailsForm />} />
        <Route path="/face-detection-setup/:attemptId/:guest_token" element={<FaceDetectionSetup />} />
        <Route path="/attempt/:attemptId/:guest_token" element={<AttemptTest />} />
        <Route path="/dashboard/:attemptId/:guest_token" element={<Dashboard />} />
        <Route path="/test-attempt/:id/feedback" element={<FeedbackForm />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          element={
            <TestAttemptProvider>
              <Outlet />
            </TestAttemptProvider>
          }
        >
          <Route path="/result" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
          <Route path="/result/:id" element={<ProtectedRoute><Sidebar/><ResultShow /></ProtectedRoute>} />
        </Route>
        <Route path="/response/:id" element={<AttemptDetails/>} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="" element={<AdminHome />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="allusers" element={<AdminDashboard />} />
          <Route path="alltests" element={<AdminTestDashboard />} />
          <Route path="alltests/:slug" element={<AdminTestShow />} />
          <Route path="trainings/:slug" element={<AdminTrainingShow />} />
          <Route path="allquestions" element={<AdminQuestionsPage />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
          <Route path="help" element={<AdminHelpManage />} />
          <Route path="invoices" element={<AdminInvoicesPage />} />
          <Route path="promo-codes" element={<AdminPromoCodesManage />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="organizations" element={<AdminOrganizations />} />
          <Route path="dynamic-pages" element={<AdminDynamicPages />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="trainings" element={<AdminTrainings />} />
        </Route>
        <Route path="/subscribe" element={<ProtectedRoute><  AccountPage page="Subscribe" /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><  AccountPage /></ProtectedRoute>} />
        <Route path="/showmyplans" element={<ProtectedRoute>< ShowMyPlans /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Sidebar tabb="analytics"/><  Analytics /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/test-portal-under-2000-inr" element={<TestPortalUnder2000INR />} />
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="/solutions/educators" element={<Educators />} />
        <Route path="/solutions/recruiters" element={<Recruiters />} />
        <Route path="/solutions/online-exams" element={<OnlineExams />} />
        <Route path="/solutions/proctoring" element={<Proctoring />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-preferences" element={<CookiePreferences />} />
        <Route path="/ai-conversation" element={<ProtectedRoute><Sidebar tabb="ai-conversation" /><AiConversation /></ProtectedRoute>} />
        <Route path="/ai-conversation-promo" element={<AiConversationPromo />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions/></ProtectedRoute>} />
        <Route path="/share-link/:id" element={<ProtectedRoute><ShareTestForm/></ProtectedRoute>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/token-checkout" element={<ProtectedRoute><TokenCheckout /></ProtectedRoute>} />
        <Route path="/github-callback" element={<GitHubCallback />} />
        <Route path="/verify-otp/:attemptId/:guestToken" element={<OTPVerification />} />
        <Route path="/create-test-structure" element={<ProtectedRoute><CreateTestStructure /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute>< Referral /></ProtectedRoute>} />
        <Route path="ai-mock-tests" element={<AdminAiMockTestGenerator />} />
      </Routes>
      <CookieConsent />
    </>
  );
};

const App = () => {
  useEffect(() => {
    initializeCookies();
  }, []);

  return (
    <CurrencyProvider>
      <LoadingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LoadingProvider>
    </CurrencyProvider>
  );
};

export default App;