import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button, Typography, Box } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import server from '../environment';

const server_url = server;
var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef();
    const videoRef = useRef([]);

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(!!videoPermission);
            
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(!!audioPermission);
            
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: videoAvailable, 
                    audio: audioAvailable 
                });
                if (userMediaStream && localVideoref.current) {
                    window.localStream = userMediaStream;
                    localVideoref.current.srcObject = userMediaStream;
                }
            }
        } catch (error) {
            console.log("Permission error:", error);
        }
    };

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { console.log(e) }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            try {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                if (localVideoref.current && localVideoref.current.srcObject) {
                    let tracks = localVideoref.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
            } catch (e) { }
        }
    }

    const getDislayMediaSuccess = (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { console.log(e) }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            try {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    const getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e));
            }
        }
    }

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].onaddstream = (event) => {
                        setVideos(videos => {
                            const videoExists = videos.find(video => video.socketId === socketListId);
                            if (videoExists) {
                                return videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                            } else {
                                return [...videos, {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    autoplay: true,
                                    playsinline: true
                                }];
                            }
                        });
                    };

                    if (window.localStream) {
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                                    })
                                    .catch(e => console.log(e));
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            });
        });
    }

    const gotMessageFromServer = (fromId, message) => {
        try {
            var signal = JSON.parse(message);

            if (fromId !== socketIdRef.current) {
                if (signal.sdp) {
                    connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if (signal.sdp.type === 'offer') {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                                }).catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
                }

                if (signal.ice) {
                    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                }
            }
        } catch (e) {
            console.log("Error processing message:", e);
        }
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    const handleVideo = () => {
        setVideo(!video);
    }

    const handleAudio = () => {
        setAudio(!audio);
    }

    const handleScreen = () => {
        setScreen(!screen);
    }

    const handleEndCall = () => {
        try {
            if (localVideoref.current && localVideoref.current.srcObject) {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        } catch (e) { }
        window.location.href = "/";
    }

    const sendMessage = () => {
        if (message.trim() && socketRef.current) {
            socketRef.current.emit('chat-message', message, username);
            setMessage("");
        }
    }

    const connect = () => {
        if (username.trim()) {
            setAskForUsername(false);
            getMedia();
        } else {
            alert("Please enter a username");
        }
    }

    return (
        <div>
            {askForUsername ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Enter into Lobby
                    </Typography>
                    <TextField 
                        id="username" 
                        label="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        variant="outlined" 
                        sx={{ mr: 2 }}
                    />
                    <Button variant="contained" onClick={connect}>
                        Connect
                    </Button>
                </Box>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <Typography variant="h6" gutterBottom>
                                    Chat
                                </Typography>

                                <div className={styles.chattingDisplay}>
                                    {messages.length > 0 ? messages.map((item, index) => (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {item.sender}
                                            </Typography>
                                            <Typography variant="body2">
                                                {item.data}
                                            </Typography>
                                        </div>
                                    )) : (
                                        <Typography variant="body2">No Messages Yet</Typography>
                                    )}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField 
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)} 
                                        id="chat-message" 
                                        label="Enter your message" 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Button variant='contained' onClick={sendMessage}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red", background: 'rgba(255,255,255,0.2)' }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video, index) => (
                            <div key={video.socketId || index}>
                                <video
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}