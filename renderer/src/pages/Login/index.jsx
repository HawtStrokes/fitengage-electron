import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    console.log("Sending login request:", { email, password });

    try {
      const response = await window.api.loginUser({ email, password });

      console.log("Login response:", response);

      if (response.success) {
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert(response.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-white to-red-400">
      <div className="bg-[#D2122E] p-10 rounded-lg shadow-lg w-full sm:w-96 text-white text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">Login</h2>
        <p className="text-center text-sm mb-6">Login to your account!</p>

        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#fd5c63]">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none text-white w-full"
              type="email"
              placeholder="Email Address"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#fd5c63]">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none text-white w-full"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-red-300 to bg-red-600 text-white font-medium">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

