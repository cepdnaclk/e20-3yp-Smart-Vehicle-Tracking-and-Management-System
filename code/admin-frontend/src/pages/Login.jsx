import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLock, 
  faEnvelope, 
  faMapMarkerAlt, 
  faShieldAlt, 
  faChartLine,
  faTachometerAlt,
  faTruck,
  faFlag,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.login(email.trim(), password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // Modify the tab click handler to navigate directly to signup
  const handleTabClick = (tab) => {
    if (tab === 'signup') {
      navigate('/signup');
    } else {
      setIsLogin(true);
      setError("");
      setValidationErrors({});
    }
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
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                animate={{
                  x: [0, -3, 3, -3, 3, 0],
                  rotate: [0, -2, 2, -2, 2, 0]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FontAwesomeIcon icon={faTruck} className="fa-5x mb-4" />
              </motion.div>
              {/* Smoke effect */}
              <div className="position-absolute" style={{ bottom: 500, left: '35%', transform: 'translateX(-50%)', zIndex: 1 }}>
                <motion.div
                  initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, x: -20, y: -20 }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: 0.5
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '50%',
                    filter: 'blur(5px)'
                  }}
                />
                 <motion.div
                  initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.2, x: -15, y: -15 }}
                  transition={{
                    duration: 2.5,
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: 1
                  }}
                  style={{
                    width: '25px',
                    height: '25px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '50%',
                    filter: 'blur(4px)',
                     marginTop: '10px',
                     marginLeft: '5px'
                  }}
                />
              </div>
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
          
          {/* Background pattern with truck animation */}
          
          {/* Destination flag */}
          
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
                    : 'Register to start tracking your cargo of vehicles'}
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
                    onClick={() => handleTabClick('login')}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link w-100 ${!isLogin ? 'active' : ''}`}
                    onClick={() => handleTabClick('signup')}
                  >
                    Sign Up
                  </button>
                </li>
              </motion.ul>

              {error && (
                <motion.div 
                  className="alert alert-danger d-flex align-items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
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
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        id="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({ ...prev, email: '' }));
                          }
                        }}
                        required
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
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
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="password" 
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) {
                            setValidationErrors(prev => ({ ...prev, password: '' }));
                          }
                        }}
                        required
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
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
                /* Instead of showing the registration form info, navigate directly */
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: {
                        duration: 0.3
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  onAnimationComplete={() => navigate('/signup')}
                >
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Redirecting...</span>
                    </div>
                  </div>
                </motion.div>
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
                      if (isLogin) {
                        navigate('/signup');
                      } else {
                        setIsLogin(true);
                        setError("");
                        setValidationErrors({});
                      }
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
            <small>© 2025 TrackMaster Pro. All rights reserved.</small>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
