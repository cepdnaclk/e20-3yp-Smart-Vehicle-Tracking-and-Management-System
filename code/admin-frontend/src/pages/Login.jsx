import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLock, 
  faEnvelope, 
  faUserTie, 
  faCar, 
  faMapMarkerAlt, 
  faShieldAlt, 
  faChartLine,
  faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState('owner');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hardcoded admin details
  const correctEmail = "owner@example.com";
  const correctPassword = "owner123";

  useEffect(() => {
    // Clear any previous auth tokens when arriving at login page
    localStorage.removeItem("token");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Simulate authentication with delay
    setTimeout(() => {
      if (email === correctEmail && password === correctPassword) {
        localStorage.setItem("token", "dummy_token"); // Simulate authentication
        navigate("/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 vh-100">
        {/* Left side - Vehicle Tracking Illustration */}
        <motion.div 
          className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #3a7bfd 0%, #6366f1 100%)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div className="position-relative z-1 text-center" style={{ maxWidth: "500px" }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FontAwesomeIcon icon={faTachometerAlt} className="fa-5x mb-4" />
              <h1 className="display-4 fw-bold mb-3">TrackMaster Pro</h1>
              <p className="lead fs-4 mb-4">Advanced Vehicle Tracking & Management System</p>
              <hr className="my-4 opacity-25" />
            </motion.div>

            <motion.div
              className="features-list mt-5"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div className="d-flex align-items-center mb-4 feature-item p-3" variants={slideUp}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="fa-lg me-3" />
                <span>Real-time GPS tracking with precision location</span>
              </motion.div>
              <motion.div className="d-flex align-items-center mb-4 feature-item p-3" variants={slideUp}>
                <FontAwesomeIcon icon={faShieldAlt} className="fa-lg me-3" />
                <span>Advanced tampering detection and alerts</span>
              </motion.div>
              <motion.div className="d-flex align-items-center mb-4 feature-item p-3" variants={slideUp}>
                <FontAwesomeIcon icon={faChartLine} className="fa-lg me-3" />
                <span>Comprehensive analytics and reporting</span>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Background pattern */}
          <div className="position-absolute w-100 h-100 top-0 left-0 overflow-hidden opacity-10">
            {Array.from({ length: 20 }).map((_, index) => (
              <motion.div
                key={index}
                className="position-absolute rounded-circle"
                initial={{ 
                  x: Math.random() * 100, 
                  y: Math.random() * 100,
                  opacity: 0.1 + Math.random() * 0.2
                }}
                animate={{ 
                  x: Math.random() * 100, 
                  y: Math.random() * 100,
                  opacity: 0.1 + Math.random() * 0.2
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 10 + Math.random() * 20 
                }}
                style={{
                  width: 50 + Math.random() * 100,
                  height: 50 + Math.random() * 100,
                  background: "#fff",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Right side - Login/Signup Form */}
        <motion.div 
          className="col-md-6 d-flex flex-column justify-content-center p-4 p-md-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="card shadow border-0"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className="card-body p-4 p-md-5">
              <motion.div 
                className="text-center mb-4"
                variants={slideUp}
                initial="hidden"
                animate="visible"
              >
                <h2 className="fw-bold">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Sign in to access your vehicle tracking dashboard' 
                    : 'Register to start tracking your fleet of vehicles'}
                </p>
              </motion.div>

              {/* Form Toggle Tabs */}
              <motion.ul 
                className="nav nav-pills nav-justified mb-4"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
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
              </motion.ul>

              {error && (
                <motion.div 
                  className="alert alert-danger"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  {error}
                </motion.div>
              )}

              {/* Login Form */}
              {isLogin ? (
                <motion.form 
                  onSubmit={handleLogin}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="mb-4" variants={slideUp}>
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
                    <div className="form-text text-muted">
                      Demo: owner@example.com
                    </div>
                  </motion.div>
                  
                  <motion.div className="mb-4" variants={slideUp}>
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
                    <div className="form-text text-muted">
                      Demo: owner123
                    </div>
                  </motion.div>
                  
                  <motion.div className="mb-4" variants={slideUp}>
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
                  </motion.div>
                  
                  <motion.div 
                    className="d-grid gap-2"
                    variants={slideUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button 
                      type="submit" 
                      className="btn btn-primary py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </span>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </motion.div>
                  
                  <motion.div 
                    className="mt-4 text-center" 
                    variants={slideUp}
                  >
                    <a href="#" className="text-decoration-none">Forgot Password?</a>
                  </motion.div>
                </motion.form>
              ) : (
                /* Registration Form */
                <motion.form 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/signup");
                  }}
                >
                  <motion.div 
                    className="alert alert-info mb-4"
                    variants={slideUp}
                  >
                    <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                    This is a demo application. Registration is not functional.
                  </motion.div>
                  
                  <motion.div 
                    className="d-grid gap-2"
                    variants={slideUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button type="submit" className="btn btn-primary py-2">
                      Continue to Registration
                    </button>
                  </motion.div>
                </motion.form>
              )}

              <motion.div 
                className="text-center mt-4"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                <p className="mb-0">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <a 
                    href="#" 
                    className="text-decoration-none fw-bold" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(!isLogin);
                    }}
                  >
                    {isLogin ? 'Register now' : 'Login'}
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center text-muted mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <small>© 2023 TrackMaster Pro. All rights reserved.</small>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
