// components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import NotFoundPage from "../pages/NotFoundPage";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const tpuser = JSON.parse(localStorage.getItem("tpuser"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!tpuser.user.admin) {
    return <NotFoundPage/>
  }

  return children;
};

export default AdminRoute;
