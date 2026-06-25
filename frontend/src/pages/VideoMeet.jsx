import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");
    const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState("");

    const videoRef = useRef([])
    const chatEndRef = useRef();

    let [videos, setVideos] = useState([])
    const [selectedMsgId, setSelectedMsgId] = useState(null);
let longPressTimer = useRef(null);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
    getPermissions();
}, [])
useEffect(() => {
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
}, [messages]);
    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }
}, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

let startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.data);
};

let saveEdit = (id) => {
    setMessages((prev) =>
        prev.map(msg =>
            msg.id === id ? { ...msg, data: editText } : msg
        )
    );
    setEditingId(null);
};


    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                   connections[socketListId].ontrack = (event) => {

    let stream = event.streams[0];

    let videoExists = videoRef.current.find(
        video => video.socketId === socketListId
    );

    if (videoExists) {
        setVideos(videos => {
            const updated = videos.map(video =>
                video.socketId === socketListId
                    ? { ...video, stream }
                    : video
            );
            videoRef.current = updated;
            return updated;
        });
    } else {
        let newVideo = {
            socketId: socketListId,
            stream
        };

        setVideos(videos => {
            const updated = [...videos, newVideo];
            videoRef.current = updated;
            return updated;
        });
    }
};


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
    connections[socketListId].addTrack(track, window.localStream);
});
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        window.localStream.getTracks().forEach(track => {
    connections[socketListId].addTrack(track, window.localStream);
});
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            window.localStream.getTracks().forEach(track => {
    connections[id2].addTrack(track, window.localStream);
});
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

   let handleVideo = () => {
    const newVideoState = !video;
    setVideo(newVideoState);

    if (window.localStream) {
        window.localStream.getVideoTracks().forEach(track => {
            track.enabled = newVideoState;
        });
    }
}
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
    try {
        let tracks = localVideoref.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    } catch (e) {}

    const callData = {
        room: window.location.href,
        time: new Date().toLocaleString()
    }

    localStorage.setItem("lastCall", JSON.stringify(callData))

    window.location.href = "/home"
}

    let openChat = () => {
    setModal((prev) => {
        const newState = !prev;

        if (newState === true) {
            setNewMessages(0);
        }

        return newState;
    });
}
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }
let formatTimeSmart = (date) => {
    if (!date) return "";

    const now = new Date();
    const msgTime = new Date(date);

    const diff = Math.floor((now - msgTime) / 1000);

    if (diff < 60) return "Just now";

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);

    // ✅ SHOW EXACT TIME AFTER 1 HOUR
    if (hours < 1) {
        return msgTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ✅ AFTER 1 DAY → SHOW DATE
    return msgTime.toLocaleDateString();
};
let deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));

    let deleted = JSON.parse(localStorage.getItem("deletedMsgs")) || [];
    deleted.push(id);
    localStorage.setItem("deletedMsgs", JSON.stringify(deleted));
};
const handleLongPress = (id) => {
    longPressTimer.current = setTimeout(() => {
        setSelectedMsgId(id);
    }, 500); // 500ms hold
};

