import type { MetaFunction } from "@remix-run/node";
import { Button , Divider, Image, Box, Text } from '@mantine/core';
import { Link } from '@remix-run/react';

import logo from "~/assets/img/logo.png"; 
import ProtectedRoute from "~/components/layouts/ProtectedRoute";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Main Menu" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    
    window.location.href = "/login";
  };  

  return (
    <ProtectedRoute>
      <> 

      <Box

        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center", 
          marginBottom: "4vh"
        }}
        
      > 
        <Image 

          src={logo}

          style={{
              maxWidth: "70vw", 
              width: "auto", 
              marginTop: "10vh"
          }}

        />

      </Box>

      <Box  

        style={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          flexDirection: "column"
        }}

      > 

        <Link to="/play">
          <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
          
            style={{
              marginTop: "3vh"
            }}

          >START GAME</Button>
        </Link>

        <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
        
          style={{
            marginTop: "3vh"
          }}
        
        >SOBER MODE</Button>

        <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
        
          style={{
            marginTop: "3vh"
          }}

        >SETTINGS</Button>

        <Button

            color="red"
            onClick={handleLogout}
            style={{ 
              marginTop: "3vh",
              height: "5vh"
            }}
          
          >LOGOUT</Button>

      </Box>

      <Divider color="black"

        style={{
          marginTop: "8vh"
        }}

      ></Divider>

      <Box 

        style={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center"
        }}

      > 

        <Text 
        
          style={{
            marginTop: "2vh", 
            fontStyle: "italic"
          }}
        
        > DeepDrunkTalks - 2024 © </Text>

      </Box>

      </>
    </ProtectedRoute>
  )
}
