import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate} from 'react-router-dom';

const SignupForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData,setFormData] = useState({
    email: '',
    password: '',
    teamName: '',
  });

  const handleChange=(e)=>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value 
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData);

    try {
      const res = await axios.post("http://localhost:3000/signup", {
        email: formData.email,
        password: formData.password,
        teamName: formData.teamName,
      });
      
      if (res.data.emailExists) {
        alert("Email already registered. Please log in.");
      } else if (res.data.teamExists) {
        console.log(res.data.teamExists);
        console.log("Team already exists, redirecting to kanban board");
        // Store the token if it's provided in the response
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        // Redirect to kanban page
        navigate('/kanban');
      } else {
        console.log("User created successfully, redirecting to kanban board");
        // Store the token if it's provided in the response
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        // Redirect to kanban page
        navigate('/kanban');
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Join Our Kanban</h2>
          <p className="text-indigo-200 text-center mt-2">Create your account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                name='email'
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                name='password'
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
              <input
                id="teamName"
                type="text"
                name='teamName'
                placeholder="Enter your team name"
                value={formData.teamName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            } transition-colors duration-200`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing up...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{""} 
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;