const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
};
const addMessage = (msg, sender, socketIdSender) => {

    let deleted = JSON.parse(localStorage.getItem("deletedMsgs")) || [];

    if (deleted.includes(msg.id)) return; // ❌ skip deleted

    const newMsg = {
        id: msg.id || Date.now(),
        sender: msg.sender || sender,
        data: msg.data || msg,
        time: msg.time || new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
};



    let sendMessage = () => {
    const msg = {
        id: Date.now(),   // ✅ unique id
        data: message,
        sender: username,
        time: new Date().toISOString()
    };

    socketRef.current.emit('chat-message', msg);
    setMessage("");
}
    let formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();

    const isToday = d.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString();
};

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }
   // Calculate dynamic grid layout for multiple users
    let gridCol = videos.length === 1 ? '1fr' : videos.length <= 4 ? '1fr 1fr' : 'repeat(3, 1fr)';
    let gridRow = videos.length <= 2 ? '1fr' : '1fr 1fr';

    return (
        <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#202124', color: 'white', display: 'flex', flexDirection: 'column', fontFamily: 'Roboto, sans-serif' }}>

            {askForUsername === true ? (
                /* ================= LOBBY UI ================= */
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e1e1e' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0px 10px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '24px', width: '420px', textAlign: 'center' }}>
                        <h2 style={{ margin: 0, color: '#202124', fontSize: '1.8rem', fontWeight: 600 }}>Join Meeting</h2>
                        
                        <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                            <video ref={localVideoref} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}></video>
                        </div>
                        
                        <TextField 
                            label="Enter your name" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            variant="outlined" 
                            fullWidth 
                            autoFocus
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                        <Button variant="contained" onClick={connect} size="large" fullWidth style={{ backgroundColor: '#1a73e8', padding: '12px', fontSize: '1.1rem', borderRadius: '8px', textTransform: 'none' }}>
                            Join Now
                        </Button>
                    </div>
                </div>
            ) : (
                /* ================= MAIN MEETING UI ================= */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* Top Section: Video Workspace + Chat Sidebar */}
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '16px', gap: '16px' }}>
                        
                        {/* Left/Center: Video Grid Area */}
                        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#202124', borderRadius: '12px', overflow: 'hidden' }}>
                            
                            {/* Remote Videos */}
                            {videos.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: gridCol, gridTemplateRows: gridRow, gap: '16px', width: '100%', height: '100%', padding: '8px' }}>
                                    {videos.map((video) => (
                                        <div key={video.socketId} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#3c4043', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                            <video
                                                data-socket={video.socketId}
                                                ref={ref => { if (ref && video.stream) ref.srcObject = video.stream; }}
                                                autoPlay
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            ></video>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Local Video (Fullscreen if alone, Picture-in-Picture if others join) */}
                            <video 
                                ref={localVideoref} 
                                autoPlay 
                                muted 
                                style={
                                    videos.length === 0 
                                    ? { width: '100%', maxWidth: '900px', height: '100%', maxHeight: '600px', objectFit: 'cover', borderRadius: '12px', backgroundColor: '#3c4043', transform: 'scaleX(-1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } 
                                    : { position: 'absolute', bottom: '24px', right: '24px', width: '260px', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #5f6368', zIndex: 10, transform: 'scaleX(-1)', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', backgroundColor: '#3c4043' }
                                }
                            ></video>
                        </div>

                        {/* Right: Chat Sidebar (Conditional) */}
                        {showModal && (
                            <div style={{ width: '360px', backgroundColor: '#ffffff', color: '#202124', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>In-call messages</h3>
                                    <IconButton onClick={closeChat} size="small">
                                        <span style={{ fontSize: '1.2rem', color: '#5f6368' }}>✕</span>
                                    </IconButton>
                                </div>
                                
                                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                    {messages.length !== 0 ? messages.map((item) => (
                                        <div 
                                            key={item.id} 
                                            style={{ marginBottom: "16px", backgroundColor: item.sender === username ? '#e3f2fd' : '#ffffff', border: '1px solid #e8eaed', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            onMouseDown={() => handleLongPress(item.id)}
                                            onMouseUp={cancelLongPress}
                                            onMouseLeave={cancelLongPress}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#202124' }}>{item.sender === username ? "You" : item.sender}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#5f6368' }}>{item.time ? formatTimeSmart(item.time) : ""}</span>
                                            </div>
                                            
                                            {editingId === item.id ? (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <input value={editText} onChange={(e) => setEditText(e.target.value)} style={{flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #dadce0', outline: 'none'}}/>
                                                    <button onClick={() => saveEdit(item.id)} style={{ padding: '6px 12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
                                                </div>
                                            ) : (
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#3c4043', lineHeight: 1.4 }}>{item.data}</p>
                                            )}

                                            {selectedMsgId === item.id && item.sender === username && (
                                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', padding: '8px', backgroundColor: '#f1f3f4', borderRadius: '8px' }}>
                                                    <span onClick={() => startEdit(item)} style={{ cursor: 'pointer', color: '#1a73e8', fontWeight: 500 }}>✏️ Edit</span>
                                                    <span onClick={() => deleteMessage(item.id)} style={{ cursor: 'pointer', color: '#d93025', fontWeight: 500 }}>🗑️ Delete</span>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#80868b', textAlign: 'center' }}>
                                            <ChatIcon style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '10px' }} />
                                            <p style={{ fontSize: '0.9rem', margin: 0 }}>Messages can only be seen by people in the call and are deleted when the call ends.</p>
                                        </div>
                                    )}
                                    <div ref={chatEndRef}></div>
                                </div>
                                
                                <div style={{ padding: '16px', backgroundColor: '#ffffff', borderTop: '1px solid #e8eaed', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <TextField 
                                        size="small" 
                                        value={message} 
                                        onChange={handleMessage} 
                                        placeholder="Send a message" 
                                        variant="outlined" 
                                        fullWidth 
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', backgroundColor: '#f1f3f4', '& fieldset': { border: 'none' } } }} 
                                    />
                                    <IconButton onClick={sendMessage} style={{ backgroundColor: '#1a73e8', color: 'white', padding: '10px' }}>
                                        <span style={{ fontSize: '1.2rem', transform: 'rotate(-45deg)', paddingBottom: '3px', paddingLeft: '3px' }}>➤</span>
                                    </IconButton>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', paddingBottom: '16px' }}>
                        <IconButton onClick={handleAudio} style={{ backgroundColor: audio ? '#3c4043' : '#ea4335', color: "white", width: '50px', height: '50px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleVideo} style={{ backgroundColor: video ? '#3c4043' : '#ea4335', color: "white", width: '50px', height: '50px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        {screenAvailable === true && (
                            <IconButton onClick={handleScreen} style={{ backgroundColor: screen ? '#8ab4f8' : '#3c4043', color: screen ? '#202124' : 'white', width: '50px', height: '50px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} max={99} color='error'>
                            <IconButton onClick={openChat} style={{ backgroundColor: showModal ? '#8ab4f8' : '#3c4043', color: showModal ? '#202124' : 'white', width: '50px', height: '50px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                        <IconButton onClick={handleEndCall} style={{ backgroundColor: '#ea4335', color: "white", padding: '12px 32px', borderRadius: '30px', marginLeft: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                            <CallEndIcon />
                        </IconButton>
                    </div>

                </div>
            )}
        </div>
    );
    
}