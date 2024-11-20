import type { MetaFunction } from "@remix-run/node";
import { Button, Divider, Image, Box, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import ProtectedRoute from "~/components/layouts/ProtectedRoute";
import logo from "~/assets/img/logo.png";

let mediaRecorder: MediaRecorder | undefined;
let audioChunks: Blob[] = [];

export default function Play() {
    const [isRecording, setIsRecording] = useState(false);
    const [question, setQuestion] = useState("Question Placeholder");
    const [isNextQuestionDisabled, setIsNextQuestionDisabled] = useState(false);

    const conversationInProgressRef = useRef(false);
    const hasStartedRef = useRef(false);

    const navigate = useNavigate();

    useEffect(() => {
        const startConversationOnLoad = async () => {
            console.info("App loaded. Checking if conversation should start.");
            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                console.info("Starting conversation...");
                const initialQuestion = await fetchRandomQuestion(""); 
                setQuestion(initialQuestion);
                console.info("Initial question fetched:", initialQuestion);
                await startConversation();
            }
        };

        startConversationOnLoad();

        const handleBeforeUnload = () => {
            console.info("App unloading. Stopping conversation.");
            stopConversation();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            console.info("Cleaning up event listeners and stopping conversation.");
            window.removeEventListener("beforeunload", handleBeforeUnload);
            stopConversation();
        };
    }, []);

    async function startConversation() {
        console.info("startConversation: Invoked.");
        if (conversationInProgressRef.current) {
            console.info("startConversation: Conversation already in progress. Skipping.");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("startConversation: No auth token found.");
            return;
        }

        try {
            console.info("startConversation: Making API request to start conversation.");
            const response = await fetch("https://localhost:7108/api/Conversation/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                conversationInProgressRef.current = true;
                console.info("startConversation: Conversation started successfully.");
                await startRecording();
            } else {
                console.error("startConversation: Failed to start conversation.", response.status);
            }
        } catch (error) {
            console.error("startConversation: Error while starting conversation:", error);
        }
    }

    async function stopConversation() {
        console.info("stopConversation: Invoked.");
        if (!conversationInProgressRef.current) {
            console.info("stopConversation: No conversation in progress. Skipping.");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("stopConversation: No auth token found.");
            return;
        }

        stopRecording();

        try {
            console.info("stopConversation: Making API request to stop conversation.");
            const response = await fetch("https://localhost:7108/api/Conversation/stop", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                conversationInProgressRef.current = false;
                console.info("stopConversation: Conversation stopped successfully.");
            } else {
                console.error("stopConversation: Failed to stop conversation.", response.status);
            }
        } catch (error) {
            console.error("stopConversation: Error while stopping conversation:", error);
        }
    }

    async function nextQuestion() {
        console.info("nextQuestion: Invoked.");
        if (!conversationInProgressRef.current) {
            console.info("nextQuestion: No active conversation. Skipping.");
            return;
        }

        setIsNextQuestionDisabled(true);

        console.info("nextQuestion: Stopping current conversation.");
        await stopConversation();

        const newQuestion = await fetchRandomQuestion(question); 
        setQuestion(newQuestion);
        console.info("nextQuestion: Fetched new question:", newQuestion);

        console.info("nextQuestion: Starting new conversation.");
        await startConversation();

        setIsNextQuestionDisabled(false);
    }

    async function fetchRandomQuestion(currentQuestion: string) {
        try {
            const response = await fetch("https://localhost:7108/api/Conversation/random-question", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify({ currentQuestion }), 
            });
    
            if (response.ok) {
                const data = await response.json();
                return data.question; 
            } else {
                console.error("Failed to fetch random question.");
                return "Something went wrong. Please try again.";
            }
        } catch (error) {
            console.error("Error fetching random question:", error);
            return "Error fetching question. Please try again later."; 
        }
    }      

    async function startRecording() {
        console.info("startRecording: Invoked.");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    console.info("startRecording: Capturing audio chunk.");
                    sendAudioChunk(event.data);
                }
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
            console.info("startRecording: Recording started.");
        } catch (error) {
            console.error("startRecording: Error accessing microphone:", error);
        }
    }

    function stopRecording() {
        console.info("stopRecording: Invoked.");
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            console.info("stopRecording: Recording stopped.");
        }
    }

    async function sendAudioChunk(audioBlob: Blob) {
        console.info("sendAudioChunk: Sending audio chunk.");
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("sendAudioChunk: No auth token found.");
            return;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
            await fetch("https://localhost:7108/api/Conversation/audio", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            console.info("sendAudioChunk: Audio chunk sent successfully.");
        } catch (error) {
            console.error("sendAudioChunk: Error sending audio chunk:", error);
        }
    }

    function handleBackToMainMenu() {
        console.info("handleBackToMainMenu: Navigating back to main menu.");
        stopConversation();
        navigate("/"); 
    }

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
                }}
            >
                <Box
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
                        style={{
                            fontSize: "2em",
                            fontWeight: "800",
                        }}
                    >
                        {question}
                    </Text>
                </Box>

                <Button
                    variant="filled"
                    color="black"
                    size="xl"
                    style={{
                        marginTop: "3vh",
                    }}
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
                >
                    BACK TO MAIN MENU
                </Button>
            </Box>

            <Divider
                color="black"
                style={{
                    marginTop: "9.2vh",
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
