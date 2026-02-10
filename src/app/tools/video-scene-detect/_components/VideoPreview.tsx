'use client';

import { forwardRef } from 'react';

interface VideoPreviewProps {
  src: string;
}

export const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  ({ src }, ref) => {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <video
          ref={ref}
          src={src}
          controls
          className="w-full"
        />
      </div>
    );
  }
);
VideoPreview.displayName = 'VideoPreview';
