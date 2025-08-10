import {Routes, Route ,Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload";
import AdminVideo from "./components/AdminVideo";
import InterviewPage from "./components/InterviewPage";
import InterviewResults from "./components/InterviewResults";
import Problem from "./pages/Problem";
import InterviewHomepage from "./components/InterviewHome";
import InterviewDetails from "./components/InterviewDetails";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import DailyProblem from "./pages/DailyProblem";
import AdminPotd from "./components/AdminPotd";
import AdminTransscript from "./components/AdminTranscript";
import AdminContest from "./components/AdminContest";
import ContestPage from "./pages/ContestPage";
import DesignContest from "./components/DesingContest";
import ContestProblem from "./components/ContestProblem";
import ContestEditor from "./pages/ContestEditor";
import Result from "./components/Result";
import ProfilePhotoUpload from "./components/ProfilePhotoUpload";


function App(){
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
    <Routes>
      <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
      <Route path="/problem" element={isAuthenticated?<Problem></Problem>:<Navigate to="/" />}></Route>
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/admin/uploadTrans/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminTransscript></AdminTransscript>: <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>    
      <Route path="/interview" element={<InterviewHomepage></InterviewHomepage>}></Route>    
      <Route path="/interview-results" element={<InterviewResults></InterviewResults>}></Route>    
      <Route path="/ins" element={<InterviewPage></InterviewPage>}></Route>   
      <Route path="/interview-details" element={<InterviewDetails></InterviewDetails>}></Route>  /profile
      <Route path="/profile" element={<ProfilePage></ProfilePage>}></Route>   
      <Route path="/premiumproblem" element={<PremiumPage></PremiumPage>}></Route>   
      <Route path="/potd" element={<DailyProblem></DailyProblem>}></Route> 
      <Route path="/admin/createPotd" element={<AdminPotd></AdminPotd>}></Route>
      <Route path="/admin/createContest" element={<AdminContest></AdminContest>}></Route>
      <Route path="/contest" element={<ContestPage></ContestPage>}></Route>
      <Route path="/admin/designcontest" element={<DesignContest></DesignContest>}></Route>
      <Route path="/contest/:contest_id" element={<ContestProblem></ContestProblem>}></Route>
      <Route path="/contests/:contest_id/:problem_id" element={<ContestEditor></ContestEditor>}></Route>
      <Route path="/contest/:contest_id/results" element={<Result></Result>}></Route>
      <Route path="/profile/photo" element={<ProfilePhotoUpload></ProfilePhotoUpload>}></Route>
    </Routes>
  </>
  )
}

export default App;
