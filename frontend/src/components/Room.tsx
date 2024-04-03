import React, { useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const rtcOptions = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',

            ]
        },
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            urls: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            urls: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        },
        {
            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        }
    ]
}


export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {

    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [Socket, setSocket] = useState<Socket | null>(null);

    console.log(name, remoteAudioTrack, remoteVideoTrack, remoteVideoRef, sendingPc, receivingPc, Socket)

    function getCallInit() {

        // disconnect first
        setSendingPc((pc) => {
            if (pc) {
                pc.close();
            }
            return pc;
        })
        setReceivingPc((pc) => {
            if (pc) {
                pc.close();
            }
            return pc;
        });
        setRemoteAudioTrack(null);
        setRemoteVideoTrack(null);

        const socket = io('https://omegle-backend.jaik.co.in/', {
            rejectUnauthorized: false,
        });

        socket.on('call-initiated', ({ roomId }) => {
            console.log("Call initiated with ", roomId);

            const pc = new RTCPeerConnection(rtcOptions);
            setSendingPc(pc);
            /// build peerConnection 
            //  offerCreate 
            //  initialize all the listner (onicecandidates , onnegoneeded )
            // add Stream to peerConnection 
            if (localAudioTrack) {
                console.log('added audio track');
                pc.addTrack(localAudioTrack);
            }
            if (localVideoTrack) {
                console.log("added video track");
                pc.addTrack(localVideoTrack);
            }

            pc.onicecandidate = async (e) => {
                console.log('got icecandidates', roomId);
                if (e.candidate) {
                    socket.emit('added-icecandidate', {
                        type: 'sender',
                        candidate: e.candidate,
                        roomId,
                    })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log('no negotiation offer created', roomId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(new RTCSessionDescription(offer));
                console.log('offer created', offer);
                socket.emit('offer', {
                    sdp: offer,
                    roomId
                })
            }
        })

        socket.on('offer', async ({ sdp, roomId }) => {

            // make peer connection
            // store offer in localdescription
            // create Answer and save it in remoteDescription and send it othr peer

            const pc = new RTCPeerConnection(rtcOptions);
            pc.onconnectionstatechange = async ()=>{
                     if(pc.connectionState === 'disconnected'){
                        pc.close();
                        getCallInit();
                     }
            }
            setReceivingPc(pc);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(new RTCSessionDescription(answer));
            console.log('createdAnswer for ', roomId);



            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = new MediaStream();

            }

            pc.onicecandidate = async (e) => {
                console.log('got icecandidates', roomId);
                if (e.candidate) {
                    socket.emit('added-icecandidate', {
                        type: 'receiver',
                        candidate: e.candidate,
                        roomId,
                    })
                }
            }

            // pc.ontrack = async (e) => {
            //     const { track, type } = e;
            //     console.log("from ontrack")
            //     if (type === 'audio') {
            //         setRemoteAudioTrack(track);
            //         // @ts-ignore
            //         remoteVideoRef.current.srcObject.addTrack(track);
            //     }
            //     else {
            //         setRemoteVideoTrack(track);
            //         // @ts-ignore
            //         remoteVideoRef.current.srcObject.addTrack(track);
            //     }
            // }
            // pc.addEventListener('track', async (e)=>{
            //     console.log("hi from ontrack !!");
            //     if(remoteVideoRef.current){
            //         remoteVideoRef.current.srcObject = new MediaStream(e.streams[0]);
            //     }
            // })

            socket.emit('answer', {
                sdp: answer,
                roomId
            })

            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                remoteVideoRef.current.srcObject.addTrack(track1)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                remoteVideoRef.current.play();

            }, 10000)


        })

        socket.on('answer', async ({ sdp, roomId }) => {
            console.log('handshake ended for ', roomId);
            setSendingPc((pc) => {
                pc?.setRemoteDescription(new RTCSessionDescription(sdp));
                return pc;
            })
            console.log(roomId);

        })

        socket.on('added-icecandidate', async ({ candidate, roomId, type }) => {
            console.log("from ice candidates", roomId);
            if (type === 'sender') {
                setReceivingPc(pc => {
                    pc?.addIceCandidate(candidate);

                    return pc;
                })
            }
            else {
                setSendingPc(pc => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            }
        })

        setSocket(socket);
    }

    useEffect(() => {

        getCallInit();

    }, []);

    useEffect(() => {

        if (localVideoTrack && localAudioTrack) {

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack, localAudioTrack]);
                localVideoRef.current.play();
            }

        }

    }, [localAudioTrack, localVideoTrack, localVideoRef]);

    return (
        <React.Fragment>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>

                <div>
                    <h1>LocalStream</h1>
                    <video src="" autoPlay ref={localVideoRef}></video>
                </div>
                <div>
                    <h1>RemoteStream</h1>
                    <video src="" autoPlay ref={remoteVideoRef}></video>
                </div>


            </div>
            <button onClick={() => { getCallInit() }}>Next</button>
        </React.Fragment>
    )

}