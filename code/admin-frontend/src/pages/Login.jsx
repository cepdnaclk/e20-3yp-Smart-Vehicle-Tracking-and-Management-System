import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  // Hardcoded admin credentials
  const correctEmail = "admin@example.com";
  const correctPassword = "admin123";

  const [email, setEmail] = useState(""); // Empty by default
  const [password, setPassword] = useState(""); // Empty by default
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Check hardcoded credentials
    if (email === correctEmail && password === correctPassword) {
      localStorage.setItem("token", "dummy_token"); // Simulate authentication
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container bg-light vh-100 d-flex align-items-center justify-content-center">
      <div className="login-card p-4 shadow rounded">
        <h2 className="text-center mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
