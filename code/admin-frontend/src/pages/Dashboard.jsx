import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Admin Dashboard</span>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h1 className="text-primary">Welcome to Admin Dashboard</h1>
      </div>
    </div>
  );
}

export default Dashboard;
