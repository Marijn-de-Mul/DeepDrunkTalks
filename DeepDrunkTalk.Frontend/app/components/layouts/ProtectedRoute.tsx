import { Loader, Box } from '@mantine/core';
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export const meta = () => {
  return [
    { title: "DeepDrunkTalks - Protected" },
    { name: "description", content: "This is a protected page" },
  ];
};

enum AppState {
  AUTHENTICATED,
  DENIED,
  LOADING
}

export default function ProtectedRoute({ children }: any) {
  const [state, setState] = useState<AppState>(AppState.LOADING);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        const tokenExpiry = JSON.parse(atob(token.split('.')[1])).exp; 

        if (tokenExpiry * 1000 < Date.now()) {
          setState(AppState.DENIED);
          return;
        }

        setState(AppState.AUTHENTICATED);
      } else {
        setState(AppState.DENIED);
      }
    };

    checkAuth();

    const intervalId = setInterval(() => {
      checkAuth();
    }, 60 * 1000); 

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" && e.newValue !== localStorage.getItem("authToken")) {
        setState(AppState.DENIED);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (state === AppState.LOADING) {
    return (
      <Box 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', 
        }}
      >
        <Loader color="rgba(0, 0, 0, 1)" size="xl" />
      </Box>
    );
  }

  if (state === AppState.DENIED) {
    navigate("/login");
    return null;
  }

  return children;
}
