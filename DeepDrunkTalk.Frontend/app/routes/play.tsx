import { Button, Image, Box, Text, Center, Stack, Card, Title } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";
import Loading from '~/components/Loading';

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

const requestMicrophoneAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); 
    return true;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    return false;
  }
};

export default function Play() {
  const [question, setQuestion] = useState("Question Placeholder");
  const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "prompt" | undefined
  >(undefined);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isRequestingMicrophone, setIsRequestingMicrophone] = useState(true);

  const conversationInProgressRef = useRef(false);
  const hasStartedRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMicrophonePermission = async () => {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setPermissionStatus(status.state);

        status.onchange = () => {
          setPermissionStatus(status.state);
        };
      } catch (error) {
        console.error("Permission API not supported:", error);
        setPermissionStatus("granted");
      }
    };

    checkMicrophonePermission();

    const handleBeforeUnload = () => {
      stopConversation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopConversation();
    };
  }, []);

  useEffect(() => {
    async function enableMicrophone() {
      setIsRequestingMicrophone(true);
      const accessGranted = await requestMicrophoneAccess();
      setIsMicrophoneEnabled(accessGranted);
      setIsRequestingMicrophone(false);
      setIsLoading(false);
    }

    enableMicrophone();
  }, []);

  const handleStartConversation = async () => {
    if (isMicrophoneEnabled && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setIsReadyToStart(true);
      await startConversation();
    }
  };

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
          body: {},
        }),
      });

      if (response.ok) {
        const questionData = await response.json();

        setQuestion(questionData.question);
        localStorage.setItem("conversationId", questionData.conversationId);

        conversationInProgressRef.current = true;

        if (permissionStatus === "granted") {
          await startRecording();
        } else {
          console.warn("Microphone access not granted. Recording will not start.");
        }
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
          body: {},
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

  const AUDIO_FORMATS = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/mpeg",
  ];
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];

      const supportedFormat = AUDIO_FORMATS.find((format) =>
        MediaRecorder.isTypeSupported(format)
      );
      if (!supportedFormat) {
        throw new Error("No supported audio format found");
      }
      console.log("Using format:", supportedFormat);
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedFormat,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        await sendAudioChunk(audioBlob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error:", error);
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
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
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/audiopostproxy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  }

  async function handleBackToMainMenu() {
    await stopConversation();
    navigate("/");
  }

  const calculateFontSize = (questionLength: number) => {
    let fontSize = 2;
    if (questionLength > 50) fontSize = 1.8;
    if (questionLength > 100) fontSize = 1.6;
    if (questionLength > 150) fontSize = 1.4;
    return fontSize + "em";
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isRequestingMicrophone) {
    return <Loading />;
  }

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

      {!isMicrophoneEnabled && (
        <Box
          data-testid="microphone-access-message"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            color: "#555",
            height: "100vh",
          }}
        >
          <Text
            style={{
              fontSize: "1.5em",
              marginBottom: "10px",
            }}
          >
            Microphone Access Required
          </Text>
          <Text
            style={{
              fontSize: "1em",
              marginBottom: "20px",
            }}
          >
            Please enable microphone access to start the conversation.
          </Text>
          <Button
            color="red"
            style={{
              marginTop: "1.5vh",
              height: "5vh",
            }}
            onClick={handleBackToMainMenu}
            data-testid="play-back-to-main-menu-button"
          >
            BACK TO MAIN MENU
          </Button>
        </Box>
      )}

      {isMicrophoneEnabled && !isReadyToStart && (
        <Box
          data-testid="ready-to-start-message"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            color: "#555",
            height: "100vh",
          }}
        >
          <Text
            style={{
              fontSize: "1.5em",
              marginBottom: "10px",
            }}
          >
            Microphone Access Granted
          </Text>
          <Text
            style={{
              fontSize: "1em",
              marginBottom: "20px",
            }}
          >
            Microphone access granted. Click "Continue" to start the conversation.
          </Text>
          <Button
            variant="filled"
            color="green"
            style={{ marginTop: "10px", height: "5vh" }}
            onClick={handleStartConversation}
          >
            Continue
          </Button>
          <Button
            color="red"
            style={{
              marginTop: "1.5vh",
              height: "5vh",
            }}
            onClick={handleBackToMainMenu}
            data-testid="play-back-to-main-menu-button"
          >
            BACK TO MAIN MENU
          </Button>
        </Box>
      )}

      {isReadyToStart && (
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
            color="red"
            style={{
              marginTop: "3vh",
              height: "5vh",
            }}
            onClick={handleBackToMainMenu}
            data-testid="play-back-to-main-menu-button"
          >
            BACK TO MAIN MENU
          </Button>
        </Box>
      )}
      <Box
        data-testid="play-footer"
        style={{
          position: "fixed",
          bottom: "10px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Text data-testid="play-footer-text">DeepDrunkTalks - 2024 ©</Text>
      </Box>
    </ProtectedRoute>
  );
}
