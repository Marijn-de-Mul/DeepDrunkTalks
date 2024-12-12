import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider, Loader } from '@mantine/core';
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

import logo from "~/assets/img/logo.png";
import Loading from "~/components/Loading";

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
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/jsonproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/users/login",
          method: "POST",
          body: { email, password }
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
    return <Loading></Loading>;
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

          data-testid={"login-logo"}
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

          data-testid={"login-header"}
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

          data-testid={"login-form"}
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

            data-testid={"login-emailinput"}
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

            data-testid={"login-passwordinput"}
          />

          {error && <Text data-testid={"login-error-message"} color="red" size="1em">{error}</Text>}

          <Button
            fullWidth
            color="rgba(0, 0, 0, 1)"
            size="lg"
            type="submit"
            style={{
              marginTop: "2vw",
              width: "70vw"
            }}

            data-testid={"login-button"}
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

              data-testid={"register-button-onloginscreen"}
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
