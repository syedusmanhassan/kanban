import React, {useEffect} from "react";
import Board from "./Board";
import { Navigate, useNavigate } from "react-router-dom";

const CustomKanban = () => {
   const navigate = useNavigate();

   useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }
   }, [navigate]);

   const handleLogout = () => {
     localStorage.removeItem("token");
     navigate("/login");
   }

  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-semibold">Kanban Board</h1>
        <button 
          className="text-xs text-neutral-400 hover:text-white px-3 py-1 border border-neutral-700 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <Board />
      </div>
    </div>
  );
};

export default CustomKanban;