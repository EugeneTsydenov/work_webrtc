import * as React from "react";

const Video = ({
  stream = null,
  muted = false,
  autoPlay = true,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  autoPlay?: boolean;
}) => {
  const ref = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} muted={muted} autoPlay={autoPlay} playsInline className="w-full rounded-[8px] h-full object-cover"/>;
};

export default Video;
