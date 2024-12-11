import { Button, Divider, Image, Box, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

export default function Play() {
    const [isRecording, setIsRecording] = useState(false);
    const [question, setQuestion] = useState("Question Placeholder");
    const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);

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
            const response = await fetch(`https://localhost:7108/api/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                conversationInProgressRef.current = true;

                const questionData = await response.json();
                setQuestion(questionData.question);
                localStorage.setItem("conversationId", questionData.conversationId);

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
            const response = await fetch(`https://localhost:7108/api/conversations/${conversationId}/stop`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                conversationInProgressRef.current = false;
            } else {
                console.error("Failed to stop conversation", response.status);
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
        if (typeof navigator === "undefined" || typeof navigator.mediaDevices === "undefined") return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: "audio/webm" });
                sendAudioChunk(blob);
                recordedChunks = [];
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone", error);
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    }

    async function sendAudioChunk(audioBlob: Blob) {
        if (typeof window === "undefined") return;

        const conversationId = localStorage.getItem("conversationId");
        const token = localStorage.getItem("authToken");

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "audio.webm");

            const response = await fetch(`https://localhost:7108/api/conversations/${conversationId}/audio`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Failed to send audio chunk", response.status);
            }
        } catch (error) {
            console.error("Error sending audio chunk", error);
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

            <Divider
                data-testid="play-divider"
                color="black"
                style={{ marginTop: "9.2vh" }}
            />

            <Box
                data-testid="play-footer"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    data-testid="play-footer-text"
                    style={{ marginTop: "2vh", fontStyle: "italic" }}
                >
                    DeepDrunkTalks - 2024 ©
                </Text>
            </Box>
        </ProtectedRoute>
    );
}
