import * as React from 'react';
import SquareSvg from "@/components/SquareSvg";
import {roomStore} from "@/store/room";

const LeftFromLessonButton = () => {
  const onClick = () => {
    roomStore.setIsJoined(false)
  }

  return (
    <button onClick={onClick} className='rounded-[20px] bg-[#3F2AFB] px-[16px] py-[12px] flex items-center gap-3'>
      <SquareSvg/>
    </button>
  );
};

export default LeftFromLessonButton;
