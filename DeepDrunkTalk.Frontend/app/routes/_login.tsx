import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider } from '@mantine/core';

import logo from "~/assets/img/logo.png"; 
import ProtectedRoute from "~/components/layouts/ProtectedRoute";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Login" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Login() {

  return (

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
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center'
      }}
    
    >

        <Input variant="filled" placeholder="E-Mail" 
        
            style={{
                margin: "2vw",
                width: "70vw" 
            }}
        
        />

        <Input variant="filled" placeholder="Password" 
        
            style={{
                margin: "2vw",
                width: "70vw" 
            }}
        
        />

        <Button fullWidth color="rgba(0, 0, 0, 1)" size="lg" 
        
            style={{
                marginTop: "2vw",
                width: "70vw"
            }}
        
        >LOGIN</Button>

    </Box>   

    <Divider color="black"

        style={{
          marginTop: "27vh"
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
  )
}
