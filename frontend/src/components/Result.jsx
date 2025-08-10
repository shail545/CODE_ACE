import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient2 from "../utils/axiosClient2";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Result() {
  const { contest_id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axiosClient2.post('/problem/res', { contest_id });
      const sortedResults = response.data.data.sort((a, b) => b.totalSolved - a.totalSolved);
      setResults(sortedResults);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load contest results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [contest_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="alert alert-error shadow-lg max-w-md">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-secondary/90">
        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">
                Contest Results
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              See how you stacked up against the competition
            </motion.p>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" className="fill-base-100"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" className="fill-base-100"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-base-100"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8">
        {/* Leaderboard */}
        <motion.div 
          className="bg-base-100/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-base-300/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-12 bg-base-300 p-4 font-semibold text-base-content">
            <div className="col-span-1">Rank</div>
            <div className="col-span-7">Participant</div>
            <div className="col-span-2 text-center">Solved</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-base-content/70">
              No participants found for this contest
            </div>
          ) : (
            <AnimatePresence>
              {results.map((participant, index) => (
                <motion.div
                  key={participant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 items-center p-4 border-b border-base-300/30 ${
                    index % 2 === 0 ? "bg-base-100" : "bg-base-100/50"
                  } hover:bg-base-200/50 transition-colors`}
                >
                  <div className="col-span-1 font-bold">
                    {index === 0 ? (
                      <span className="text-yellow-500 text-2xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-gray-400 text-2xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600 text-2xl">🥉</span>
                    ) : (
                      <span className="text-base-content/70">{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-7 flex items-center">
                    <div className="avatar placeholder mr-4">
                      <div className="w-10 h-10 pl-3.5 pt-1.5 rounded-full bg-secondary text-neutral-content">
                        <span className="text-lg">{participant.username.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{participant.username}</div>
                      
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="w-full bg-base-300 rounded-full h-2.5">
                      <motion.div
                        className="bg-primary h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(participant.totalSolved / (results[0]?.totalSolved || 1)) * 100}%` 
                        }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      />
                    </div>
                    <div className="text-sm mt-1">
                      {participant.totalSolved} solved
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-bold text-primary">
                    {participant.totalSolved * 100} pts
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="card-body">
              <h3 className="card-title text-primary">Total Participants</h3>
              <p className="text-4xl font-bold">{results.length}</p>
            </div>
          </div>
          
          <div className="card bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
            <div className="card-body">
              <h3 className="card-title text-secondary">Highest Score</h3>
              <p className="text-4xl font-bold">
                {results[0]?.totalSolved * 100 || 0} pts
              </p>
            </div>
          </div>
          
          <div className="card bg-accent/10 border border-accent/20 backdrop-blur-sm">
            <div className="card-body">
              <h3 className="card-title text-accent">Average Score</h3>
              <p className="text-4xl font-bold">
                {results.length > 0
                  ? Math.round(
                      (results.reduce((sum, p) => sum + p.totalSolved, 0) /
                        results.length
                    ) * 100)
                  : 0}{" "}
                pts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button 
            className="btn btn-ghost text-primary"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Contests
          </button>
        </motion.div>
      </div>
      
      {/* Footer */}
       <footer className="footer p-10 flex justify-around border-t-2  bottom-0 bg-base-200 text-base-content">
        <nav>
            <h6 className="footer-title">Services</h6> 
            <a className="link link-hover">Branding</a>
            <a className="link link-hover">Design</a>
            <a className="link link-hover">Marketing</a>
            <a className="link link-hover">Advertisement</a>
        </nav> 
        <nav>
            <h6 className="footer-title">Company</h6> 
            <a className="link link-hover">About us</a>
            <a className="link link-hover">Contact</a>
            <a className="link link-hover">Jobs</a>
            <a className="link link-hover">Press kit</a>
        </nav> 
        <nav>
            <h6 className="footer-title">Legal</h6> 
            <a className="link link-hover">Terms of use</a>
            <a className="link link-hover">Privacy policy</a>
            <a className="link link-hover">Cookie policy</a>
        </nav>
      </footer>
    </div>
  );
}