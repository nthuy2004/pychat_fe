import { useSelector } from "react-redux";
import { Navigate, Outlet, Route } from "react-router-dom";


const PrivateRoute = ({redirectPath = "/login", children}) => {
    const {isAuthenticated} = useSelector((state) => state.auth);
    if(isAuthenticated)
    {
        return children;
    }
    return <Navigate to={redirectPath} replace />;
}

export default PrivateRoute;