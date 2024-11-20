import type { MetaFunction } from "@remix-run/node";
import { Button, Divider, Image, Box, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

interface Conversation {
  id: number;
  category: string;
  topic: string;
  question: string;
  startTime: string;
  endTime: string;
  length: number;
  audioUrl: string;
}

export default function Conversations() {

  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {

    async function fetchConversations() {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token found');
        return;
      }

      try {
        const response = await fetch('https://localhost:7108/api/Conversation/get-conversations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    }

    fetchConversations();
  }, []);

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
            width: "100%",
          }}
        >
          <Text
            style={{
              margin: "3vh",
              marginTop: "1vh",
              fontSize: "2em",
              fontWeight: "800",
              color: "#333",
              textAlign: "center",
            }}
          >
            Conversations
          </Text>

          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px",
              gap: "15px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 625px)",
              width: "90%",
              borderRadius: "10px",
              boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            {conversations.map((conversation) => (
              <Box
                key={conversation.id}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
                }}
              >
                <Text
                  style={{
                    fontSize: "1.2em",
                    fontWeight: "600",
                    color: "#000",
                    marginBottom: "5px",
                  }}
                >
                  {conversation.topic || "Untitled Conversation"}
                </Text>
                <Text
                  style={{
                    fontSize: "0.9em",
                    fontWeight: "400",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  {conversation.startTime.split("T")[0]}{" "}
                  ({conversation.startTime.split("T")[1].slice(0, 5)} - {conversation.endTime.split("T")[1].slice(0, 5)})
                </Text>
                <Text
                  style={{
                    fontSize: "0.9em",
                    fontWeight: "400",
                    color: "#333",
                    marginBottom: "10px",
                  }}
                >
                  {conversation.question || "No question available."}
                </Text>
                {conversation.audioUrl ? (
                  <audio
                    style={{
                      width: "100%",
                      borderRadius: "5px",
                    }}
                    controls
                    src={conversation.audioUrl}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: "0.9em",
                      fontWeight: "400",
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    No audio available
                  </Text>
                )}
              </Box>
            ))}
          </Box>

          <Link to={"/"}>
            <Button
              color="red"
              style={{
                marginTop: "1.5vh",
                height: "5vh"
              }}
            >
              BACK TO MAIN MENU
            </Button>
          </Link>
        </Box>

        <Divider
          color="black"
          style={{
            marginTop: "4vh",
          }}
        />

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              marginTop: "2vh",
              fontStyle: "italic",
            }}
          >
            DeepDrunkTalks - 2024 ©
          </Text>
        </Box>
      </>
    </ProtectedRoute>
  );
}