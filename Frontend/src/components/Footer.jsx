// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  ChevronDown, 
  ChevronUp,
  Users,
  Building,
  User,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Monitor,
  Shield,
  Info,
  FileText,
  Lock,
  Mail,
  CreditCard,
  Settings
} from 'lucide-react';

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState({
    solutions: false,
    company: false,
    account: false,
    help: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Social media links from environment variables
  const socialLinks = {
    youtube: import.meta.env.VITE_YT_URL || '#',
    linkedin: import.meta.env.VITE_LI_URL || '#',
    instagram: import.meta.env.VITE_IG_URL || '#',
    x: import.meta.env.VITE_X_URL || '#',
  };

  const sections = [
    {
      id: 'solutions',
      title: 'Solutions',
      icon: <GraduationCap className="w-5 h-5" />,
      links: [
        { href: '/solutions/educators', text: 'For Educators', icon: <GraduationCap className="w-4 h-4" /> },
        { href: '/solutions/recruiters', text: 'For Recruiters', icon: <Briefcase className="w-4 h-4" /> },
        { href: '/solutions/online-exams', text: 'Online Exams', icon: <Monitor className="w-4 h-4" /> },
        { href: '/solutions/proctoring', text: 'Proctoring', icon: <Shield className="w-4 h-4" /> }
      ]
    },
    {
      id: 'company',
      title: 'Company',
      icon: <Building className="w-5 h-5" />,
      links: [
        { href: '/about', text: 'About Us', icon: <Info className="w-4 h-4" /> },
        { href: '/help', text: 'Support', icon: <HelpCircle className="w-4 h-4" /> },
        { href: '/terms', text: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
        { href: '/privacy', text: 'Privacy Policy', icon: <Lock className="w-4 h-4" /> },
        { href: '/cookie-preferences', text: 'Cookie Preferences', icon: <Settings className="w-4 h-4" /> }
      ]
    },
    {
      id: 'account',
      title: 'Account',
      icon: <User className="w-5 h-5" />,
      links: [
        { href: '/account', text: 'View Account', icon: <User className="w-4 h-4" /> },
        { href: '/signup', text: 'Sign up', icon: <Mail className="w-4 h-4" /> },
        { href: '/login', text: 'Login', icon: <User className="w-4 h-4" /> }
      ]
    },
    {
      id: 'help',
      title: 'Help',
      icon: <HelpCircle className="w-5 h-5" />,
      links: [
        { href: '/help', text: 'Get Help', icon: <HelpCircle className="w-4 h-4" /> },
        { href: '/subscribe', text: 'Subscribe', icon: <Mail className="w-4 h-4" /> },
        { href: '/pricing', text: 'Plans', icon: <CreditCard className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start text-center lg:text-left">
          {/* Logo Section */}
          <div className="mb-8 lg:mb-0">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/images/tplogo.png"
                alt="Talenttest.io Logo"
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-gray-400 text-sm max-w-xs">
              Your trusted partner for launching powerful online test portals.
            </p>
            <div className="flex justify-center lg:justify-start mt-6 space-x-4">
              <a href={socialLinks.youtube} className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href={socialLinks.linkedin} className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href={socialLinks.instagram} className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6" />
              </a>
              <a href={socialLinks.x} className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Navigation Links - Mobile Optimized */}
          <div className="w-full lg:w-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-8 text-left">
              {sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </h3>
                  <ul className="space-y-3 text-gray-400">
                    {section.links.map((link, index) => (
                      <li key={index}>
                        <Link to={link.href} className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                          {link.icon}
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile Layout - Collapsible Sections */}
            <div className="lg:hidden space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border-b border-gray-700 pb-4">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between text-left py-2"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span className="text-lg font-semibold text-white">{section.title}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections[section.id] && (
                    <ul className="mt-3 space-y-2 pl-7">
                      {section.links.map((link, index) => (
                        <li key={index}>
                          <Link 
                            to={link.href} 
                            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 py-1"
                          >
                            {link.icon}
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Talenttest.io. All rights reserved.
        </div>
      </div>
    </footer>
  );
}