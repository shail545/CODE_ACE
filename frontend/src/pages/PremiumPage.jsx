import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; // Fixed import
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import Navbar from '../components/Navbar';
import PremiumComp from '../components/PremiumComp';

function PremiumPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 4; // Changed from 10 to 4 as requested
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/getpreminumProblem'),
          user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] })
        ]);
        setProblems(problemsRes.data);
        setSolvedProblems(solvedRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };


  
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags.includes(filters.tag); // Fixed tag matching
    const statusMatch = filters.status === 'all' || 
    (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return matchesSearch && difficultyMatch && tagMatch && statusMatch;
  });

  // Get current problems for pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 ">
        {/* Search and Filters */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search problems by title or description..."
                  className="w-full pl-12 pr-6 py-3 rounded-xl border border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="form-control">
                <select 
                  className="select select-bordered bg-base-100"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Status</option>
                  <option value="solved">Solved</option>
                </select>
              </div>

              <div className="form-control">
                <select 
                  className="select select-bordered bg-base-100"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <select 
                  className="select select-bordered bg-base-100"
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20"></div>
              <p className="text-lg text-gray-600">Loading challenges...</p>
            </div>
          </div>
        ) : (
            <PremiumComp currentProblems={currentProblems}  solvedProblems={solvedProblems}/>
        )}

        {/* Pagination */}
        {!isLoading && filteredProblems.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{indexOfFirstProblem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastProblem, filteredProblems.length)}</span> of <span className="font-medium">{filteredProblems.length}</span> problems
            </div>
            <div className="join">
              <button 
                className="join-item btn btn-sm md:btn-md"
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={index}
                    className={`join-item btn btn-sm md:btn-md ${currentPage === pageNum ? 'btn-active' : ''}`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                className="join-item btn btn-sm md:btn-md"
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default PremiumPage;