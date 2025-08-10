import { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import axiosClient2 from '../utils/axiosClient2';

function ContestProblems() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contestData, setContestData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { contest_id } = useParams();
  const contestId = useParams();
  const navigate = useNavigate();

  // Capitalize month name helper
  const capitalizeDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const data = await axiosClient2.post('/contest/getContesProblem', contestId);
        setProblems(data.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);



useEffect(() => {
  const capitalizeDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
  const fetchContestData = async () => {
    try {
      const response = await axiosClient2.get('/problem/getContestData');
      const contests = response.data;

      // Find contest by URL param ID
      const currentContest = contests.find(c => c._id === contest_id);

      if (!currentContest) {
        console.error(`Contest with id ${contest_id} not found`);
        return;
      }

      if (!currentContest.contestDate || !currentContest.end) {
        console.error('Missing contestDate or end time:', currentContest);
        return;
      }

      setContestData(currentContest);

      // Capitalize month name
      const fixedDate = capitalizeDate(currentContest.contestDate); // "July 15 2025"
      const dateTimeString = `${fixedDate} ${currentContest.end}`; // "July 15 2025 08:50 PM"
      const endTime = new Date(dateTimeString);

      if (isNaN(endTime.getTime())) {
        console.error('Invalid end time:', dateTimeString);
        return;
      }

      const now = new Date();
      const diffInSeconds = Math.max(Math.floor((endTime - now) / 1000), 0);
      setTimeLeft(diffInSeconds);
    } catch (error) {
      console.error('Error fetching contest data:', error);
    }
  };

  fetchContestData();
}, [contest_id]);



  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShowModal(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/contest');
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Weekly Coding Contest</h1>
          <div className="flex justify-center gap-4 mt-4">
            <div className="badge badge-lg badge-info gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Left: {formatTime(timeLeft)}
            </div>
            <div className="badge badge-lg badge-secondary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {problems.length} Problems
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {problems?.map((problem, index) => (
              <div key={problem._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">{index + 1}</span>
                      </div>
                      <div>
                        <h2 className="card-title text-xl hover:text-primary transition-colors">
                          {problem.title}
                        </h2>
                      </div>
                    </div>
                    <NavLink 
                      to={`/contests/${contest_id}/${problem._id}`} 
                      className="btn btn-primary btn-wide md:btn-md"
                    >
                      Solve Challenge
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Contest Over!</h3>
              <p className="py-4">The contest time has ended. Thank you for participating!</p>
              <div className="modal-action">
                <button className="btn btn-primary" onClick={handleModalClose}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestProblems;
