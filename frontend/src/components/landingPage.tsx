import { useEffect, useRef, useState } from "react"
import { Room } from "./Room";


export function LandingPage() {

    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [joined, setJoined] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [name , setName] = useState("");

    async function getCheckHair() {

        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })

        const video = stream.getVideoTracks()[0];
        const audio = stream.getAudioTracks()[0]
        setLocalAudioTrack(audio);
        setLocalVideoTrack(video);

        if (!videoRef.current) {
            return;
        }

        videoRef.current.srcObject = new MediaStream([video, audio]);
        
    }
    useEffect(() => {

        if (videoRef.current) {
            getCheckHair();
        }

    }, [videoRef])

    if (!joined) {
        return (
            <div>
                <video autoPlay ref={videoRef}></video>
                <input 
                type="text" 
                placeholder="Name" 
                onChange={(e)=>{setName(e.target.value)}}
                />
                <button onClick={()=>{setJoined(true)}}>Join</button>
            </div>
        )
    }

    return(
        <Room name = {name} localAudioTrack = {localAudioTrack} localVideoTrack = {localVideoTrack}></Room>
    )

}