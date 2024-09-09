import * as React from 'react';
import Sidebar from "@/components/Sidebar";

const Page = () => {
  return (
    <div className='w-full h-full grid grid-cols-[1fr_280px] gap-4'>
      <div className='w-full h-full flex items-center justify-center text-black'>Здесь будет урок</div>
      <Sidebar/>
    </div>
  )
};

export default Page;
