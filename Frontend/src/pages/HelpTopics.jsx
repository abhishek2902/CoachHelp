import React from "react";
import { motion } from "framer-motion";
import Sidebar from '../components/Sidebar'

const helpTopics = [
  {
    title: "How to Create a Test",
    screenshots: ["/screenshots/create1.png", "/screenshots/create2.png"],
    description: "Step-by-step guide to create a new test with questions."
  },
  {
    title: "How to Edit a Test",
    screenshots: ["/screenshots/edit1.png", "/screenshots/edit2.png"],
    description: "Learn how to edit test title, questions, or duration."
  },
  {
    title: "How to Delete a Test",
    screenshots: ["/screenshots/edit1.png", "/screenshots/delete2.png"],
    description: "Easily remove a test from your dashboard permanently."
  },
  {
    title: "How to View Attempts",
    screenshots: ["/screenshots/attempts1.png", "/screenshots/attempts2.png"],
    description: "See who attempted your test and their responses."
  },
  {
    title: "How to Buy a Subscription",
    screenshots: ["/screenshots/subscribe1.png", "/screenshots/subscribe2.png"],
    description: "Steps to purchase and upgrade your subscription plan."
  },
  {
    title: "How to Attempt a Test",
    screenshots: ["/screenshots/attempt1.png", "/screenshots/attempt2.png"],
    description: "Student’s guide to entering code and submitting answers."
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const HelpPage = () => {
  return (<>
    <Sidebar/>
    <div className="max-w-6xl mx-auto px-4 py-10 md:ml-60">
      <motion.h1
        className="text-3xl font-bold mb-10 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        Help & Guide
      </motion.h1>
      <div className="space-y-16">
        {helpTopics.map((topic, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {topic.title}
            </h2>
            <p className="text-gray-600 mb-4">{topic.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topic.screenshots.map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt={`${topic.title} step ${i + 1}`}
                  className="rounded-xl shadow-lg border border-gray-200 w-11/12 hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 * i, duration: 0.4 }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};

export default HelpPage;
