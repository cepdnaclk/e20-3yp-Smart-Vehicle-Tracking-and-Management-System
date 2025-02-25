import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Signup.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faUserTie, faCar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [email, setEmail] = useState(""); // Empty by default
  const [password, setPassword] = useState(""); // Empty by default
  const [userRole, setUserRole] = useState('owner'); // Default user role as 'owner'
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up
  const navigate = useNavigate();

  // Hardcoded admin details
  const correctEmail = "owner@example.com";
  const correctPassword = "owner123";
  const ownerDetails = {
    firstName: "John",
    lastName: "Doe",
    email: "owner@example.com",
    phone: "+1234567890",
    activationKey: "OWNER_ACTIVATION_KEY"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Check hardcoded credentials for login
    if (email === correctEmail && password === correctPassword) {
      localStorage.setItem("token", "dummy_token"); // Simulate authentication
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin); // Toggle between Login and Sign Up
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* Left side - Vehicle Tracking Illustration */}
        <div className="col-md-7 d-none d-md-flex flex-column justify-content-center align-items-center bg-primary text-white p-5">
          <div className="mb-5 text-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="fa-5x mb-4" />
            <h1 className="display-4 fw-bold">TrackMaster Pro</h1>
            <p className="lead">Advanced Vehicle Tracking & Management System</p>
            <hr className="my-4 bg-white" />
            <p>Real-time tracking, accident detection, and comprehensive vehicle management in one place.</p>
          </div>
        </div>

        {/* Right side - Login/Signup Form */}
        <div className="col-md-5 d-flex flex-column justify-content-center p-4">
          <div className="card shadow border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Sign in to access your dashboard' 
                    : 'Register to start tracking your vehicles'}
                </p>
              </div>

              {/* Form Toggle Tabs */}
              <ul className="nav nav-pills nav-justified mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link w-100 ${isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link w-100 ${!isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </li>
              </ul>

              {/* Login Form */}
              {isLogin ? (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="password" 
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userRole" className="form-label">Login as</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={userRole === 'owner' ? faUserTie : faCar} />
                      </span>
                      <select 
                        className="form-select" 
                        id="userRole"
                        value={userRole}
                        onChange={handleRoleChange}
                      >
                        <option value="owner">Cargo Owner</option>
                        <option value="driver">Vehicle Driver</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary py-2">Sign In</button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/signup"); // Navigate to signup page
                }}>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary py-2">Register</button>
                  </div>
                </form>
              )}

              <div className="text-center mt-4">
                <p className="mb-0">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <a href="/signup" className="text-decoration-none" onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(!isLogin); // Toggle form visibility
                  }}>
                    {isLogin ? 'Register now' : 'Login'}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
