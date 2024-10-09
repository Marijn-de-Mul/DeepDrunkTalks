import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider } from '@mantine/core';
import { useState } from "react";

import logo from "~/assets/img/logo.png"; 
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Register" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(""); 

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("https://localhost:7108/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful!", data);

        localStorage.setItem("authToken", data.token);  
        window.location.href = "/";  
      } else {
        const errorData = await response.json(); 
        
        setError(errorData.message || "An error occurred during registration."); 
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Network error. Please try again later."); 
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
        >
          Register
        </Text>
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
          
          <Input 
            variant="filled" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              margin: "2vw",
              width: "70vw" 
            }}
          />

          <Input 
            variant="filled" 
            placeholder="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              margin: "2vw",
              width: "70vw" 
            }}
          />

          <Input 
            variant="filled" 
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              margin: "2vw",
              width: "70vw" 
            }}
          />

          <Input 
            variant="filled" 
            placeholder="Repeat Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              margin: "2vw",
              width: "70vw" 
            }}
          />

          {error && <Text color="red" size="1em">{error}</Text>} 

          <Button 
            fullWidth 
            color="rgba(0, 0, 0, 1)" 
            size="lg" 
            type="submit"
            style={{
              marginTop: "2vw",
              width: "70vw"
            }}
          >
            REGISTER
          </Button>

            <a href="./login"> 
              <Button 
                fullWidth 
                color="rgba(0, 0, 0, 1)" 
                size="lg" 
                style={{
                  marginTop: "2vw",
                  height: "5vh"
                }}
              >
                LOGIN INSTEAD
              </Button>
            </a>
          </Form>
      </Box>   

      <Divider 
        color="black"
        style={{
          marginTop: error ? "1.0vh" : "2.8vh"
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
        > 
          DeepDrunkTalks - 2024 © 
        </Text>
      </Box>
    </>
  );
}
