import type { MetaFunction } from "@remix-run/node";
import { Button, Divider, Image, Box, Text } from '@mantine/core';
import { Link } from '@remix-run/react';
import { useEffect, useState } from "react";

import Loading from "~/components/Loading"; 
import logo from "~/assets/img/logo.png"; 
import ProtectedRoute from "~/components/layouts/ProtectedRoute";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Main Menu" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  if (!isClient) {
    return <Loading></Loading>;
  }

  return (
    <ProtectedRoute>
      <>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "4vh",
          }}
          data-testid="mainmenu-logo-container"
        >
          <Image
            src={logo}
            alt="DeepDrunkTalks Logo"
            style={{
              maxWidth: "70vw",
              width: "auto",
              marginTop: "10vh",
            }}
            data-testid="mainmenu-logo"
          />
        </Box>

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
          data-testid="mainmenu-button-container"
        >
          <Link to="/play" data-testid="mainmenu-link-play">
            <Button
              variant="filled"
              color="rgba(0, 0, 0, 1)"
              size="xl"
              style={{
                marginTop: "3vh",
              }}
              data-testid="mainmenu-button-play"
            >
              START GAME
            </Button>
          </Link>

          <Link to="/conversations" data-testid="mainmenu-link-conversations">
            <Button
              variant="filled"
              color="rgba(0, 0, 0, 1)"
              size="xl"
              style={{
                marginTop: "3vh",
              }}
              data-testid="mainmenu-button-conversations"
            >
              CONVERSATIONS
            </Button>
          </Link>

          <Link to="/settings" data-testid="mainmenu-link-settings">
            <Button
              variant="filled"
              color="rgba(0, 0, 0, 1)"
              size="xl"
              style={{
                marginTop: "3vh",
              }}
              data-testid="mainmenu-button-settings"
            >
              SETTINGS
            </Button>
          </Link>

          <Button
            color="red"
            onClick={handleLogout}
            style={{
              marginTop: "3vh",
              height: "5vh",
            }}
            data-testid="mainmenu-button-logout"
          >
            LOGOUT
          </Button>
        </Box>
      </>
    </ProtectedRoute>
  );
}
