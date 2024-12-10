import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider } from '@mantine/core';
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

import logo from "~/assets/img/logo.png";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Login" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Track if it's running client-side
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true); // Ensure that this only runs on the client
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("https://localhost:7108/api/users/login", {
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

        if (isClient) {
          localStorage.setItem("authToken", data.token);
          navigate("/"); 
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Network error during login");
    }
  };

  if (!isClient) {
    return null; 
  }

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
          Login
        </Text>
      </Box>

      <Box>
        <form
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
            LOGIN
          </Button>

          <a href="./register">
            <Button
              fullWidth
              color="rgba(0, 0, 0, 1)"
              size="lg"
              type="button"
              style={{
                marginTop: "2vw",
                height: "5vh"
              }}
            >
              REGISTER INSTEAD
            </Button>
          </a>
        </form>
      </Box>

      <Divider
        color="black"
        style={{
          marginTop: error ? "13.2vh" : "15vh"
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
