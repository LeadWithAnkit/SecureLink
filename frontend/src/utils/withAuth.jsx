import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();

    const isAuthenticated = () => {
      return localStorage.getItem("token") || localStorage.getItem("isGuest");
    }

    useEffect(() => {
      if (!isAuthenticated()) {
        router("/auth");
      }
    }, [router]);

    // If not authenticated, don't render the component
    if (!isAuthenticated()) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  return AuthComponent;
}

export default withAuth;