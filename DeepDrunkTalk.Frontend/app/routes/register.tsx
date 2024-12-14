import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text } from '@mantine/core';
import { useState, useEffect } from "react";
import { Form, Link } from "@remix-run/react";

import logo from "~/assets/img/logo.png";
import Loading from "~/components/Loading";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Register" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Register() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(""); 

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/jsonproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/users/register",
          method: "POST",
          body: { name, email, password, confirmPassword }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful!", data);

        if (isClient) {
          localStorage.setItem("authToken", data.token);
          window.location.href = "/";
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An error occurred during registration.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Network error. Please try again later.");
    }
  };

  if (!isClient) {
    return <Loading></Loading>;
  }

  return (
    <>
      <Box
        data-testid="register-logo-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "2vh"
        }}
      >
        <Image
          data-testid="register-logo"
          src={logo}
          style={{
            maxWidth: "70vw",
            width: "auto",
            marginTop: "10vh"
          }}
        />
      </Box>

      <Box
        data-testid="register-header-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "2vh"
        }}
      >
        <Text
          data-testid="register-header"
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
          data-testid="register-form"
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Input
            data-testid="register-usernameinput"
            variant="filled"
            placeholder="Username"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              margin: "2vw",
              width: "70vw"
            }}
          />

          <Input
            data-testid="register-emailinput"
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
            data-testid="register-passwordinput"
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
            data-testid="register-confirm-passwordinput"
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

          {error && <Text data-testid="register-error-message" color="red" size="1em">{error}</Text>}

          <Button
            data-testid="register-button"
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

          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              data-testid="login-button-onregisterscreen"
              fullWidth
              color="rgba(0, 0, 0, 1)"
              size="lg"
              style={{
                marginTop: "2vw",
                height: "5vh",
              }}
            >
              LOGIN INSTEAD
            </Button>
          </Link>
        </Form>
      </Box>
    </>
  );
}
