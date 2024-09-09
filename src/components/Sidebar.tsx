'use client'

import * as React from 'react';
import {observer} from "mobx-react-lite";
import {roomStore} from "@/store/room";
import JoinToLessonButton from "@/components/JoinToLessonButton";
import LeftFromLessonButton from "@/components/LeftFromLessonButton";
import Videos from "@/components/Videos";

const Sidebar = observer(() => {
  return (
    <div className='bg-white px-[20px] py-[24px] h-screen'>
      <Videos/>
      {
        roomStore.isJoined ? <LeftFromLessonButton/> : <JoinToLessonButton/>
      }
    </div>
  );
});

export default Sidebar;
