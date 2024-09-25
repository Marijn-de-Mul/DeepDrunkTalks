import type { MetaFunction } from "@remix-run/node";
import { Loader, Box } from '@mantine/core';

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Login" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

import { useState, useEffect } from "react";
import Login from "~/routes/_login";

enum AppState {
  AUTHENTICATED,
  DENIED,
  LOADING
}

let authenticated: boolean = false; 

export default function ProtectedRoute({ children }: any) {
  const [state, setState] = useState<AppState>(AppState.LOADING);
  
  useEffect(() => {
    setTimeout(() => { 
      if (authenticated == true) { 
        setState(AppState.AUTHENTICATED)
      } else { 
        setState(AppState.DENIED)
      }
    }, 2000)
  }, [])

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
  
  if (state === AppState.DENIED)
    return Login()

  return children
}