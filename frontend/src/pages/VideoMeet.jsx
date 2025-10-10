import React from 'react'
import {useRef,useState} from 'react'
import { useEffect } from 'react';
import "../styles/videoComponents.css"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const server_url = 'http://localhost:8000';

var connections = {};

// outside function not conventional
//stun server used to connect btw clients (WebRTC)
//local Ip to public Ip to connect on internet;
const peerConfigConnections ={
    "iceServers":[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeet() {

    var socketRef= useRef();
    let socketIdRef = useRef();

    let localVideoRef= useRef();

    let [videoAvailable, setVideoAvailable]= useState(true); // permission for access camera

    let [audioAvailable, setAudioAvailable]= useState(true);

    let [video,setVideo]= useState(); // on/off by buttion

    let [audio,setAudio]= useState();

    let [screen,setScreen]= useState(); //for screensharing

    let [showModal,setModal]= useState(); //for popups

    let [screenAvailable, setScreenAvailable]= useState(); 

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages]= useState(0);

    let [askForUsername, setAskUsername]= useState(true);

    let [username,setUsername] = useState("");

    const videoRef = useRef([])

    let [videos,setVideos] = useState([])

    // if(isChrome==false){ //chromium based browser

    // }
    const getPermission= async()=>{
        try{
        const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});

        if(videoPermission){
            setVideoAvailable(true);
        }
        else{
            setVideoAvailable(false);
        }
        const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});

        if(audioPermission){
            setAudioAvailable(true);
        }
        else{
            setAudioAvailable(false);
        }
        if(navigator.mediaDevices.getDisplayMedia){
            setScreenAvailable(true);
        }
        else{
            setScreenAvailable(false);
        }

        if(videoAvailable|| audioAvailable){
            const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable, audio:audioAvailable});

            if(userMediaStream){
                window.localStream = userMediaStream;
                if(localVideoRef.current){
                    localVideoRef.current.srcObject = userMediaStream;
                }
            }
        }    
        }catch(err){
           console.error(err);
        }
    }

    useEffect(()=>{
        getPermission();
    }, [])

    //globally implement change(audio,video) overall throughout stream
    let getUserMediaSuccess = (stream)=>{

    }
     
    let getUserMedia = ()=>{
        if((video && videoAvailable) || (audio && audioAvailable)){
           navigator.mediaDevices.getUserMedia({video:video, audio:audio})
           .then(getUserMediaSuccess) //ToDo UserMedia success
           .then((stream)={})
           .catch((e)=>console.log(e))
       }else{
           try{
             let tracks= localVideoRef.current.srcObject.getTracks();
             tracks.forEach(track => track.stop())
           }
           catch(e){ }
       }
    } 
    useEffect(()=>{
        if(video !== undefined && audio !== undefined){
            getUserMedia();
        }
    }, [video, audio]) // in dependency array 
    
    let getMedia = ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);

        // connectToSocketServer();
    }

  return (
    <div> 
       {askForUsername === true ?
       <div>
        
        <h2>Enter into Lobby</h2>
        <TextField id="outlined-basic" label="Username" value={username} onChange={e =>setUsername(e.target.value)} />
        <Button variant="contained" >Connect</Button>

        <div> 
            <video ref={localVideoRef} autoPlay muted > </video>
         </div>   

         </div> : <></>
        }
    </div>
  )
}

