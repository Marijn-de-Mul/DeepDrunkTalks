import { Button, Image, Box, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";
import Loading from '~/components/Loading';

export default function Play() {
  const [question, setQuestion] = useState("Question Placeholder");
  const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "prompt" | undefined
  >(undefined);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isRequestingMicrophone, setIsRequestingMicrophone] = useState(true);

  const conversationInProgressRef = useRef(false);
  const hasStartedRef = useRef(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const intentionalStopRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setPermissionStatus(status.state);

        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        const shouldReload = () => {
          return (
            status.state === "granted" &&
            isSafari &&
            !sessionStorage.getItem("hasReloaded")
          );
        };

        if (shouldReload()) {
          sessionStorage.setItem("hasReloaded", "true");
          window.location.reload();
        }

        const handleChange = () => {
          setPermissionStatus(status.state);

          if (status.state === "granted" && isSafari && !sessionStorage.getItem("hasReloaded")) {
            sessionStorage.setItem("hasReloaded", "true");
            window.location.reload();
          }
        };

        status.addEventListener('change', handleChange);

        return () => {
          status.removeEventListener('change', handleChange);
        };
      } catch (error) {
        console.error("Permission API not supported:", error);
        setPermissionStatus("granted");
      }
    };

    checkMicrophonePermission();
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

  useEffect(() => {
    if (isMicrophoneEnabled && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setIsReadyToStart(true);
      startConversation(); 
    }
  }, [isMicrophoneEnabled]);

  const handleStartConversation = async () => {
    if (isMicrophoneEnabled && !conversationInProgressRef.current) {
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
    intentionalStopRef.current = true; 
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
      if (!mediaStreamRef.current) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
  
      recordedChunksRef.current = [];
      intentionalStopRef.current = false;
  
      const supportedFormat = AUDIO_FORMATS.find((format) =>
        MediaRecorder.isTypeSupported(format)
      );
  
      if (!supportedFormat) {
        throw new Error("No supported audio format found");
      }
  
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
        mimeType: supportedFormat,
      });
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorderRef.current.onstop = async () => {
        if (!intentionalStopRef.current && mediaRecorderRef.current) {
          console.warn("MediaRecorder stopped unexpectedly, retrying...");
          await startRecording();
        } else if (recordedChunksRef.current.length > 0) {
          const audioBlob = new Blob(recordedChunksRef.current, { type: supportedFormat });
          await sendAudioChunk(audioBlob);
        }
      };
  
      mediaRecorderRef.current.start(1000);
  
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  async function sendAudioChunk(audioBlob: Blob) {
    const token = localStorage.getItem("authToken");
    const conversationId = localStorage.getItem("conversationId");

    if (!token) {
      console.error("Missing token");
      return;
    }

    if (!conversationId) {
      console.error("Missing conversationId");
      return;
    }

    if (!audioBlob) {
      console.error("Missing audioBlob");
      return;
    }

    console.log(`Sending audio chunk with MIME type: ${audioBlob.type} and size: ${audioBlob.size} bytes`);

    const formData = new FormData();
    formData.append("endpoint", `/api/conversations/${conversationId}/audio`);
    formData.append("authorization", token);
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/audiopostproxy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Audio chunk sent successfully:", responseData);
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      intentionalStopRef.current = true;
      mediaRecorderRef.current.stop();
    }
  
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }
  
  async function handleBackToMainMenu() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      intentionalStopRef.current = true;
      mediaRecorderRef.current.stop();
    }
  
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  
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

  if (isLoading || isRequestingMicrophone) {
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
    </ProtectedRoute>
  );
}

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
