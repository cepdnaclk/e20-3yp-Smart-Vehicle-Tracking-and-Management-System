import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Signup.css";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLock, 
  faEnvelope, 
  faUser, 
  faPhone,
  faExclamationTriangle,
  faCheckCircle,
  faArrowLeft,
  faEye,
  faEyeSlash,
  faBuilding // Add building icon for companyId
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../services/authService";
import { User } from "../models/User";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "", // Add companyId field
    password: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!User.validateName(formData.firstName)) {
      errors.firstName = "First name must be between 2 and 50 characters";
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (!User.validateName(formData.lastName)) {
      errors.lastName = "Last name must be between 2 and 50 characters";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!User.validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!User.validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    // Company ID validation
    if (!formData.companyId.trim()) {
      errors.companyId = "Company ID is required";
    } else if (formData.companyId.length < 3 || formData.companyId.length > 20) {
      errors.companyId = "Company ID must be between 3 and 20 characters";
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!User.validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyId: formData.companyId.trim(), // Add companyId to the payload
        password: formData.password,
        role: 'owner'
      };
      
      const response = await authService.register(userData);
      setSuccess("Account created successfully! You can now login with your credentials.");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: "", // Reset companyId
        password: "",
        confirmPassword: ""
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 min-vh-100">
        {/* Left side - Branding */}
        <motion.div 
          className="col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #3a7bfd 0%, #6366f1 100%)"
          }}
        >
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="display-3 fw-bold mb-4">Join TrackMaster Pro</h1>
            <p className="lead fs-4 mb-4">
              Start managing your cargo with our advanced tracking system
            </p>
            <div className="features-list mt-5">
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faCheckCircle} className="fa-lg me-3" />
                <span>Complete cargo management solution</span>
              </div>
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faCheckCircle} className="fa-lg me-3" />
                <span>Real-time tracking and monitoring</span>
              </div>
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faCheckCircle} className="fa-lg me-3" />
                <span>Advanced analytics and reporting</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Signup Form */}
        <motion.div 
          className="col-md-7 d-flex flex-column justify-content-center p-4 p-md-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-100" style={{ maxWidth: "500px", margin: "0 auto" }}>
            {/* Back to Login Link */}
            <motion.div 
              className="mb-4"
              variants={slideUp}
              initial="hidden"
              animate="visible"
            >
              <Link 
                to="/login" 
                className="text-decoration-none d-flex align-items-center text-muted"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Login
              </Link>
            </motion.div>

            <motion.div 
              className="card shadow border-0"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <div className="card-body p-4 p-md-5">
                <motion.div 
                  className="text-center mb-4"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="fw-bold">Create Your Account</h2>
                  <p className="text-muted">
                    Fill in your details to get started with TrackMaster Pro
                  </p>
                </motion.div>

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

                {success && (
                  <motion.div 
                    className="alert alert-success d-flex align-items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    {success}
                  </motion.div>
                )}

                <motion.form 
                  onSubmit={handleRegistration}
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
                  {/* Name Fields */}
                  <motion.div className="row mb-3" variants={slideUp}>
                    <div className="col">
                      <label htmlFor="firstName" className="form-label">First Name *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faUser} />
                        </span>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className={`form-control ${validationErrors.firstName ? 'is-invalid' : ''}`}
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                        {validationErrors.firstName && (
                          <div className="invalid-feedback">
                            {validationErrors.firstName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col">
                      <label htmlFor="lastName" className="form-label">Last Name *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faUser} />
                        </span>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className={`form-control ${validationErrors.lastName ? 'is-invalid' : ''}`}
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                        {validationErrors.lastName && (
                          <div className="invalid-feedback">
                            {validationErrors.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div className="mb-3" variants={slideUp}>
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div className="mb-3" variants={slideUp}>
                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faPhone} />
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.phone && (
                        <div className="invalid-feedback">
                          {validationErrors.phone}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Company ID Field - Add this new field */}
                  <motion.div className="mb-3" variants={slideUp}>
                    <label htmlFor="companyId" className="form-label">Company ID *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faBuilding} />
                      </span>
                      <input
                        type="text"
                        id="companyId"
                        name="companyId"
                        className={`form-control ${validationErrors.companyId ? 'is-invalid' : ''}`}
                        placeholder="Enter your company ID"
                        value={formData.companyId}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.companyId && (
                        <div className="invalid-feedback">
                          {validationErrors.companyId}
                        </div>
                      )}
                    </div>
                    <div className="form-text">
                      This ID will be used to identify your company and connect your cargo
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div className="mb-3" variants={slideUp}>
                    <label htmlFor="password" className="form-label">Password *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>
                    <div className="form-text">
                      Password must contain at least 8 characters with uppercase, lowercase, number, and special character
                    </div>
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div className="mb-4" variants={slideUp}>
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </button>
                      {validationErrors.confirmPassword && (
                        <div className="invalid-feedback">
                          {validationErrors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
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
                          Creating Account...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </motion.div>
                </motion.form>

                <motion.div 
                  className="text-center mt-4"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.6 }}
                >
                  <p className="mb-0">
                    Already have an account? {" "}
                    <a 
                      href="#" 
                      className="text-decoration-none fw-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                    >
                      Sign in here
                    </a>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
