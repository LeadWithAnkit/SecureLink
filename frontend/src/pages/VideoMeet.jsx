import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import server from '../environment';


const server_url = server;


const peerConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

export default function VideoMeetComponent() {
    const socketRef = useRef();
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});
    const [roomId] = useState("meeting-room");
    const [username, setUsername] = useState("");
    const [askForUsername, setAskForUsername] = useState(true);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [showChat, setShowChat] = useState(true);
    const [newMessages, setNewMessages] = useState(0);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenShareEnabled, setScreenShareEnabled] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const peersRef = useRef({});

    // Initialize media and connect to call
    const connectToCall = async () => {
        if (!username.trim()) {
            alert("Please enter your name");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setAskForUsername(false); //firstset false, then stream user video
            connectToSocket(stream);
            
            
        } catch (error) {
            console.error("Error accessing camera/microphone:", error);
            alert("Could not access camera/microphone. Please check permissions.");
        }
    };

    const connectToSocket = (stream) => {
        console.log(" Connecting to socket server...");
        socketRef.current = io(server_url);

        socketRef.current.on('connect', () => {
            console.log("Socket connected");
            socketRef.current.emit('join-call', roomId);
        });

        // Handle chat messages
        socketRef.current.on('chat-message', (data) => {
            console.log(" Message received:", data);
            setMessages(prev => [...prev, data]);
            if (!showChat) {
                setNewMessages(prev => prev + 1);
            }
        });

        // Handle user joined - create WebRTC offer
        socketRef.current.on('user-joined', (userId, users) => {
            console.log("👤 User joined:", userId);
            if (userId !== socketRef.current.id) {
                createPeerConnection(userId, stream, true);
            }
        });

        // Handle existing users - create WebRTC answers
        socketRef.current.on('existing-users', (users) => {
            console.log("👥 Existing users:", users);
            users.forEach(userId => {
                if (userId !== socketRef.current.id && !peersRef.current[userId]) {
                    createPeerConnection(userId, stream, false);
                }
            });
        });

        // Handle user left
        socketRef.current.on('user-left', (userId) => {
            console.log(" User left:", userId);
            if (peersRef.current[userId]) {
                peersRef.current[userId].close();
                delete peersRef.current[userId];
            }
            setRemoteStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[userId];
                return newStreams;
            });
        });

        // Handle WebRTC signals
        socketRef.current.on('signal', (fromId, signalData) => {
            console.log("Signal received from:", fromId);
            handleSignal(fromId, signalData, stream);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error("Socket connection error:", error);
        });
    };

    // Create peer connection
    const createPeerConnection = (userId, stream, isOffer) => {
        console.log(" Creating peer connection with:", userId);
        
        const peer = new RTCPeerConnection(peerConfig);
        
        // Add local stream tracks
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        // Handle incoming remote stream
        peer.ontrack = (event) => {
            console.log("Received remote track from:", userId);
            if (event.streams && event.streams[0]) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [userId]: event.streams[0]
                }));
            }
        };

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('signal', userId, JSON.stringify({ ice: event.candidate }));
            }
        };

        peersRef.current[userId] = peer;

        // Create offer if needed
        if (isOffer) {
            createOffer(userId, peer);
        }
    };

    const createOffer = async (userId, peer) => {
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socketRef.current.emit('signal', userId, JSON.stringify({ sdp: peer.localDescription }));
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };

    const handleSignal = async (fromId, signalData, stream) => {
        try {
            const signal = JSON.parse(signalData);

            if (!peersRef.current[fromId]) {
                createPeerConnection(fromId, stream, false);
            }

            const peer = peersRef.current[fromId];

            if (signal.sdp) {
                await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                
                if (signal.sdp.type === 'offer') {
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);
                    socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: peer.localDescription }));
                }
            } else if (signal.ice) {
                await peer.addIceCandidate(new RTCIceCandidate(signal.ice));
            }
        } catch (error) {
            console.error("Error handling signal:", error);
        }
    };

    // Toggle video - FIXED: Actually stops the video track
    const toggleVideo = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setVideoEnabled(!videoEnabled);
            
            // Update all peer connections
            Object.values(peersRef.current).forEach(peer => {
                const senders = peer.getSenders();
                senders.forEach(sender => {
                    if (sender.track && sender.track.kind === 'video') {
                        sender.track.enabled = !videoEnabled;
                    }
                });
            });
        }
    };

    // Toggle audio - FIXED: Actually stops the audio track
    const toggleAudio = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setAudioEnabled(!audioEnabled);
            
            // Update all peer connections
            Object.values(peersRef.current).forEach(peer => {
                const senders = peer.getSenders();
                senders.forEach(sender => {
                    if (sender.track && sender.track.kind === 'audio') {
                        sender.track.enabled = !audioEnabled;
                    }
                });
            });
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!screenShareEnabled) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: true,
                    audio: true 
                });
                
                // Replace video tracks in all peer connections
                const videoTrack = screenStream.getVideoTracks()[0];
                
                Object.values(peersRef.current).forEach(peer => {
                    const sender = peer.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });

                // Update local stream
                const newStream = new MediaStream([
                    videoTrack,
                    ...localStream.getAudioTracks()
                ]);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newStream;
                }
                
                setLocalStream(newStream);
                setScreenShareEnabled(true);

                // Handle when screen share stops
                videoTrack.onended = () => {
                    toggleScreenShare();
                };
            } else {
                // Switch back to camera
                const cameraStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                
                setLocalStream(cameraStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = cameraStream;
                }
                
                // Replace video tracks back to camera in all peer connections
                const videoTrack = cameraStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(peer => {
                    const sender = peer.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });
                
                setScreenShareEnabled(false);
            }
        } catch (error) {
            console.error("Error with screen share:", error);
        }
    };

    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;
        
        const messageData = {
            message: message.trim(),
            sender: username,
            timestamp: new Date().toISOString()
        };
        
        socketRef.current.emit('chat-message', messageData);
        setMessage("");
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        Object.values(peersRef.current).forEach(peer => peer.close());
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        window.location.reload();
    };

    const remoteUsers = Object.entries(remoteStreams);

    if (askForUsername) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                backgroundImage: "url('/background2.jpg')",
                color: 'white'
            }}>
                <div style={{
                  
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '90%'
                }}>
                    <h1 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>SecureLink</h1>
                    <h2 style={{ marginBottom: '30px', fontWeight: '300' }}>Video Meeting</h2>
                    
                    <TextField 
                        label="Your Name" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        fullWidth
                        style={{ 
                            marginBottom: '20px',
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '8px'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && connectToCall()}
                    />
                    
                    <Button 
                        variant="contained" 
                        onClick={connectToCall}
                        size="large"
                        style={{
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            color: 'white',
                            padding: '12px 40px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Join Meeting
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ 
                background: '#2d2d2d',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #444'
            }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>SecureLink</span>
                    <div style={{ 
                        fontSize: '12px', 
                        background: '#444', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <PeopleIcon fontSize="small" />
                        {remoteUsers.length + 1}
                    </div>
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {roomId}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                padding: '0',
                overflow: 'hidden'
            }}>
                {/* Video Conference Area - Main Content */}
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backgroundColor: '#000'
                }}>
                    {/* Main Video Grid - Remote Participants (Larger) */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        position: 'relative'
                    }}>
                        {remoteUsers.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: '#666',
                                fontSize: '18px',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
                                    <div>Waiting for others to join...</div>
                                    <div style={{ fontSize: '14px', marginTop: '10px' }}>
                                        Share this meeting link to invite others
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: remoteUsers.length === 1 ? '1fr' : 
                                                   remoteUsers.length === 2 ? '1fr 1fr' : 
                                                   remoteUsers.length <= 4 ? '1fr 1fr' : '1fr 1fr 1fr',
                                gap: '15px',
                                width: '100%',
                                maxWidth: '1200px',
                                margin: '0 auto'
                            }}>
                                {remoteUsers.map(([userId, stream], index) => (
                                    <div key={userId} style={{
                                        position: 'relative',
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        aspectRatio: '16/9',
                                        minHeight: '300px'
                                    }}>
                                        <video 
                                            ref={ref => {
                                                if (ref) {
                                                    remoteVideoRefs.current[userId] = ref;
                                                    if (stream) {
                                                        ref.srcObject = stream;
                                                    }
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                            style={{ 
                                                width: '100%', 
                                                height: '100%',
                                                objectFit: 'cover',
                                                backgroundColor: '#2a2a2a'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: '10px',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '16px',
                                            fontSize: '12px'
                                        }}>
                                            Participant {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Self View - Small Floating (Like Zoom/WhatsApp) */}
                        {localStream && (
                            <div style={{
                                position: 'absolute',
                                bottom: '80px',
                                right: showChat ? '370px' : '20px',
                                width: '180px',
                                height: '120px',
                                backgroundColor: '#2a2a2a',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid #fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                zIndex: 10
                            }}>
                                <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    muted 
                                    playsInline
                                    style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: 'scaleX(-1)',
                                        backgroundColor: '#2a2a2a'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    left: '5px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                }}>
                                    <span>You</span>
                                    {!videoEnabled && <span style={{ fontSize: '8px' }}>📷 Off</span>}
                                    {!audioEnabled && <span style={{ fontSize: '8px' }}>🔇 Muted</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls Bar - Fixed at Bottom */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'rgba(45,45,45,0.95)',
                        padding: '15px 20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px',
                        borderTop: '1px solid #444',
                        backdropFilter: 'blur(10px)',
                        zIndex: 20
                    }}>
                        <IconButton 
                            onClick={toggleVideo}
                            style={{ 
                                color: videoEnabled ? 'white' : '#ff4444',
                                background: videoEnabled ? '#333' : '#442222',
                                width: '50px',
                                height: '50px'
                            }}
                            title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                        >
                            {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton 
                            onClick={toggleAudio}
                            style={{ 
                                color: audioEnabled ? 'white' : '#ff4444',
                                background: audioEnabled ? '#333' : '#442222',
                                width: '50px',
                                height: '50px'
                            }}
                            title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
                        >
                            {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton 
                            onClick={toggleScreenShare}
                            style={{ 
                                color: screenShareEnabled ? '#4CAF50' : 'white',
                                background: screenShareEnabled ? '#1b5e20' : '#333',
                                width: '50px',
                                height: '50px'
                            }}
                            title={screenShareEnabled ? "Stop screen share" : "Share screen"}
                        >
                            {screenShareEnabled ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </IconButton>

                        <IconButton 
                            onClick={endCall}
                            style={{ 
                                color: 'white',
                                background: '#ff4444',
                                width: '50px',
                                height: '50px'
                            }}
                            title="End call"
                        >
                            <CallEndIcon />
                        </IconButton>

                        <IconButton 
                            onClick={() => {
                                setShowChat(!showChat);
                                setNewMessages(0);
                            }}
                            style={{ 
                                color: 'white',
                                background: showChat ? '#1976d2' : '#333',
                                width: '50px',
                                height: '50px'
                            }}
                            title={showChat ? "Hide chat" : "Show chat"}
                        >
                            <Badge badgeContent={newMessages} color="error">
                                <ChatIcon />
                            </Badge>
                        </IconButton>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div style={{ 
                        width: '350px',
                        backgroundColor: '#2a2a2a',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderLeft: '1px solid #444'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #444',
                            backgroundColor: '#333'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ChatIcon fontSize="small" />
                                Chat
                            </h3>
                        </div>
                        
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '15px'
                        }}>
                            {messages.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    color: '#666', 
                                    marginTop: '50px',
                                    fontSize: '14px'
                                }}>
                                    No messages yet
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} style={{ 
                                        marginBottom: '12px',
                                        padding: '10px',
                                        background: msg.sender === username ? '#1976d2' : '#333',
                                        borderRadius: '10px',
                                        marginLeft: msg.sender === username ? '20%' : '0',
                                        marginRight: msg.sender === username ? '0' : '20%'
                                    }}>
                                        <div style={{ 
                                            fontSize: '11px', 
                                            opacity: 0.8,
                                            marginBottom: '4px',
                                            fontWeight: 'bold'
                                        }}>
                                            {msg.sender} {msg.sender === username && '(You)'}
                                        </div>
                                        <div style={{ fontSize: '13px' }}>{msg.message}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{
                            padding: '15px',
                            borderTop: '1px solid #444'
                        }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <TextField 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    fullWidth
                                    size="small"
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    InputProps={{
                                        style: { 
                                            color: 'white',
                                            background: '#333',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }
                                    }}
                                />
                                <Button 
                                    variant="contained" 
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                    style={{
                                        background: '#1976d2',
                                        minWidth: '60px'
                                    }}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}