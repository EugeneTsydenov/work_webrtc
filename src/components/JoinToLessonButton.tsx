'use client'

import * as React from 'react';
import PlaySvg from "@/components/PlaySvg";
import {roomStore} from "@/store/room";

const JoinToLessonButton = () => {

  const onClick = () => {
    roomStore.setIsJoined(true)
  }

  return (
    <button onClick={onClick} className='rounded-[20px] bg-[#3F2AFB] px-[16px] py-[12px] flex items-center gap-3'>
      <PlaySvg/>
    </button>
  );
};

export default JoinToLessonButton;
