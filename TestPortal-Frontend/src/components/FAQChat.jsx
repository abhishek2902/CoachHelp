import { useEffect, useState } from "react";
import axios from "axios";
import { Send, ChevronDown, ChevronUp, MessageCircle, MessageCircleDashedIcon, MessageSquareText, BotMessageSquare, TextCursor } from "lucide-react";
import SEO from './SEO';
import Footer from './Footer';

export default function FAQChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL
    axios.get(`${base}/faqs`).then((res) => {
      setFaqs(res.data.faqs);
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    try {
      const base3 = import.meta.env.VITE_API_BASE_URL3;
      const res = await axios.post(`${base3}/faq-chat`, {
        question: input,
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sentence = " Hi! I'm Shady, your friendly FAQ Assistant. "; // The sentence to be typed
  const [currentText, setCurrentText] = useState(""); // Current text being typed

  useEffect(() => {
    let textIndex = 0; // To track which letter we are on
    const typingInterval = setInterval(() => {
      setCurrentText((prev) => prev + sentence[textIndex]);
      textIndex++;
      if (textIndex === sentence.length-1) {
        clearInterval(typingInterval); // Stop typing once the entire sentence is typed
      }
    }, 0.1 * 1000);

    return () => clearInterval(typingInterval); // Cleanup on component unmount
  }, []);
  

  const seoData = {
    title: "Frequently Asked Questions | TalentTest.io",
    description: "Find answers to common questions about TalentTest.io's online assessment platform. Learn about features, pricing, security, and more.",
    keywords: "faq, frequently asked questions, help, support, online assessment, talenttest, pricing, security, features",
    url: "/faq",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      ...(Array.isArray(faqs) && faqs.length > 0 ? {
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      } : {})
    }
  };

  return (
    <>
      <SEO {...seoData} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden pt-20 pb-12 mb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-6 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about TalentTest.io. Need more help? Use the chat below or contact our support team.
          </p>
        </div>
      </section>
      <div className="max-w-2xl mx-auto p-6 bg-white/90 shadow-2xl rounded-2xl mt-0 mb-12">
        <h2
          className="md:text-2xl text-sm font-bold mb-4 text-center flex justify-center items-center gap-1 text-indigo-700"
        >
          <BotMessageSquare className="text-indigo-400" size={30} />
          <span
            className="relative"
          >
            {currentText}
            <style>{`
              @keyframes blink {
              50% {
                  opacity: 0;
              }
              }
          `}</style>
          </span>
        </h2>
        <div className="h-64 overflow-y-auto mb-4 border rounded-xl p-3 bg-indigo-50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                m.sender === "user" ? "bg-blue-500 text-white" : "bg-indigo-700 text-white"
              }`}>
                <strong>{m.sender === "user" ? "You" : "Bot"}:</strong> {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="flex-grow border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            aria-label="Ask a question"
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        {/* FAQs Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center gap-2"><MessageSquareText className="w-5 h-5 text-indigo-400" /> Browse Common FAQs</h3>
          <div className="space-y-4">
            {Array.isArray(faqs) && faqs.map((faq, index) => (
              <div key={faq.id} className="border rounded-xl p-4 bg-indigo-50">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <p className="font-medium text-indigo-900">{faq.question}</p>
                  {openIndex === index ? (
                    <ChevronUp className="text-indigo-400" />
                  ) : (
                    <ChevronDown className="text-indigo-400" />
                  )}
                </div>
                {openIndex === index && (
                  <p id={`faq-answer-${faq.id}`} className="text-indigo-800 mt-2">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

