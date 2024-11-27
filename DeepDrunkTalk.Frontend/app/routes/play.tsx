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
        const startConversationOnLoad = async () => {
            console.info("App loaded. Checking if conversation should start.");
            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                console.info("Starting conversation...");
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

                const questionData = await response.json(); 
                setQuestion(questionData.question);
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

        console.info("nextQuestion: Starting new conversation.");
        await startConversation(); 

        setIsNextQuestionDisabled(false);
    }
    
    async function startRecording() {
        console.info("startRecording: Invoked.");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    
            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    console.info("startRecording: Capturing audio chunk.");
                    recordedChunks.push(event.data);
                }
            };
    
            mediaRecorder.onstop = () => {
                console.info("startRecording: Recording stopped.");
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                sendAudioChunk(blob);  
                recordedChunks = [];  
            };
    
            mediaRecorder.start(1000);
            setIsRecording(true);
            console.info("startRecording: Recording started.");
        } catch (error) {
            console.error("startRecording: Error accessing microphone:", error);
        }
    }
    
    // Stop the recording and trigger the onstop event
    function stopRecording() {
        console.info("stopRecording: Invoked.");
        if (mediaRecorder) {
            mediaRecorder.stop();  
            setIsRecording(false);
            console.info("stopRecording: Recording stopped.");
        } else {
            console.error("stopRecording: MediaRecorder is not defined.");
        }
    }
    
    async function sendAudioChunk(audioBlob: Blob) {
        console.info("sendAudioChunk: Sending audio chunk.");
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("sendAudioChunk: No auth token found.");
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
    
            const response = await fetch("https://localhost:7108/api/Conversation/audio", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });
    
            if (response.ok) {
                console.info("sendAudioChunk: Audio chunk sent successfully.");
            } else {
                console.error("sendAudioChunk: Failed to send audio chunk.", response.status);
            }
        } catch (error) {
            console.error("sendAudioChunk: Error sending audio chunk:", error);
        }
    }
    

    function handleBackToMainMenu() {
        console.info("handleBackToMainMenu: Navigating back to main menu.");
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
                            fontSize: calculateFontSize(question.length), 
                            fontWeight: "800",
                            wordWrap: "break-word", 
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
