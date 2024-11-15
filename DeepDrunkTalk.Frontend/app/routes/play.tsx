import type { MetaFunction } from "@remix-run/node";
import { Button , Divider, Image, Box, Text } from '@mantine/core';
import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';

import ProtectedRoute from '~/components/layouts/ProtectedRoute';
import logo from "~/assets/img/logo.png"; 

let mediaRecorder: MediaRecorder | undefined; 
let audioChunks: Blob[] = []; 

export default function Play() {
    const [isRecording, setIsRecording] = useState(false);

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                sendAudioChunk(event.data);
            }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    }

    async function startConversation() {
        const token = localStorage.getItem('authToken'); 

        if (!token) {
            console.error("No auth token found");
            return;
        }

        const response = await fetch('https://localhost:7108/api/Conversation/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            setIsRecording(true);
        } else {
            console.error("Failed to start conversation", response.status);
        }
    }

    async function stopConversation() {
        const token = localStorage.getItem('authToken');
    
        if (!token) {
            console.error("No auth token found");
            return;
        }

        stopRecording();

        const response = await fetch('https://localhost:7108/api/Conversation/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
    
        if (response.ok) {
            setIsRecording(false);
        } else {
            console.error("Failed to stop conversation", response.status);
        }
    }    

    async function sendAudioChunk(audioBlob: Blob) {
        const token = localStorage.getItem('authToken'); 

        if (!token) {
            console.error("No auth token found");
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob);

        await fetch('https://localhost:7108/api/Conversation/audio', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
    }

    return (    
        <ProtectedRoute>
            <> 

                <Box
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center", 
                        marginBottom: "4vh"
                    }}
                > 
                    <Image 
                        src={logo}
                        style={{
                            maxWidth: "70vw", 
                            width: "auto", 
                            marginTop: "10vh"
                        }}
                    />
                </Box>

                <Box  
                    style={{
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        flexDirection: "column"
                    }}
                > 

                    <Text
                        style={{
                            margin: "3vh", 
                            fontSize: "2em", 
                            fontWeight: "800"
                        }}
                    >
                        Question Placeholder
                    </Text>

                    <Button 
                        variant="filled" 
                        color="rgba(0, 0, 0, 1)" 
                        size="xl"
                        style={{
                            marginTop: "3vh"
                        }}
                        onClick={startConversation}
                        disabled={isRecording}  // Disable when recording is in progress
                    >
                        START CONVERSATION
                    </Button>

                    <Button 
                        variant="filled" 
                        color="rgba(0, 0, 0, 1)" 
                        size="xl"
                        style={{
                            marginTop: "3vh"
                        }}
                        onClick={stopConversation}
                        disabled={!isRecording}  // Disable when not recording
                    >
                        STOP CONVERSATION
                    </Button>

                    <Link to={"/"}>
                        <Button
                            color="red"
                            style={{ 
                                marginTop: "3vh",
                                height: "5vh"
                            }}
                        >
                            BACK TO MAIN MENU
                        </Button>
                    </Link>

                </Box>

                <Divider color="black"
                    style={{
                        marginTop: "6vh"
                    }}
                />

                <Box 
                    style={{
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center"
                    }}
                > 

                    <Text 
                        style={{
                            marginTop: "2vh", 
                            fontStyle: "italic"
                        }}
                    >
                        DeepDrunkTalks - 2024 ©
                    </Text>

                </Box>

            </>
        </ProtectedRoute>
    );
}
