import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token !== null && token !== "" ? children : <Navigate to="/" />;
};

export default ProtectedRoute;