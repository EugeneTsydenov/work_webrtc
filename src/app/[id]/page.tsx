'use client'

import * as React from 'react';
import {useParams} from "next/navigation";
import {io, Socket} from "socket.io-client";

const MEDIA_CONSTRAINTS = {
  audio: true,
  video: { width: 1280, height: 720 },
}

const ICE_SERVERS = {
  iceServers:[
    {
      "urls": "stun:stun.kinesisvideo.ap-northeast-2.amazonaws.com:443"
    },
    {
      "urls": [
        "turn:52-78-139-153.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=udp",
        "turns:52-78-139-153.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=udp",
        "turns:52-78-139-153.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=tcp"
      ],
      "username": "1725892991:djE6YXJuOmF3czpraW5lc2lzdmlkZW86YXAtbm9ydGhlYXN0LTI6MTc1NjczMjE5Njg2OmNoYW5uZWwvS29yZWFuU2ltcGxlLVR1dG9yaW5nLzE3MjU1MzgyODMyNzU=",
      "credential": "y+0BmYEG53VMko977KvdkH26RBjebtuS1FO9mRYBFko="
    },
    {
      "urls": [
        "turn:43-203-254-165.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=udp",
        "turns:43-203-254-165.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=udp",
        "turns:43-203-254-165.t-cf94f1b5.kinesisvideo.ap-northeast-2.amazonaws.com:443?transport=tcp"
      ],
      "username": "1725892991:djE6YXJuOmF3czpraW5lc2lzdmlkZW86YXAtbm9ydGhlYXN0LTI6MTc1NjczMjE5Njg2OmNoYW5uZWwvS29yZWFuU2ltcGxlLVR1dG9yaW5nLzE3MjU1MzgyODMyNzU=",
      "credential": "+GV8OornFXMSVDj3JACtO0t0uOYwjM3ExzUNJafElYk="
    }
  ],
}

const onFullRoom = () => {
  console.log('Socket event callback: full_room')
  alert('The room is full, please try another one')
}

//https://dev.api.tutor.koreansimple.com

const Page = () => {
  const {id: roomId} = useParams<{id: string}>()

  const peerConnection = React.useRef<RTCPeerConnection | null>(null)
  const isRoomCreator = React.useRef<boolean>(false)
  const localStream = React.useRef<MediaStream | null>(null)
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const remoteStream = React.useRef<MediaStream | null>(null)
  const remoteVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const socket = React.useRef<Socket<any, any> | null>(null)

  const setLocalStream = async () => {
    try {
      if(localStream.current) {
        return;
      }
      localStream.current = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      if(localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current
      }
    } catch (e) {
      console.error('Could not get user media', e)
    }
  }

  const setRemoteStream = async (event: RTCTrackEvent) => {
      if(remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
      if(remoteStream.current) {
        remoteStream.current = event.streams[0]
      }
  }

  const addLocalTracks = () => {
    localStream.current?.getTracks().forEach((track) => {
      if(peerConnection.current && localStream.current) {
        peerConnection.current.addTrack(track, localStream.current)
      }
    })
  }

  const sendIceCandidate = React.useCallback((event:  RTCPeerConnectionIceEvent) => {
    if(event.candidate && socket.current) {
      socket.current.emit('iceCandidate', {roomId, label:event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate
      })
    }
  }, [roomId])

  const createOffer = React.useCallback(async () => {
    try {
      if(peerConnection.current) {
        const sdp = await peerConnection.current.createOffer()
        await peerConnection.current.setLocalDescription(sdp)
        if(socket.current) {
          socket.current.emit('offer', {
            sdp,
            roomId
          })
        }
      }
    } catch (e) {
      console.log('error offer', e)
    }
  }, [roomId])

  const createAnswer = React.useCallback(async () => {
    try {
      if(peerConnection.current) {
        const sdp = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(sdp)
        if(socket.current) {
          socket.current.emit('answer', {
            sdp, roomId
          })
        }
      }
    } catch (e) {
      console.log('error answer', e)
    }
  }, [roomId])

  const onRoomCreated = React.useCallback(async () => {
    console.log('Socket event callback: room_created')
    await setLocalStream()
    isRoomCreator.current = true
  }, [])

  const onRoomJoined = React.useCallback(async () => {
    console.log('Socket event callback: room_joined')
    await setLocalStream()
    if(socket.current) {
      socket.current.emit('startCall', roomId)
    }
  }, [socket, roomId])

  const onStartCall = React.useCallback(async () => {
    console.log('Socket event callback: start_call')
    if(isRoomCreator.current) {
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS)
      addLocalTracks()
      peerConnection.current.ontrack = setRemoteStream
      peerConnection.current.onicecandidate = sendIceCandidate
      await createOffer()
    }
  }, [createOffer, sendIceCandidate])

  const onOffer = React.useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if(!isRoomCreator.current) {
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS)
      addLocalTracks()
      peerConnection.current.ontrack = setRemoteStream
      peerConnection.current.onicecandidate = sendIceCandidate
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp))
      await createAnswer()
    }
  }, [createAnswer, sendIceCandidate])

  const onAnswer = React.useCallback(async (sdp: RTCSessionDescriptionInit) => {
    console.log('Socket event callback: webrtc_answer')
    if(peerConnection.current) {
      await peerConnection.current.setRemoteDescription(sdp)
    }
  }, [])

  const onIceCandidate = React.useCallback(async (data: { candidate: string, roomId: string, label: number }) => {
    const candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate:  data.candidate})
    if(peerConnection.current) {
      await peerConnection.current.addIceCandidate(candidate)
    }
  }, [])

  React.useEffect(() => {
    socket.current = io('https://dev.api.tutor.koreansimple.com/rtc', {transports: ['polling']}).connect()
  }, [])

  React.useEffect(() => {
    if(socket.current) {
      socket.current.emit('join', roomId)
    }
  }, [socket, roomId])

  React.useEffect(() => {
    const currentSocket = socket.current
    console.log(currentSocket)
    if (currentSocket) {
      currentSocket.on('roomCreated', onRoomCreated)
      currentSocket.on('roomJoined', onRoomJoined)
      currentSocket.on('fullRoom', onFullRoom)
      currentSocket.on('startCall', onStartCall)
      currentSocket.on('offer', onOffer)
      currentSocket.on('answer', onAnswer)
      currentSocket.on('iceCandidate', onIceCandidate)
    }

    return () => {
      if(currentSocket) {
        currentSocket.off('roomCreated', onRoomCreated)
        currentSocket.off('roomJoined', onRoomJoined)
        currentSocket.off('fullRoom', onFullRoom)
        currentSocket.off('startCall', onStartCall)
        currentSocket.off('offer', onOffer)
        currentSocket.off('answer', onAnswer)
        currentSocket.off('iceCandidate', onIceCandidate)
      }
    }
  }, [socket, onRoomCreated, onRoomJoined, onStartCall, onOffer, onAnswer, onIceCandidate])

  return (
    <div>
      <video ref={localVideoRef} muted autoPlay/>
      <video ref={remoteVideoRef} autoPlay/>
    </div>
  );
};

export default Page;
