import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider } from '@mantine/core';

import logo from "~/assets/img/logo.png"; 
import Register from "./register";
import { Form } from "@remix-run/react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Login" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    try {
      const response = await fetch("https://localhost:7108/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });


      if (response.ok) {
        const data = await response.json();
        console.log("Login successful!", data);

        window.location.href = '/';

      } else {
        console.error("Login failed");
        // Optionally, handle error response here
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Optionally, handle network or other errors here
    }
  };

  return (

    <>

    <Box
    
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
        marginBottom: "2vh"
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
        marginBottom: "2vh"
      }}

    > 

        <Text
        
          style={{
            fontWeight: "bolder",
            fontSize: "2em"
          }}
        
        >Login</Text>

    </Box>

    <Box> 

      <Form

        onSubmit={handleSubmit}

        style={{
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center'
        }}

      > 
        <Input variant="filled" placeholder="E-Mail" 
            
            type="email"
  
            value={email}
          
            onChange={(e) => setEmail(e.target.value)}

            style={{
                margin: "2vw",
                width: "70vw" 
            }}
        
        />

        <Input variant="filled" placeholder="Password" 
        
            type="password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}
            
            style={{
                margin: "2vw",
                width: "70vw" 
            }}

        />

        <Button fullWidth color="rgba(0, 0, 0, 1)" size="lg" 
            
            type="submit"

            style={{
                marginTop: "2vw",
                width: "70vw"
            }}
        
        >LOGIN</Button>


        <a href="./register"> 
          <Button fullWidth color="rgba(0, 0, 0, 1)" size="lg" 
                
              type="button"

              style={{
                  marginTop: "2vw",
                  width: "70vw"
              }}
    
          >REGISTER INSTEAD</Button>
        </a>

      </Form>

    </Box>   

    <Divider color="black"

        style={{
          marginTop: "14vh"
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
