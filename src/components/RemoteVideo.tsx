import * as React from 'react';
import {roomStore} from "@/store/room";
import Video from "@/components/Video";
import {observer} from "mobx-react-lite";
import WaitingConnectionCard from "@/components/WaitingConnectionCard";
import VideoCard from "@/components/VideoCard";

const RemoteVideo = observer(() => {
  if(!roomStore.remoteStream || !roomStore.isJoined) {
    return <WaitingConnectionCard/>
  }


  return (
    <VideoCard>
      <Video stream={roomStore.remoteStream} autoPlay/>
    </VideoCard>
  );
});

export default RemoteVideo;

