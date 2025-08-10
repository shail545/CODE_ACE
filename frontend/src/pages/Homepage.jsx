import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('learn');

  // Mock data for featured content
  const [featuredContent] = useState([
    {
      id: 1,
      title: "Data Structures Crash Course",
      description: "Master arrays, linked lists, trees and graphs in 2 weeks",
      difficulty: "Beginner",
      type: "course",
      image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "Top Interview Questions",
      description: "50 must-solve problems for coding interviews",
      difficulty: "Medium",
      type: "collection",
      image: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      title: "Dynamic Programming Patterns",
      description: "Learn 6 essential DP patterns with examples",
      difficulty: "Advanced",
      type: "guide",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  // Mock data for DSA interview tips
  const [interviewTips] = useState([
    {
      id: 1,
      title: "How to Approach System Design Questions",
      excerpt: "Learn the step-by-step framework to tackle any system design problem",
      date: "May 15, 2023",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "Behavioral Interview Preparation Guide",
      excerpt: "50+ common behavioral questions and how to answer them",
      date: "April 28, 2023",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      title: "Time and Space Complexity Cheat Sheet",
      excerpt: "Quick reference for analyzing your solutions",
      date: "June 2, 2023",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  // Mock data for upcoming contests
  const [upcomingContests] = useState([
    {
      id: 1,
      title: "Summer Coding Challenge",
      date: "June 15 - July 15, 2023",
      prize: "$5,000 in prizes",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "DSA World Championship",
      date: "August 1-30, 2023",
      prize: "Job offers from top companies",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navigateToProblems = () => {
    navigate('/problem');
  };

  const navigateToInterview = () => {
    navigate('/interview');
  };

  const navigateToContests = () => {
    navigate('/contest');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {activeTab === 'learn' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Section */}
<motion.div 
  className="hero rounded-2xl mb-12 overflow-hidden relative"
  variants={itemVariants}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>
  {/* Semi-transparent gradient overlay with subtle animation */}
  <motion.div 
    className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/70"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  />
  
  {/* Animated background pattern */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
  </div>

  {/* Content container with glass morphism effect */}
  <div className="hero-content text-center text-neutral-content py-24 relative z-10">
  <motion.div 
      className="max-w-3xl backdrop-blur-sm bg-white/10 p-4 rounded-2xl border border-white/20 shadow-2xl"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <motion.h1 
        className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-accent to-neutral-content"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
      >
        Master <span className="text-accent drop-shadow-lg">Coding Interviews</span>
      </motion.h1>
      
      <motion.p 
        className="text-xl mb-8 text-white/90"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        The ultimate platform to prepare for your next technical interview.
        <br className="hidden md:block" />
        Learn concepts, solve challenges, and track your progress.
      </motion.p>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button 
          className="btn btn-accent btn-lg rounded-full px-8 
                    transform hover:-translate-y-1 transition-all duration-300
                    border-2 border-accent/50 hover:border-accent
                    shadow-lg hover:shadow-xl hover:shadow-accent/20
                    text-white font-semibold"
          onClick={navigateToProblems}
        >
          Start Practicing Now
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  </div>

  {/* Floating code elements (optional decorative elements) */}
  <motion.div 
    className="absolute top-1/4 left-10 text-2xl opacity-20 text-white"
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
  >
    {"</>"}
  </motion.div>
  <motion.div 
    className="absolute bottom-1/3 right-16 text-xl opacity-20 text-white"
    animate={{ y: [0, 10, 0] }}
    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
  >
    {"{}"}
  </motion.div>
</motion.div>

            {/* Learning Paths */}
            <motion.div 
              className="mb-16"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold mb-8 text-center relative">
                <span className="relative inline-block">
                  Learning Paths
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-primary opacity-20 -z-1"></span>
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Beginner's Guide",
                    description: "Start from scratch and learn fundamental concepts",
                    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                    color: "primary",
                    onClick: navigateToProblems
                  },
                  {
                    title: "Algorithm Mastery",
                    description: "Master essential algorithms for interviews",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                    color: "warning",
                    onClick: navigateToProblems
                  },
                  {
                    title: "System Design",
                    description: "Prepare for senior engineering interviews",
                    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                    color: "error",
                    onClick: navigateToInterview
                  }
                ].map((path, index) => (
                  <motion.div 
                    key={index}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    whileHover={{ scale: 1.03 }}
                  >
                    <figure className="h-48 overflow-hidden">
                      <img 
                        src={path.image} 
                        alt={path.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                      />
                    </figure>
                    <div className="card-body">
                      <h3 className={`card-title text-${path.color}`}>{path.title}</h3>
                      <p>{path.description}</p>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className={`btn btn-${path.color} rounded-full`}
                          onClick={path.onClick}
                        >
                          Start Path
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Featured Content */}
            <motion.div 
              className="mb-16"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold mb-8 text-center relative">
                <span className="relative inline-block">
                  Featured Content
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-secondary opacity-20 -z-1"></span>
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredContent.map(item => (
                  <motion.div 
                    key={item.id} 
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <figure className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
                      <div className={`absolute top-4 right-4 badge ${getDifficultyBadgeColor(item.difficulty)} badge-lg`}>
                        {item.difficulty}
                      </div>
                    </figure>
                    <div className="card-body">
                      <h3 className="card-title group-hover:text-primary transition-colors">
                        <NavLink 
                          to={item.type === 'course' ? '/problem' : '/interview'} 
                          className="hover:text-primary"
                        >
                          {item.title}
                        </NavLink>
                      </h3>
                      <p className="text-sm opacity-80">{item.description}</p>
                      <div className="card-actions justify-between items-center mt-4">
                        <div className="badge badge-outline">{item.type}</div>
                        <button 
                          className="btn btn-sm btn-primary rounded-full"
                          onClick={item.type === 'course' ? navigateToProblems : navigateToInterview}
                        >
                          Explore
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* DSA Interview Tips */}
            <motion.div 
              className="mb-16"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold mb-8 text-center relative">
                <span className="relative inline-block">
                  Interview Tips & Guides
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-accent opacity-20 -z-1"></span>
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {interviewTips.map(tip => (
                  <motion.div 
                    key={tip.id} 
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    whileHover={{ y: -5 }}
                  >
                    <figure className="relative h-48 overflow-hidden">
                      <img 
                        src={tip.image} 
                        alt={tip.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                      />
                    </figure>
                    <div className="card-body">
                      <h3 className="card-title hover:text-primary transition-colors">
                        <NavLink to="/interview">{tip.title}</NavLink>
                      </h3>
                      <p className="text-sm opacity-80">{tip.excerpt}</p>
                      <div className="card-actions justify-between items-center mt-4">
                        <span className="text-xs opacity-60">{tip.date}</span>
                        <button 
                          className="btn btn-sm btn-ghost text-primary"
                          onClick={navigateToInterview}
                        >
                          Read More
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Contests */}
            <motion.div 
              className="mb-16"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold mb-8 text-center relative">
                <span className="relative inline-block">
                  Upcoming Contests
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-info opacity-20 -z-1"></span>
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcomingContests.map(contest => (
                  <motion.div 
                    key={contest.id} 
                    className="card image-full rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                  >
                    <figure>
                      <img 
                        src={contest.image} 
                        alt={contest.title} 
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105" 
                      />
                    </figure>
                    <div className="card-body justify-end bg-gradient-to-t from-black via-black/80 to-transparent">
                      <h3 className="card-title text-white text-2xl">{contest.title}</h3>
                      <div className="text-white space-y-2">
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {contest.date}
                        </p>
                        <p className="flex items-center font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {contest.prize}
                        </p>
                      </div>
                      <div className="card-actions mt-4">
                        <button 
                          className="btn btn-primary rounded-full"
                          onClick={navigateToContests}
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              className="hero bg-gradient-to-r from-primary to-accent text-primary-content rounded-2xl p-8 mb-8"
              variants={itemVariants}
            >
              <div className="hero-content text-center">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Next Interview?</h2>
                  <p className="text-lg mb-8">
                    Join thousands of developers who have landed jobs at top tech companies.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      className="btn btn-secondary rounded-full px-8"
                      onClick={navigateToProblems}
                    >
                      Start Practicing
                    </button>
                    <button 
                      className="btn btn-outline btn-neutral rounded-full px-8"
                      onClick={navigateToInterview}
                    >
                      Interview Prep
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <div className="text-center py-12">
            <div className="hero bg-base-100 rounded-2xl p-8 mb-8 shadow-xl">
              <div className="hero-content text-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold mb-6">Practice Coding Problems</h1>
                  <p className="text-lg mb-8">
                    Solve problems from our extensive library of coding challenges.
                    Filter by difficulty, tags, or companies.
                  </p>
                  <button 
                    className="btn btn-primary btn-lg rounded-full px-8 transform hover:-translate-y-1 transition-transform duration-300"
                    onClick={navigateToProblems}
                  >
                    Browse Problems
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="text-center py-12">
            <div className="hero bg-base-100 rounded-2xl p-8 mb-8 shadow-xl">
              <div className="hero-content text-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold mb-6">Interview Preparation</h1>
                  <p className="text-lg mb-8">
                    Comprehensive resources to help you ace your technical interviews.
                    Company-specific questions, mock interviews, and more.
                  </p>
                  <button 
                    className="btn btn-primary btn-lg rounded-full px-8 transform hover:-translate-y-1 transition-transform duration-300"
                    onClick={navigateToInterview}
                  >
                    Start Preparing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
        <footer className="footer p-10 ml-40 bg-gradient-to-br from-base-200 to-base-300 text-base-content relative overflow-hidden">
  {/* Decorative elements */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
  
  {/* Floating code symbols */}
  <motion.div 
    className="absolute top-10 left-1/4 text-2xl opacity-10 text-primary"
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 8, repeat: Infinity }}
  >
    {"</>"}
  </motion.div>
  <motion.div 
    className="absolute bottom-20 right-1/3 text-xl opacity-10 text-secondary"
    animate={{ rotate: [0, 360] }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  >
    {"{}"}
  </motion.div>

  <div className="container mx-auto relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Services Column */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <span className="footer-title text-lg font-bold text-primary">Services</span> 
        <div className="space-y-2">
          {[
            { name: "Learning Paths", path: "/learn" },
            { name: "Practice Problems", path: "/problem" },
            { name: "Interview Prep", path: "/interview" },
            { name: "Coding Contests", path: "/contest" }
          ].map((item, index) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink 
                to={item.path} 
                className="link link-hover text-base-content/80 hover:text-primary transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Company Column */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <span className="footer-title text-lg font-bold text-secondary">Company</span> 
        <div className="space-y-2">
          {[
            { name: "About Us", path: "/about" },
            { name: "Contact", path: "/contact" },
            { name: "Careers", path: "/careers" },
            { name: "Blog", path: "/blog" }
          ].map((item, index) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink 
                to={item.path} 
                className="link link-hover text-base-content/80 hover:text-secondary transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Legal Column */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <span className="footer-title text-lg font-bold text-accent">Legal</span> 
        <div className="space-y-2">
          {[
            { name: "Terms of Use", path: "/terms" },
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Cookie Policy", path: "/cookies" }
          ].map((item, index) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink 
                to={item.path} 
                className="link link-hover text-base-content/80 hover:text-accent transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter Column */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <span className="footer-title text-lg font-bold text-info">Newsletter</span> 
        <div className="form-control ">
          <label className="label">
            <span className="label-text text-base-content/80">Stay updated with our latest</span>
          </label>
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="input input-bordered w-full pr-16 rounded-full bg-base-100/80 focus:bg-base-100 focus:ring-2 focus:ring-info/50" 
            /> 
            <motion.button 
              className="btn btn-info absolute top-0 right-0 rounded-l-none rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </motion.button>
          </motion.div>
          <p className="mt-2 text-xs text-base-content/60">
            We'll never share your email. Unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </div>

    {/* Copyright Section */}
    <motion.div 
      className="pt-8 flex mt-8 border-t border-base-300/50 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col md:flex-row  ml-110 justify-between items-center">
        <p className="text-base-content/70 mb-4 md:mb-0">
          © {new Date().getFullYear()} CodePrep. All rights reserved.
        </p>
        <div className="flex space-x-4">
          {['twitter', 'github', 'linkedin', 'discord'].map((social) => (
            <motion.a
              key={social}
              href="#"
              className="text-base-content/50 hover:text-primary transition-colors"
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <use href={`/sprite.svg#${social}`} />
              </svg>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
        </footer>
    </div>
  );
}

// Helper function for difficulty badges
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'advanced': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;