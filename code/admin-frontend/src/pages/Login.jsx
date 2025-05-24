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
          
          {/* Background pattern with truck animation */}
          <div className="position-absolute w-100 h-100 top-0 left-0 overflow-hidden">
            {/* Track path */}
            <div className="position-absolute w-100" style={{ bottom: '15%', left: 0, zIndex: 1 }}>
              <svg className="w-100" height="30" viewBox="0 0 1000 30">
                <defs>
                  <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,15 L1000,15" 
                  stroke="url(#trackGradient)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle 
                    key={i} 
                    cx={i * 50} 
                    cy="15" 
                    r="2" 
                    fill="rgba(255,255,255,0.7)" 
                  />
                ))}
              </svg>
            </div>
            
            {/* Moving truck animation */}
            <motion.div
              className="position-absolute"
              animate={{
                x: isLoading 
                  ? '85%' 
                  : password.length 
                    ? `${Math.min(password.length * 8, 70)}%` 
                    : '0%',
                scale: password.length || isLoading ? 1 : 0.8,
                opacity: password.length || isLoading ? 1 : 0.4,
              }}
              transition={{
                type: isLoading ? "tween" : "spring",
                duration: isLoading ? 1.5 : 0.5,
                ease: isLoading ? "easeInOut" : "easeOut",
                stiffness: 260,
                damping: 20
              }}
              style={{
                bottom: '13%',
                left: '5%',
                zIndex: 2,
                transformOrigin: "center center"
              }}
            >
              <div className="d-flex flex-column align-items-center">
                <motion.div
                  animate={{
                    rotate: isLoading ? [0, 5, -5, 0] : 0,
                    y: isLoading ? [0, -3, 0] : 0
                  }}
                  transition={{
                    rotate: { duration: 0.2, repeat: isLoading ? Infinity : 0 },
                    y: { duration: 0.3, repeat: isLoading ? Infinity : 0 }
                  }}
                >
                  <FontAwesomeIcon 
                    icon={faTruck} 
                    className="text-white" 
                    style={{ 
                      fontSize: '4rem',
                      filter: password.length || isLoading 
                        ? 'drop-shadow(0 0 15px rgba(255,255,255,0.8)) drop-shadow(0 0 30px rgba(255,255,255,0.5))' 
                        : 'drop-shadow(0 0 5px rgba(255,255,255,0.3))'
                    }} 
                  />
                </motion.div>
                
                {/* Speed lines when loading */}
                {isLoading && (
                  <motion.div
                    className="position-absolute"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], x: [-20, -40] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    style={{ left: '-30px', top: '20px' }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: [-10, -30],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 0.15,
                          delay: i * 0.05,
                          repeat: Infinity
                        }}
                        style={{
                          width: '18px',
                          height: '2px',
                          background: 'rgba(255,255,255,0.9)',
                          marginBottom: '2px',
                          borderRadius: '1px'
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Destination flag */}
            <motion.div
              className="position-absolute d-flex flex-column align-items-center"
              style={{ right: '5%', bottom: '8%' }}
              animate={{
                scale: isLoading ? [1, 1.3, 1] : [1, 1.1, 1],
                opacity: isLoading ? [0.8, 1, 0.8] : 0.9
              }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <div
                style={{
                  width: '4px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.9)',
                  marginBottom: '5px',
                  boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
              />
              <motion.div
                animate={{ 
                  x: [0, 5, 0],
                  rotateY: [0, 20, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  width: '28px',
                  height: '20px',
                  background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.8))',
                  clipPath: 'polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.9)'
                }}
              />
              <small className="text-white mt-2 fw-bold" style={{ fontSize: '0.8rem', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
                🏁 DASHBOARD
              </small>
            </motion.div>
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
            <small>© 2023 TrackMaster Pro. All rights reserved.</small>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
