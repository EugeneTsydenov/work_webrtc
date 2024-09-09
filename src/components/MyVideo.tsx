import * as React from 'react';
import {observer} from "mobx-react-lite";
import Video from "@/components/Video";
import {roomStore} from "@/store/room";
import WaitingConnectionCard from "@/components/WaitingConnectionCard";
import VideoCard from "@/components/VideoCard";

const MyVideo = observer(() => {
  if(!roomStore.localStream || !roomStore.isJoined) {
    return <WaitingConnectionCard/>
  }


  return (
    <VideoCard>
      <Video stream={roomStore.localStream} muted autoPlay/>
    </VideoCard>
  );
});

export default MyVideo;
