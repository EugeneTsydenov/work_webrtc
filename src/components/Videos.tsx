'use client'

import * as React from 'react';
import RemoteVideo from "@/components/RemoteVideo";
import MyVideo from "@/components/MyVideo";
import {roomStore} from "@/store/room";
import {janusStore} from "@/store/janus";
import {observer} from "mobx-react-lite";
import {useParams} from "next/navigation";

const Videos = observer(() => {
  const isFirstMount = React.useRef(true)
  const isJoined = roomStore.isJoined
  const params = useParams<{id: string}>()

  const clear = () => {
    janusStore.mainHandle?.detach();
    janusStore.leave();
    roomStore.clearStreams();
  }

  React.useEffect(() => {
    if(!isJoined) {
      clear()
      return
    }

    janusStore.initJanus(() => {
      roomStore.room = Number(params.id)
      janusStore.joinToRoom(Number(params.id));
    });
  }, [isJoined, params.id]);

  React.useEffect(() => {
    return () => {
      if(!isFirstMount) {
        clear()
        return
      }
      isFirstMount.current = false
    }
  }, [isJoined])

  return (
    <div className='flex flex-col items-center gap-5'>
      <RemoteVideo/>
      <MyVideo/>
    </div>
  );
});

export default Videos;
