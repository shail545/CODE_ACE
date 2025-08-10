import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; // Fixed import
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import Navbar from '../components/Navbar';

function Problem() {
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
  const problemsPerPage = 7; // Changed from 10 to 4 as requested
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
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

  // Filter problems based on selected filters and search query
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
      
      <div className="container mx-auto px-4 py-8">
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
          <div className="space-y-4 mb-10">
            {currentProblems.length > 0 ? (
              currentProblems.map(problem => (
                <div 
                  key={problem._id} 
                  className="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300/50 hover:border-primary/30"
                >
                  <div className="card-body p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="card-title text-lg md:text-xl hover:text-primary transition-colors">
                            <NavLink to={`/problem/${problem._id}`} className="flex items-center gap-2">
                              {problem.title}
                            </NavLink>
                          </h2>
                          {solvedProblems.some(sp => sp._id === problem._id) && (
                            <span className="tooltip" data-tip="Solved">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{problem.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)} gap-1`}>
                            <div className="w-2 h-2 rounded-full bg-current opacity-80"></div>
                            {problem.difficulty}
                          </div>
                          {problem.tag && problem?.tag?.map(tag => (
                            <div key={tag} className="badge badge-outline badge-info gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <NavLink 
                          to={`/problem/${problem._id}`} 
                          className="btn btn-primary btn-sm md:btn-md"
                        >
                          Solve Challenge
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-base-100 rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-700 mt-4">No problems found</h3>
                  <p className="text-gray-500 mt-2">
                    {searchQuery ? 
                      `No results for "${searchQuery}". Try a different search.` : 
                      "No problems match your current filters."
                    }
                  </p>
                  <button 
                    className="btn btn-ghost mt-6 text-primary"
                    onClick={() => {
                      setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
                      setSearchQuery('');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
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

export default Problem;