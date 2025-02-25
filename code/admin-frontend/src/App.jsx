import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/drivers" element={<Drivers />} />
      <Route path="/vehicles" element={<Vehicles />} /> 
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/Settings" element={<Settings/>} />
    </Routes>
  );
}

export default App;
