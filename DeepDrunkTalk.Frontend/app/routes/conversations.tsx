import type { MetaFunction } from "@remix-run/node";
import { Button, Divider, Image, Box, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

interface Conversation {
  id: number;
  topic: string;
  question: string;
  startTime: string;
  endTime: string;
  audio: string | null; 
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [audioUrls, setAudioUrls] = useState<{ [key: number]: string | undefined }>({});

  useEffect(() => {
    async function fetchConversations() {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token found');
        return;
      }

      try {
        const response = await fetch('https://localhost:7108/api/conversations', {
          method: 'GET',
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

  async function fetchAudioFile(fileName: string) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token not found. Unable to fetch audio file.");
      return;
    }

    try {
      const response = await fetch(fileName, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
      } else {
        console.error("Failed to fetch audio file:", response.status);
      }
    } catch (error) {
      console.error("Error while fetching audio file:", error);
    }
  }

  const deleteConversation = async (conversationId: any) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token not found. Unable to fetch audio file.");
      return;
    }

    try {
      const response = await fetch(`https://localhost:7108/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        setConversations((prevConversations) =>
          prevConversations.filter((conversation) => conversation.id !== conversationId)
        );
      } else {
        console.error("Failed to delete the conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };  

  useEffect(() => {
    async function loadAudioUrls() {
      const newAudioUrls: { [key: number]: string | undefined } = {};

      for (const conversation of conversations) {
        if (conversation.audio) {
          const audioUrl = await fetchAudioFile(conversation.audio);
          newAudioUrls[conversation.id] = audioUrl;
        } else {
          newAudioUrls[conversation.id] = undefined; 
        }
      }

      setAudioUrls(newAudioUrls);
    }

    if (conversations.length > 0) {
      loadAudioUrls();
    }
  }, [conversations]);

  return (
    <ProtectedRoute>
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
            color: "black",
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
                {conversation.topic || "Untitled Topic"}
              </Text>
              <Text
                style={{
                  fontSize: "0.9em",
                  fontWeight: "400",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                {conversation.startTime && conversation.endTime
                  ? `${conversation.startTime.split(" ")[0]} (${conversation.startTime.split(" ")[1].slice(0, 5)} - ${conversation.endTime.split(" ")[1].slice(0, 5)})`
                  : "No time available"}
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
  
              {audioUrls[conversation.id] ? (
                <audio
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                  }}
                  controls
                  src={audioUrls[conversation.id]} 
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
  
              <Button
                color="red"
                style={{
                  marginTop: "10px",
                  width: "100%",
                }}
                onClick={() => deleteConversation(conversation.id)}
              >
                DELETE
              </Button>
            </Box>
          ))}
        </Box>
  
        <Link to={"/"}>
          <Button
            color="red"
            style={{
              marginTop: "1.5vh",
              height: "5vh",
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
    </ProtectedRoute>
  );  
}
