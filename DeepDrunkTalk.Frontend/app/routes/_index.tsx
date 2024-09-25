import type { MetaFunction } from "@remix-run/node";
import { Button , Divider, Image, Box, Text } from '@mantine/core';

import logo from "~/assets/img/logo.png"; 
import ProtectedRoute from "~/components/layouts/ProtectedRoute";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Main Menu" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {

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

        <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
        
          style={{
            marginTop: "5vh"
          }}

        >START GAME</Button>

        <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
        
          style={{
            marginTop: "5vh"
          }}
        
        >SOBER MODE</Button>

        <Button variant="filled" color="rgba(0, 0, 0, 1)" size="xl"
        
          style={{
            marginTop: "5vh"
          }}

        >SETTINGS</Button>

      </Box>

      <Divider color="black"

        style={{
          marginTop: "10vh"
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
