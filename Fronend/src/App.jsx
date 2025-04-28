
import './App.css'
import Login from './login/Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './signup/Signup'
import ProtectedRoute from './protectedRoute/ProjectedRoute';
import CustomKanban from './component/CustomKanban';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<SignupForm/>} />
        <Route path='/kanban' element={<ProtectedRoute><CustomKanban/></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
      
    </>
  )
}

export default App
