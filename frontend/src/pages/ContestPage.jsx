
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router'; // Se asume react-router-dom
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar'; // Asegúrate de que esta ruta sea correcta
import axiosClient2 from '../utils/axiosClient2'; // Asegúrate de que esta ruta sea correcta
import { motion, AnimatePresence } from 'framer-motion';

function ContestPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [registeredContests, setRegisteredContests] = useState({});
  const [contestStatus, setContestStatus] = useState({});

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await axiosClient2.get('/problem/getContestData');
        processContestData(response.data);
        setContests(response.data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  useEffect(() => {
    const checkRegistrations = async () => {
      if (!user || contests.length === 0) return;
      const registrations = {};
      // Usamos Promise.all para ejecutar las comprobaciones en paralelo
      await Promise.all(contests.map(async (contest) => {
        registrations[contest._id] = await isUserRegistered(contest._id);
      }));
      setRegisteredContests(registrations);
    };

    checkRegistrations();
  }, [contests, user]);

  const processContestData = (contestsData) => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    const statusMap = {};

    contestsData.forEach(contest => {
      const contestStart = getCombinedDateTime(contest.contestDate, contest.start);
      const contestEnd = getCombinedDateTime(contest.contestDate, contest.end);
      
      if (contestEnd < now) {
        past.push(contest);
        statusMap[contest._id] = 'ended';
      } else if (contestStart > now) {
        upcoming.push(contest);
        statusMap[contest._id] = 'upcoming';
      } else {
        upcoming.push(contest); // También incluye los activos en "Upcoming"
        statusMap[contest._id] = 'active';
      }
    });

    setUpcomingContests(upcoming);
    setPastContests(past);
    setContestStatus(statusMap);
  };

  const getCombinedDateTime = (dateString, timeString) => {
    // Implementación robustecida
    try {
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes || 0);

        if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

        const date = new Date(dateString);
        date.setHours(hours, minutes, 0, 0);
        return date;
    } catch (e) {
        console.error('Error parsing date/time:', dateString, timeString, e);
        return new Date(); // Devuelve una fecha por defecto en caso de error
    }
  };

  const isUserRegistered = async (contestId) => {
    if (!user) return false;
    try {
      const response = await axiosClient2.post('/contest/isregister', { contestId, userId: user._id });
      return response.data.isRegistered;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  const handleRegister = async (contestId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axiosClient2.post('/contest/contestRegister', { id: user._id, contestId });
      if (response.status === 200) {
        alert(response.data.message || 'Registration successful!');
        setRegisteredContests(prev => ({ ...prev, [contestId]: true }));
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  
  const handleEnterContest = (contestId) => {
    navigate(`/contest/${contestId}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
        return dateString; // Devuelve el string original si hay error
    }
  };

  const getContestStatusBadge = (contestId) => {
    switch (contestStatus[contestId]) {
      case 'active':
        return <span className="badge badge-warning animate-pulse ml-2">Live Now</span>;
      case 'upcoming':
        return <span className="badge badge-info ml-2">Upcoming</span>;
      case 'ended':
        return <span className="badge badge-error ml-2">Ended</span>;
      default:
        return null;
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* <motion.div 
          className="hero rounded-2xl mb-8 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-overlay bg-opacity-60 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="hero-content text-center text-neutral-content py-16">
            <motion.div 
              className="max-w-3xl backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Coding <span className="text-accent drop-shadow-lg">Contests</span>
              </h1>
              <p className="text-lg mb-8 text-white/90">
                Participate in challenges, showcase your skills, and climb the leaderboard!
              </p>
              {user && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button 
                    className="btn btn-accent rounded-full px-8 shadow-lg"
                    onClick={() => navigate('/create-contest')}
                  >
                    Create New Contest
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div> */}

        <div 
          className="tabs tabs-boxed bg-base-200/80 backdrop-blur-sm mb-8 rounded-xl shadow-sm"
        >
          <a className={`tab tab-lg  ${activeTab === 'upcoming' ? 'tab-active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</a> 
          <a className={`tab tab-lg ${activeTab === 'past' ? 'tab-active' : ''}`} onClick={() => setActiveTab('past')}>Past</a>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' ? (
            <motion.div
              key="upcoming"
             
            >
              {upcomingContests.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-semibold text-base-content/70">No upcoming contests.</h3>
                  <p className="text-base-content/50">Check back later for new challenges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {upcomingContests.map((contest, index) => (
                    <motion.div 
                      key={contest._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card bg-base-100/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 border border-base-300/50 hover:border-primary/30 rounded-xl overflow-hidden"
                    >
                      <div className="card-body p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="card-title text-xl">
                              {contest.contestName || `Coding Contest - ${formatDate(contest.contestDate)}`}
                              {getContestStatusBadge(contest._id)}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-base-content/80">
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                {formatDate(contest.contestDate)}
                              </span>
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                {contest.start} - {contest.end}
                              </span>
                            </div>
                          </div>
                          <div className="card-actions justify-end items-center gap-4">
                            {registeredContests[contest._id] && contestStatus[contest._id] !== 'active' &&
                              <div className="flex items-center gap-2 text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-semibold">Registered</span>
                              </div>
                            }
                            {contestStatus[contest._id] === 'active' ? (
                               <motion.button 
                                className="btn btn-primary rounded-full px-6"
                                onClick={() => handleEnterContest(contest._id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!registeredContests[contest._id]}
                              >
                                {registeredContests[contest._id] ? 'Enter Contest' : 'Registration Required'}
                              </motion.button>
                            ) : (
                              <motion.button 
                                className="btn btn-accent rounded-full px-6"
                                onClick={() => handleRegister(contest._id)}
                                disabled={registeredContests[contest._id]}
                                whileHover={{ scale: registeredContests[contest._id] ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Register Now
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {pastContests.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-semibold text-base-content/70">No past contests.</h3>
                   <p className="text-base-content/50">Compete in an upcoming contest to see it here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastContests.map((contest, index) => (
                    <motion.div 
                      key={contest._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="card bg-base-100/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border border-base-300/50 hover:border-secondary/30 rounded-xl"
                    >
                      <div className="card-body">
                        <h3 className="card-title">
                           {contest.contestName || `Coding Contest - ${formatDate(contest.contestDate)}`}
                           {getContestStatusBadge(contest._id)}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                           <div className="badge badge-outline badge-info gap-1">Ended</div>
                           <div className="badge badge-outline gap-1">
                            {contest.contestProblem?.length || 0} problems
                          </div>
                        </div>
                        <div className="card-actions justify-end mt-4">
                          <motion.button 
                            className="btn btn-ghost text-secondary rounded-full"
                            onClick={() => navigate(`/contest/${contest._id}/results`)}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--b2, 255 255 255) / 0.1)' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Results
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer (ya estaba bien diseñado, solo se ajustó el espaciado) */}
      <footer className="footer p-10 flex justify-around border-t-2 fixed bottom-0 bg-base-200 text-base-content">
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

export default ContestPage;
