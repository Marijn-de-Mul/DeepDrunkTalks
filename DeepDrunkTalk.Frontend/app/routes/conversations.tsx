import { Button, Box, Text, Modal } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { MetaFunction } from '@remix-run/node';
import { Link } from "@remix-run/react";
import { isMobileDevice } from '~/utils/device'; 

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import Loading from "~/components/Loading";
import { AudioLoader, AudioProcessingStatus } from '~/components/AudioLoader';

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
  const [audioStatus, setAudioStatus] = useState<{ [key: number]: AudioProcessingStatus }>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      async function fetchConversations() {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        try {
          const response = await fetch("/jsonproxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              method: "GET",
              endpoint: "/api/conversations",
              authorization: token,
              body: null
            })
          });
          if (!response.ok) {
            throw new Error("Failed to fetch conversations");
          }
          const data = await response.json();
          setTimeout(() => {
            setConversations(data);
            setIsLoading(false);
          }, 800);
        } catch (error) {
          console.error("Error fetching conversations:", error);
          setIsLoading(false);
        }
      }

      fetchConversations();
    }
  }, [isClient]);

  const setAudioStatusWithDelay = async (conversationId: number, status: AudioProcessingStatus) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setAudioStatus(prev => ({ ...prev, [conversationId]: status }));
        resolve();
      }, 800);
    });
  };

  async function fetchAudioFile(conversationId: number) {
    await setAudioStatusWithDelay(conversationId, AudioProcessingStatus.INITIALIZING);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token not found. Unable to fetch audio file.");
      return;
    }

    try {
      await setAudioStatusWithDelay(conversationId, AudioProcessingStatus.FETCHING);
      const formData = new FormData();
      formData.append("endpoint", `/api/conversations/${conversationId}/audio`);

      const response = await fetch(`/audiogetproxy`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        console.log("Performing server-side conversion");
        const convertedBlob = await convertAudioOnServer(conversationId, audioBlob);
        const audioUrl = URL.createObjectURL(convertedBlob);
        setAudioUrls(prev => ({
          ...prev,
          [conversationId]: audioUrl
        }));
        setTimeout(() => {
          setAudioStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[conversationId];
            return newStatus;
          });
        }, 800);
      } else {
        console.error("Failed to fetch audio file:", response.status);
        return;
      }
    } catch (error) {
      console.error("Error fetching audio file:", error);
      return;
    }
  }

  async function convertAudioOnServer(conversationId: number, audioBlob: Blob): Promise<Blob> {
    const formData = new FormData();
    formData.append("audioFile", audioBlob, `audio_${conversationId}.webm`);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token not found. Unable to convert audio file.");
      return audioBlob;
    }

    const response = await fetch(`/audioconvertproxy`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (response.ok) {
      return await response.blob();
    } else {
      console.error("Failed to convert audio file:", response.status);
      return audioBlob;
    }
  }

  useEffect(() => {
    async function loadAudioUrls() {
      for (const conversation of conversations) {
        if (conversation.audio && !audioUrls[conversation.id]) {
          await fetchAudioFile(conversation.id);
        }
      }
    }

    if (conversations.length > 0) {
      loadAudioUrls();
    }
  }, [conversations]);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const conversationId = Number(entry.target.getAttribute('data-conversation-id'));
          if (conversationId && !audioUrls[conversationId]) {
            await fetchAudioFile(conversationId);
          }
        }
      });
    });

    const items = document.querySelectorAll('[data-conversation-id]');
    items.forEach((item) => observer.current?.observe(item));

    return () => {
      observer.current?.disconnect();
    };
  }, [conversations]);

  const deleteConversation = async (conversationId: number) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const response = await fetch(`/jsonproxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/api/conversations/${conversationId}`,
          method: 'DELETE',
          authorization: token
        })
      });

      if (response.ok) {
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        setAudioUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[conversationId];
          return newUrls;
        });
      } else {
        console.error("Failed to delete conversation:", response.status);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const openConfirmModal = (conversationId: number) => {
    setConversationToDelete(conversationId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete !== null) {
      deleteConversation(conversationToDelete);
    }
    setIsConfirmModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setConversationToDelete(null);
  };

  if (!isClient || isLoading) {
    return <Loading />;
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

        {conversations.length > 0 ? (
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
                data-conversation-id={conversation.id}
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
                  <>
                    {audioStatus[conversation.id] ? (
                      <AudioLoader status={audioStatus[conversation.id]} />
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
                  </>
                )}

                <Button
                  color="red"
                  style={{
                    marginTop: "10px",
                    width: "100%",
                  }}
                  onClick={() => openConfirmModal(conversation.id)}
                  data-testid="conversations-delete"
                >
                  DELETE
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
              textAlign: "center",
              color: "#555",
            }}
            data-testid="no-conversations-message"
          >
            <Text
              style={{
                fontSize: "1.5em",
                marginBottom: "10px",
              }}
            >
              No Conversations Yet
            </Text>
            <Text
              style={{
                fontSize: "1em",
                marginBottom: "20px",
              }}
            >
              Start a new conversation by playing the game. Your conversations will appear here once you've played.
            </Text>
            <Link to="/play">
              <Button
                color="blue"
                variant="filled"
                style={{
                  marginTop: "10px",
                  height: "5vh",
                }}
                data-testid="start-play-button"
              >
                Start Playing
              </Button>
            </Link>
          </Box>
        )}

        <Link to={"/"} data-testid="conversations-back-link">
          <Button
            color="red"
            style={{
              marginTop: "3vh",
              height: "5vh",
              position: "fixed",
              bottom: "60px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            data-testid="conversations-back-button"
          >
            BACK TO MAIN MENU
          </Button>
        </Link>
      </Box>

      <Modal
        opened={isConfirmModalOpen}
        onClose={handleCancelDelete}
        title="Confirm Deletion"
      >
        <Text size="sm">
          Are you sure you want to delete this conversation? This action cannot be undone.
        </Text>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Button color="red" onClick={handleConfirmDelete}>
            Delete
          </Button>
          <Button onClick={handleCancelDelete}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </ProtectedRoute>
  );
}
