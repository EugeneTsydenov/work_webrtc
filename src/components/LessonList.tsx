import * as React from 'react';
import LessonItem from "@/components/LessonItem";

export interface Lesson {
  id: number;
}

const lessons: Lesson[] = [
  {id: 1234}
]

const LessonList = () => {
  return (
    <ul>
      {lessons.map(lesson => <LessonItem key={lesson.id} lesson={lesson}/>)}
    </ul>
  );
};

export default LessonList;
