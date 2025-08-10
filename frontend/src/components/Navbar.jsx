import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router'; // Fixed import
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?._id) {
        try {
          const id = user._id;
          const response = await axiosClient.post(`/video/image/get`,{id});
          if (response.data) {
            setProfilePhoto(response.data.secureUrl);
          }
        } catch (error) {
          console.error('Error fetching profile photo:', error);
        }
      }
    };

    fetchProfilePhoto();
  }, [user?._id]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleProblem = () => {
    setActiveTab('practice');
    navigate('/problem');
  };

 const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === 'learn') navigate('/');
  if (tab === 'interview') navigate('/interview');
  if (tab === 'potd') navigate('/potd');
};

  const handleAdmin = () => {
    setActiveTab('admin');
    navigate('/admin');
  };

  const handlePremium = () => {
    setActiveTab('premium');
    navigate('/premiumproblem');
  };

  const handleContest = () => {
    setActiveTab('premium');
    navigate('/contest');
  };

  return (
    <nav className="navbar bg-base-200 shadow-lg px-8 sticky top-0 z-50 pl-10 pr-10">
      {/* Left-aligned elements */}
      <div className="flex-1 flex items-center space-x-8">
        <NavLink 
          to="/" 
          className="btn btn-ghost text-xl font-bold text-primary hover:bg-transparent p-0"
          onClick={() => setActiveTab('learn')}
        >
          <span className="text-accent">Code</span>Ace
        </NavLink>
        
        <div className="flex space-x-2">
          <button 
            className={`btn btn-ghost ${activeTab === 'learn' ? 'btn-active bg-primary/10' : ''}`}
            onClick={() => handleTabClick('learn')}
          >
            Home
          </button>
          <button 
            className={`btn btn-ghost ${activeTab === 'practice' ? 'btn-active bg-primary/10' : ''}`}
            onClick={handleProblem}
          >
            Problem
          </button>
          <button 
            className={`btn btn-ghost ${activeTab === 'premium' ? 'btn-active bg-primary/10' : ''}`}
            onClick={handlePremium}
          >
            Premium
          </button>
          <button 
            className={`btn btn-ghost ${activeTab === 'premium' ? 'btn-active bg-primary/10' : ''}`}
            onClick={handleContest}
          >
            Contest
          </button>
          <button 
            className={`btn btn-ghost ${activeTab === 'interview' ? 'btn-active bg-primary/10' : ''}`}
            onClick={() => handleTabClick('interview')}
          >
            Interview
          </button>
          <button 
            className={`btn btn-ghost ${activeTab === 'interview' ? 'btn-active bg-primary/10' : ''}`}
            onClick={() => handleTabClick('potd')}
          >
            Potd
          </button>
          
        </div>
      </div>

      {/* Admin button */}
      {user?.role === 'admin' && (
        <button 
          className={`mr-5 bg-amber-700 h-7 w-13 btn btn-ghost ${activeTab === 'admin' ? 'btn-active bg-primary/10' : ''}`}
          onClick={handleAdmin}
        >
          Admin
        </button>
      )}

      {/* Right-aligned user controls */}
      <div className="flex-none gap-4 flex-row items-center">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="avatar placeholder cursor-pointer hover:opacity-80 transition-opacity">
              {profilePhoto ? (
                <div className="w-11 h-11 rounded-full">
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="rounded-full object-cover  w-full h-full"
                  />
                </div>
              ) : (
                <div className="bg-blue-500 rounded-full text-neutral-content h-8 w-8">
                  <span className="text-lg font-medium flex items-center justify-center mt-[-0.5vw] text-[1.8vw]">
                    {user.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <ul className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              <li>
                <NavLink to="/profile" className="hover:bg-base-200">
                  Profile
                </NavLink>
              </li>
          
              {user?.role === 'admin' && (
                <li>
                  <button 
                    onClick={handleAdmin}
                    className="hover:bg-base-200 text-left w-full"
                  >
                    Admin Dashboard
                  </button>
                </li>
              )}
             
              <li>
                <Link to={'https://drive.google.com/file/d/1lYOgoCJEz1Ly7KmndsUbH7HLjalcsGE2/view?usp=drivesdk'} target='blank'>
         
            Documentiation
        
          </Link>
              </li>
               <li>
                <button 
                  onClick={handleLogout}
                  className="hover:bg-base-200 text-error"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <NavLink 
              to="/login" 
              className="btn btn-ghost hover:bg-base-300"
            >
              Sign in
            </NavLink>
            <NavLink 
              to="/register" 
              className="btn btn-primary text-white hover:bg-primary-focus"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;