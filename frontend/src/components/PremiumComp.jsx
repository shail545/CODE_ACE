import { NavLink } from 'react-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { toast } from 'react-toastify';

const PremiumComp = ({ currentProblems, solvedProblems }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [point, setPoint] = useState();
    const [buyProblem, setBuyProblem] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            try {
                setLoading(true);
                const response = await axiosClient.post('/user/finduser', { id: user._id });
                setBuyProblem(response.data.buyProblem);
                setPoint(response.data.point);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        }

        if (user?._id) {
            fetchUserData();
        }
    }, [user?._id]);

    const getUnlockCost = (difficulty) => {
        const costs = {
            'easy': 5,
            'medium': 8,
            'hard': 10
        };
        return costs[difficulty?.toLowerCase()] || 10;
    };

    const isProblemUnlocked = (problemId) => {
        return buyProblem.some(bp => 
            bp._id === problemId || 
            bp.toString() === problemId ||
            bp === problemId
        );
    };

    const unlockProblem = async (problemId, difficulty) => {
        const cost = getUnlockCost(difficulty);
        
        if (point < cost) {
            toast.warning('Not enough coins to unlock this problem');
            return;
        }

        try {
    
            const data = {
                user: user._id,
                problemId: problemId,
                cost: cost,
            };

            const  x = await axiosClient.post('/user/updatePoint', data);
            const  y = await axiosClient.post('/problem/addBuyProblem', data);

            console.log(y.data);
            if(x && y){
                setPoint(prev => prev - cost);
                setBuyProblem(prev => [...prev, problemId]);
            }
            
            toast.success('Problem unlocked successfully!');
        } catch (error) {
            console.error('Error unlocking problem:', error);
            // Rollback optimistic update
            setPoint(prev => prev + cost);
            setBuyProblem(prev => prev.filter(id => id !== problemId));
            toast.error('Failed to unlock problem');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-10">
            {currentProblems.length > 0 ? (
                currentProblems.map(problem => {
                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                    const isUnlocked = isProblemUnlocked(problem._id);
                    const cost = getUnlockCost(problem.difficulty);
                    
                    return (
                        <div 
                            key={problem._id} 
                            className="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300/50 hover:border-primary/30"
                        >   
                            <div className="card-body p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="card-title text-lg md:text-xl hover:text-primary transition-colors">
                                                <NavLink  className="flex items-center gap-2">
                                                    {problem.title}
                                                </NavLink>
                                            </h2>
                                            {isSolved && (
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
                                            {problem.tag?.map(tag => (
                                                <div key={tag} className="badge badge-outline badge-info gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {isUnlocked || isSolved ? (
                                        <div className="flex gap-2">
                                            <NavLink 
                                                to={`/problem/${problem._id}`} 
                                                className="btn btn-primary btn-sm md:btn-md"
                                            >
                                                Solve Challenge
                                            </NavLink>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                className={`btn btn-sm md:btn-md bg-amber-500 hover:bg-amber-600 text-white ${
                                                    point < cost ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                onClick={() => unlockProblem(problem._id, problem.difficulty)}
                                                disabled={point < cost}
                                            >
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    {`Unlock (${cost} Coins)`}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-16 bg-base-100 rounded-xl shadow-sm">
                    <div className="max-w-md mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-700 mt-4">No problems found</h3>
                        <p className="text-gray-500 mt-2">
                            No problems match your current filters.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return 'badge-success';
        case 'medium': return 'badge-warning';
        case 'hard': return 'badge-error';
        default: return 'badge-neutral';
    }
};

export default PremiumComp;