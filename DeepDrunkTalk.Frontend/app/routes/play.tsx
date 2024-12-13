import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Button, Image, Box, Text } from "@mantine/core";

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

export default function Play() {
  const [question, setQuestion] = useState("Question Placeholder");
  const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationInProgress, setConversationInProgress] = useState(false); // Changed from useRef to useState

  const recorderRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
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
    if (conversationInProgress || typeof window === "undefined") return;

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
          body: {},
        }),
      });

      if (response.ok) {
        const questionData = await response.json();

        setQuestion(questionData.question);
        localStorage.setItem("conversationId", questionData.conversationId);

        setConversationInProgress(true); // Update state instead of ref

        await startRecording();
      } else {
        console.error("Failed to start conversation", response.status);
      }
    } catch (error) {
      console.error("Error starting conversation", error);
    }
  }

  async function stopConversation() {
    if (!conversationInProgress || typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    const conversationId = localStorage.getItem("conversationId");

    if (!token || !conversationId) {
      console.error("Missing token or conversationId");
      return;
    }

    await stopRecording();

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
          body: {},
        }),
      });

      if (response.ok) {
        setConversationInProgress(false); // Update state instead of ref
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
    if (!conversationInProgress || isRecording || isProcessing) return;

    setIsProcessing(true);
    setIsNextQuestionDisabled(true);
    console.log("Stopping current conversation...");
    await stopConversation();
    console.log("Starting new conversation...");
    await startConversation();
    setIsProcessing(false);
    setIsNextQuestionDisabled(false);
  }

  async function startRecording() {
    if (typeof window === "undefined") return;

    try {
      const RecordRTCModule = await import("recordrtc");
      const { StereoAudioRecorder } = await import("recordrtc");

      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });

      const RecordRTC = RecordRTCModule.default;

      recorderRef.current = new RecordRTC(audioStreamRef.current, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 44100,
        timeSlice: 1000, // Capture audio in 1-second chunks
        ondataavailable: (blob: Blob) => {
          console.log("Received audio chunk:", blob.size, "bytes");
          if (blob.size > 0) {
            sendAudioChunk(blob).catch((error) =>
              console.error("Error sending audio chunk:", error)
            );
          } else {
            console.error("Received empty audio chunk");
          }
        },
      });

      recorderRef.current.startRecording();
      console.log("Recording started with streaming (chunks every 1s)");
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting RecordRTC:", error);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (recorderRef.current && isRecording) {
      return new Promise<void>((resolve, reject) => {
        recorderRef.current?.stopRecording(async () => {
          try {
            const blob = recorderRef.current?.getBlob();
            console.log("Final recorded blob:", blob);

            if (blob && blob.size > 0) {
              console.log(`Final blob size: ${blob.size} bytes`);
              await sendAudioChunk(blob); // Send the final chunk if necessary
            } else {
              console.error("Final blob is undefined, null, or empty");
            }

            if (audioStreamRef.current) {
              audioStreamRef.current.getTracks().forEach((track) => track.stop());
              audioStreamRef.current = null;
              console.log("Audio stream stopped.");
            }

            if (recorderRef.current) {
              recorderRef.current.destroy();
              recorderRef.current = null;
              console.log("Recorder destroyed.");
            }

            setIsRecording(false);
            resolve();
          } catch (error) {
            console.error("Error processing final recording:", error);
            setIsRecording(false);
            reject(error);
          }
        });

        // Optional: Set a timeout to reject if stopRecording takes too long
        setTimeout(() => {
          if (isRecording) {
            console.error("stopRecording timed out.");
            reject(new Error("stopRecording timed out."));
          }
        }, 5000); // 5 seconds timeout
      });
    } else {
      console.error("Cannot stop recording: RecordRTC is not active");
      return Promise.resolve();
    }
  }

  async function sendAudioChunk(audioBlob: Blob) {
    const token = localStorage.getItem("authToken");
    const conversationId = localStorage.getItem("conversationId");

    if (!token || !conversationId) {
      console.error("Missing token or conversationId");
      return;
    }

    const formData = new FormData();
    formData.append("endpoint", `/api/conversations/${conversationId}/audio`);
    formData.append("method", "POST");
    formData.append("authorization", token);
    formData.append("audio", audioBlob, "recording.webm");

    for (let [key, value] of formData.entries()) {
      console.log(`Sending FormData - ${key}:`, value);
    }

    try {
      const response = await fetch("/audiopostproxy", {
        method: "POST",
        body: formData,
      });

      console.log("Proxy response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from proxy: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log("Audio chunk uploaded successfully.");
      }
    } catch (error) {
      console.error("Error sending audio chunk:", error);
    }
  }

  async function handleBackToMainMenu() {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsNextQuestionDisabled(true);
    console.log("Stopping conversation before navigating to main menu...");
    await stopConversation();
    console.log("Navigating to main menu.");
    navigate("/");
    setIsProcessing(false);
    setIsNextQuestionDisabled(false);
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
          disabled={
            isNextQuestionDisabled ||
            !conversationInProgress || // Updated from ref to state
            isRecording ||
            isProcessing
          }
        >
          NEXT QUESTION
        </Button>

        <Button
          data-testid="play-back-to-main-menu-button"
          color="red"
          style={{ marginTop: "3vh", height: "5vh" }}
          onClick={handleBackToMainMenu}
          disabled={isProcessing}
        >
          BACK TO MAIN MENU
        </Button>
      </Box>
    </ProtectedRoute>
  );
}
