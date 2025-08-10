import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setShowPopup(true);
    setConfirmText('');
  };

  const confirmDelete = async () => {
    try {
      await axiosClient.delete(`/problem/delete/${pendingDeleteId}`);
      setProblems(problems.filter(problem => problem._id !== pendingDeleteId));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    } finally {
      setShowPopup(false);
      setConfirmText('');
      setPendingDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delete Problems</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-4/12">Title</th>
              <th className="w-2/12">Difficulty</th>
              <th className="w-3/12">Tags</th>
              <th className="w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>
                <td>{problem.title}</td>
                <td>
                  <span className={`badge ${
                    problem.difficulty === 'Easy' 
                      ? 'badge-success' 
                      : problem.difficulty === 'Medium' 
                        ? 'badge-warning' 
                        : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <span className="badge badge-outline">{problem.tags}</span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(problem._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DaisyUI Modal */}
      {showPopup && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">Are you sure?</h3>
            <p className="mb-4">
              Please type <span className="font-bold text-red-500">delete</span> to confirm this action.
            </p>
            <input 
              type="text" 
              className="input input-bordered w-full mb-4"
              placeholder="Type 'delete' here"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button 
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowPopup(false);
                    setConfirmText('');
                    setPendingDeleteId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-error"
                  disabled={confirmText !== 'delete'}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AdminDelete;
