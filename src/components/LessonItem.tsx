'use client'

import * as React from 'react';
import {Lesson} from "@/components/LessonList";
import {useRouter} from "next/navigation";
import ChevronSvg from "@/components/ChevronSvg";
import {roomStore} from "@/store/room";

interface LessonItemProps {
  lesson: Lesson
}

const LessonItem = ({lesson}: LessonItemProps) => {
  const router = useRouter()

  const onClick = () => {
    roomStore.room = lesson.id
    router.push(`/lesson/${lesson.id}`)
  }

  return (
    <li>
      <button onClick={onClick} className='rounded-[20px] bg-[#3F2AFB] px-[16px] py-[12px] flex items-center gap-3'>
        <span className='font-bold text-[14px]'>Войти в класс</span>
        <ChevronSvg/>
      </button>
    </li>
  );
};

export default LessonItem;
