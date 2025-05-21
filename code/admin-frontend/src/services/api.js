import axios from "axios";

// Set your backend URL here (adjust if running on a different host/port)
const BASE_URL = "http://localhost:5000"; // or your deployed backend URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export { api };
