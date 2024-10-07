import type { MetaFunction } from "@remix-run/node";
import { Loader, Box } from '@mantine/core';
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
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
    const token = localStorage.getItem("authToken");

    if (token) {
      setState(AppState.AUTHENTICATED);
    } else {
      setState(AppState.DENIED);
    }
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
