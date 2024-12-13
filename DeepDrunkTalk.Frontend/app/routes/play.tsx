import { Button, Image, Box, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

let recorder: RecordRTC | null = null;
let audioStream: MediaStream | null = null;

export default function Play() {
  const [question, setQuestion] = useState("Question Placeholder");
  const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const conversationInProgressRef = useRef(false);
  const hasStartedRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startConversationOnLoad = async () => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        await startConversation();
      }
    };

    startConversationOnLoad();

    const handleBeforeUnload = () => {
      stopConversation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopConversation();
    };
  }, []);

  async function startConversation() {
    if (conversationInProgressRef.current || typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("/jsonproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/conversations",
          method: "POST",
          authorization: token,
          body: {}
        }),
      });

      if (response.ok) {
        const questionData = await response.json();

        setQuestion(questionData.question);
        localStorage.setItem("conversationId", questionData.conversationId);

        conversationInProgressRef.current = true;

        await startRecording();
      } else {
        console.error("Failed to start conversation", response.status);
      }
    } catch (error) {
      console.error("Error starting conversation", error);
    }
  }

  async function stopConversation() {
    if (!conversationInProgressRef.current || typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    const conversationId = localStorage.getItem("conversationId");

    if (!token || !conversationId) {
      console.error("Missing token or conversationId");
      return;
    }

    stopRecording();

    try {
      const response = await fetch("/jsonproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/conversations/${conversationId}/stop`,
          method: "PUT",
          authorization: token,
          body: {}
        }),
      });

      if (response.ok) {
        conversationInProgressRef.current = false;
        console.log("Conversation stopped successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to stop conversation", errorData);
      }
    } catch (error) {
      console.error("Error stopping conversation", error);
    }
  }

  async function nextQuestion() {
    if (!conversationInProgressRef.current) return;

    setIsNextQuestionDisabled(true);
    await stopConversation();
    await startConversation();
    setIsNextQuestionDisabled(false);
  }

  async function startRecording() {
    if (typeof window === 'undefined') return;

    try {
      const RecordRTC = (await import('recordrtc')).default;
      const { StereoAudioRecorder } = await import('recordrtc');

      audioStream = await window.navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      recorder = new RecordRTC(audioStream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 44100
      });

      recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error("Error:", error);
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (recorder) {
      recorder.stopRecording(async () => {
        try {
          // Get raw blob data and verify
          const blob = recorder?.getBlob();
          console.log('Raw blob:', blob);

          if (blob) {
            // Create proper WebM blob
            const webmBlob = new Blob([blob], {
              type: 'audio/webm'
            });
            console.log('WebM blob:', webmBlob);

            // Create FormData and verify contents
            const formData = new FormData();
            formData.append("audio", webmBlob, "recording.webm");

            // Log FormData entries
            for (let [key, value] of formData.entries()) {
              console.log(`FormData entry - ${key}:`, value);
            }

            await sendAudioChunk(webmBlob);
          }

          // Cleanup
          if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            audioStream = null;
          }
          if (recorder) {
            recorder.destroy();
            recorder = null;
          }
          setIsRecording(false);
        } catch (error) {
          console.error("Error processing recording:", error);
          setIsRecording(false);
        }
      });
    }
  }

  async function sendAudioChunk(audioBlob: Blob) {
    const token = localStorage.getItem("authToken");
    const conversationId = localStorage.getItem("conversationId");

    if (!token || !conversationId) {
      console.error("Missing token or conversationId");
      return;
    }

    // Create and verify FormData
    const formData = new FormData();
    formData.append("endpoint", `/api/conversations/${conversationId}/audio`);
    formData.append("method", "POST");
    formData.append("authorization", token);
    formData.append("audio", audioBlob, "recording.webm");

    // Log FormData contents before sending
    for (let [key, value] of formData.entries()) {
      console.log(`Sending FormData - ${key}:`, value);
    }

    try {
      const response = await fetch('/audiopostproxy', {
        method: 'POST',
        body: formData
      });

      console.log('Proxy response:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  }

  function handleBackToMainMenu() {
    stopConversation();
    navigate("/");
  }

  const calculateFontSize = (questionLength: number) => {
    let fontSize = 2;
    if (questionLength > 50) fontSize = 1.8;
    if (questionLength > 100) fontSize = 1.6;
    if (questionLength > 150) fontSize = 1.4;
    return fontSize + "em";
  };

  return (
    <ProtectedRoute>
      <Box
        data-testid="play-logo-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "4vh",
        }}
      >
        <Image
          data-testid="play-logo"
          src={logo}
          style={{
            maxWidth: "70vw",
            width: "auto",
            marginTop: "10vh",
          }}
        />
      </Box>

      <Box
        data-testid="play-question-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box
          data-testid="play-question-box"
          style={{
            height: "10em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Text
            data-testid="play-question-text"
            style={{
              fontSize: calculateFontSize(question.length),
              fontWeight: "800",
              wordWrap: "break-word",
            }}
          >
            {question}
          </Text>
        </Box>

        <Button
          data-testid="play-next-question-button"
          variant="filled"
          color="black"
          size="xl"
          style={{ marginTop: "3vh" }}
          onClick={nextQuestion}
          disabled={isNextQuestionDisabled || !conversationInProgressRef.current}
        >
          NEXT QUESTION
        </Button>

        <Button
          data-testid="play-back-to-main-menu-button"
          color="red"
          style={{ marginTop: "3vh", height: "5vh" }}
          onClick={handleBackToMainMenu}
        >
          BACK TO MAIN MENU
        </Button>
      </Box>
    </ProtectedRoute>
  );
};


