import * as React from 'react';

interface VideoCardProps {
  children: React.ReactNode
}

const VideoCard = ({children}: VideoCardProps) => {
  return (
    <div className='w-[232px] h-[132px] rounded-[8px] bg-black flex items-center justify-center'>
      {children}
    </div>
  );
};

export default VideoCard;
