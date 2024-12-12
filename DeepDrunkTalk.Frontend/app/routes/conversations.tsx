import { Button, Divider, Image, Box, Text, Loader } from '@mantine/core';
import { useState, useEffect } from 'react';
import { Link, MetaFunction } from '@remix-run/react';

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";
import Loading from "~/components/Loading";

interface Conversation {
  id: number;
  topic: string;
  question: string;
  startTime: string;
  endTime: string;
  audio: string | null;
}

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Conversations" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [audioUrls, setAudioUrls] = useState<{ [key: number]: string | undefined }>({});
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      async function fetchConversations() {

        setIsLoading(true); 

        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        try {
          const backendUrl = process.env.NODE_ENV === "production"
            ? "https://backend:8079"
            : "https://localhost:8079";

          const response = await fetch(`${backendUrl}/api/conversations`, {
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
          
          setTimeout(() => {
            setConversations(data);
            setIsLoading(false);
          }, 800);

        } catch (error) {
          console.error('Error fetching conversations:', error);
          setIsLoading(false);
        }
      }

      fetchConversations();
    }
  }, [isClient]);

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

  if (!isClient || isLoading) {
    return <Loading></Loading>; 
  }

  return (
    <ProtectedRoute>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
          marginTop: "5vh", 
        }}
        data-testid="conversations-main-container"
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
          data-testid="conversations-header"
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
            maxHeight: "calc(100vh - 250px)",
            width: "90%",
            borderRadius: "10px",
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
          data-testid="conversations-list"
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
              data-testid="conversations-item"
            >
              <Text
                data-testid="conversations-item-topic"
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
                data-testid="conversations-item-question"
                style={{
                  fontSize: "0.9em",
                  fontWeight: "400",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                {conversation.question || "No question available."}
              </Text>
              <Text
                data-testid="conversations-item-time"
                style={{
                  fontSize: "0.9em",
                  fontWeight: "400",
                  color: "#333",
                  marginBottom: "10px",
                }}
              >
                {conversation.startTime && conversation.endTime
                  ? `${conversation.startTime.split(" ")[0]} (${conversation.startTime.split(" ")[1].slice(0, 5)} - ${conversation.endTime.split(" ")[1].slice(0, 5)})`
                  : "No time available"}
              </Text>

              {audioUrls[conversation.id] ? (
                <audio
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                  }}
                  controls
                  src={audioUrls[conversation.id]}
                  data-testid="conversations-item-audio"
                />
              ) : (
                <Text
                  data-testid="conversations-item-no-audio"
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
                data-testid="conversations-delete"
              >
                DELETE
              </Button>
            </Box>
          ))}
        </Box>

        <Link to={"/"} data-testid="conversations-back-link">
          <Button
            color="red"
            style={{
              marginTop: "1.5vh",
              height: "5vh",
            }}
            data-testid="conversations-back-button"
          >
            BACK TO MAIN MENU
          </Button>
        </Link>
      </Box>

      <Divider
        color="black"
        style={{
          marginTop: "0.5vh",
        }}
        data-testid="conversations-divider"
      />

      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        data-testid="conversations-footer"
      >
        <Text
          style={{
            marginTop: "2vh",
            fontStyle: "italic",
          }}
          data-testid="conversations-footer-text"
        >
          DeepDrunkTalks - 2024 ©
        </Text>
      </Box>
    </ProtectedRoute>
  );
}
