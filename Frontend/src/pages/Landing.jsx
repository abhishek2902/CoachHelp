import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../utils/auth";

const Landing = () => {
  const seoData = {
    title: "Online Assessment Platform for Educators & Recruiters",
    description: "Create engaging online tests, manage student progress, and get detailed analytics. Perfect for educators, recruiters, and organizations. Start your free trial today!",
    keywords: "online assessment, test creation, student management, educational technology, recruitment testing, online exams, proctoring, analytics, talent assessment",
    url: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "TalentTest.io - Online Assessment Platform",
      "description": "Create engaging online tests, manage student progress, and get detailed analytics. Perfect for educators, recruiters, and organizations.",
      "url": "https://talenttest.io",
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "TalentTest.io",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "description": "Online assessment platform for creating and managing tests, tracking student progress, and analyzing results.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "description": "Free trial available"
        }
      }
    }
  };

  return (
    <>
      <SEO {...seoData} />
      <Navbar/>
      <Hero/>
      <Footer/>
    </>
  );
};

export default Landing;