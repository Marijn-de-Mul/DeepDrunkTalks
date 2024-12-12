import React, { useState, useEffect } from "react";
import { Button, Divider, Image, Box, Text, Slider, Tooltip } from "@mantine/core";
import { FaInfoCircle } from "react-icons/fa";
import { Link, MetaFunction } from "@remix-run/react";

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";
import Loading from "~/components/Loading";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Settings" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Settings() {
  const [volume, setVolume] = useState<number>(50);
  const [refreshFrequency, setRefreshFrequency] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("No auth token found");

      setLoading(true);
      setError(null);

      const response = await fetch("/jsonproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/users/settings",
          method: "GET",
          authorization: authToken,
          body: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setVolume(data.volumeLevel ?? 50);
      setRefreshFrequency(data.refreshFrequency ?? 5);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch settings";
      console.error("Error fetching settings:", err);
      setError(message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  const saveSettings = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("No auth token found");

      setError(null);

      const response = await fetch("/jsonproxy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/users/settings",
          method: "PUT",
          authorization: authToken,
          body: {
            volumeLevel: volume,
            refreshFrequency,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      console.log("Settings saved successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      console.error("Error saving settings:", err);
      setError(message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Box
        data-testid="setting-loading-state"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loading/>
      </Box>
    );
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
        >
          <Image
            src={logo}
            data-testid="setting-app-logo"
            style={{
              maxWidth: "70vw",
              width: "auto",
              marginTop: "10vh",
            }}
          />
        </Box>

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "90%",
            margin: "0 auto",
          }}
        >
          <Text
            data-testid="setting-title"
            style={{
              margin: "3vh",
              marginBottom: "1vh",
              marginTop: "1vh",
              fontSize: "2em",
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            Settings
          </Text>

          <Box
            style={{
              marginBottom: "3vh",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <Text
              data-testid="setting-volume-label"
              style={{
                marginBottom: "1vh",
                fontSize: "1.2em",
                fontWeight: "600",
              }}
            >
              Volume Level
            </Text>
            <Slider
              value={volume}
              onChange={setVolume}
              min={0}
              max={100}
              step={1}
              label={`${volume}%`}
              data-testid="setting-volume-slider"
            />
            <Text
              style={{ marginTop: "1vh", fontSize: "1em" }}
              data-testid="setting-volume-value"
            >
              {`Current Volume: ${volume}%`}
            </Text>
          </Box>

          <Box
            style={{
              marginBottom: "3vh",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <Text
              data-testid="setting-refresh-label"
              style={{
                marginBottom: "1vh",
                fontSize: "1.2em",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Refresh Frequency (Minutes)
              <Tooltip
                label="This controls how frequently the system checks for updates."
                position="top"
                withArrow
                data-testid="setting-refresh-tooltip"
              >
                <span style={{ marginLeft: "5px", cursor: "pointer" }}>
                  <FaInfoCircle size={18} />
                </span>
              </Tooltip>
            </Text>

            <Slider
              value={refreshFrequency}
              onChange={setRefreshFrequency}
              min={1}
              max={10}
              step={1}
              label={`${refreshFrequency} min`}
              data-testid="setting-refresh-slider"
            />

            <Text
              style={{ marginTop: "1vh", fontSize: "1em" }}
              data-testid="setting-refresh-value"
            >
              {`Current Refresh Frequency: ${refreshFrequency} minutes`}
            </Text>
          </Box>

          <Button
            color="red"
            style={{
              marginTop: "0.5vh",
              height: "5vh",
            }}
            onClick={saveSettings}
            data-testid="setting-save-settings-button"
          >
            SAVE SETTINGS
          </Button>

          <Link to={"/"}>
            <Button
              color="red"
              style={{
                marginTop: "0.5vh",
                height: "5vh",
              }}
              data-testid="setting-back-to-menu-button"
            >
              BACK TO MAIN MENU
            </Button>
          </Link>
        </Box>
      </>
    </ProtectedRoute>
  );
}
