import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function Privacy() {
  const seoData = {
    title: "Privacy Policy",
    description: "Learn how TalentTest.io protects your privacy and handles your personal information. Read our comprehensive privacy policy and data protection practices.",
    keywords: "privacy policy, data protection, personal information, GDPR, privacy rights, talenttest privacy",
    url: "/privacy",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - TalentTest.io",
      "description": "Privacy Policy for TalentTest.io online assessment platform",
      "url": "https://talenttest.io/privacy",
      "dateModified": "2024-01-15"
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <SEO {...seoData} />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Privacy <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. Please read this policy to understand how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 text-slate-800">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">1. Information We Collect</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, use our services, or contact support. This may include your name, email address, organization, and usage data. We also collect technical information about your device and how you interact with our platform.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">2. How We Use Information</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We use your information to provide, maintain, and improve our services, communicate with you, and ensure the security of our platform. We do not sell your personal information to third parties. Your data is used solely for the purpose of delivering our assessment services and improving your experience.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">3. Data Security</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits. We are committed to maintaining the confidentiality and integrity of your personal information.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">4. Cookies and Tracking</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver relevant content. You can control cookies through your browser settings. We also use analytics tools to understand how our platform is used and improve our services.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">5. Third-Party Services</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We may use third-party services for analytics, payment processing, and communication. These providers have their own privacy policies and practices. We carefully select our partners and ensure they meet our privacy standards.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">6. Your Rights</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            You have the right to access, update, or delete your personal information. You can also request a copy of your data or restrict how we process it. Contact us at support@talenttest.io for any privacy-related requests, and we'll respond within 30 days.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">7. Data Retention</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We retain your personal information only as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will remove your personal data from our systems within 90 days.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">8. International Transfers</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that your information remains protected.
          </p>
          

          <h2 className="text-3xl font-bold mb-6 text-gray-800">8. Refund Policy</h2>
          <p className="mb-6 text-gray-600 leading-relaxed">
            At <span className="font-semibold text-gray-800">tealenttest.io</span>, we aim to ensure a smooth and reliable payment experience. However, if a payment fails due to a technical issue
            (such as a server error, network issue, or gateway failure) but the amount is still deducted from your bank account, rest assured that your money will be safely refunded.
          </p>

          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Refund Process</h3>
          <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
            <li>If your payment fails but the amount is debited, the transaction will be automatically reversed.</li>
            <li>Refunds are processed within <span className="font-medium text-gray-800">7–8 working days</span> to your original payment method.</li>
            <li>No further action is needed unless the refund is delayed.</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Track Your Refund</h3>
          <p className="mb-6 text-gray-600 leading-relaxed">
            You can monitor the status of your failed payment and refund directly through your dashboard on
            <span className="font-semibold text-gray-800"> tealenttest.io</span>.
            Just go to the <span className="font-medium text-gray-800">“Payment History”</span> section to view details.
          </p>

          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Need Help?</h3>
          <p className="mb-6 text-gray-600 leading-relaxed">
            If your refund is not received within 8 working days, please reach out to our support team at
            <a href="mailto:support@tealenttest.io" className="text-blue-600 hover:underline ml-1">support@tealenttest.io</a> with your transaction details.
          </p>

          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            <strong>Note:</strong> Refunds are only applicable to failed transactions. Payments that are successfully completed are non-refundable.
          </p>


          <h2 className="text-3xl font-bold mb-6 text-slate-900">9. Changes to This Policy</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and, where appropriate, sending you an email notification.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">10. Contact Us</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at support@talenttest.io. We're committed to addressing your privacy concerns promptly and transparently.
          </p>
          
          <div className="mt-12 p-6 bg-slate-50 rounded-xl">
            <p className="text-slate-500 text-sm">
              <strong>Last updated:</strong> January 15, 2024
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 