import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function Terms() {
  const seoData = {
    title: "Terms of Service",
    description: "Read the Terms of Service for using TalentTest.io's online assessment platform. Understand our policies, user agreements, and service conditions.",
    keywords: "terms of service, user agreement, legal terms, online assessment terms, talenttest terms",
    url: "/terms",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service - TalentTest.io",
      "description": "Terms of Service for TalentTest.io online assessment platform",
      "url": "https://talenttest.io/terms",
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
            Terms of <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Please read these terms and conditions carefully before using TalentTest.io.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 text-slate-800">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">1. Acceptance of Terms</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            By accessing or using TalentTest.io, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">2. Use License</h2>
          <p className="mb-6 text-slate-700 leading-relaxed">
            Permission is granted to temporarily download one copy of the materials (information or software) on TalentTest.io's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc ml-8 mb-8 text-slate-700 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on TalentTest.io's website</li>
            <li>Remove any copyright or other proprietary notations</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">3. Disclaimer</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            The materials on TalentTest.io's website are provided on an 'as is' basis. TalentTest.io makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">4. Limitations</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            In no event shall TalentTest.io or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TalentTest.io's website.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">5. Modifications</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            TalentTest.io may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">6. Governing Law</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-900">7. Contact Information</h2>
          <p className="mb-8 text-slate-700 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at support@talenttest.io.
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