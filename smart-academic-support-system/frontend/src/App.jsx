import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookSearch from "./pages/BookSearch";
import BookDetails from "./pages/BookDetails";
import MyIssuedBooks from "./pages/MyIssuedBooks";
import Recommendations from "./pages/Recommendations";
import RoadmapGenerator from "./pages/RoadmapGenerator";
import ProgressTracker from "./pages/ProgressTracker";
import StudentReservations from "./pages/StudentReservations";
import Notifications from "./pages/Notifications";
import StudentProfile from "./pages/StudentProfile";
import P2PStudyHub from "./pages/P2PStudyHub";
import ShadowLibrary from "./pages/ShadowLibrary";
import AdminBooks from "./pages/AdminBooks";
import AdminIssues from "./pages/AdminIssues";
import AdminReservations from "./pages/AdminReservations";
import AdminOverdue from "./pages/AdminOverdue";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const Protected = ({ role, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route element={<Protected><DashboardLayout /></Protected>}>
      <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
      <Route path="/books" element={<Protected role="student"><BookSearch /></Protected>} />
      <Route path="/books/:id" element={<Protected><BookDetails /></Protected>} />
      <Route path="/issued" element={<Protected role="student"><MyIssuedBooks /></Protected>} />
      <Route path="/my-reservations" element={<Protected role="student"><StudentReservations /></Protected>} />
      <Route path="/recommendations" element={<Protected role="student"><Recommendations /></Protected>} />
      <Route path="/roadmaps" element={<Protected role="student"><RoadmapGenerator /></Protected>} />
      <Route path="/progress" element={<Protected role="student"><ProgressTracker /></Protected>} />
      <Route path="/p2p-study" element={<Protected role="student"><P2PStudyHub /></Protected>} />
      <Route path="/p2p-books" element={<Protected role="student"><ShadowLibrary /></Protected>} />
      <Route path="/notifications" element={<Protected role="student"><Notifications /></Protected>} />
      <Route path="/profile" element={<Protected role="student"><StudentProfile /></Protected>} />
      <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/admin/books" element={<Protected role="admin"><AdminBooks /></Protected>} />
      <Route path="/admin/issues" element={<Protected role="admin"><AdminIssues /></Protected>} />
      <Route path="/admin/reservations" element={<Protected role="admin"><AdminReservations /></Protected>} />
      <Route path="/admin/overdue" element={<Protected role="admin"><AdminOverdue /></Protected>} />
      <Route path="/admin/reports" element={<Protected role="admin"><Reports /></Protected>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
