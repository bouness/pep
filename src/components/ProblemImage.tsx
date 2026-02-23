'use client';

import Image from 'next/image';
import { ProblemImage } from '@/types/problems';

interface ProblemImageDisplayProps {
  image: ProblemImage;
  className?: string;
}

/**
 * Display a problem image with optional caption
 * Supports both local paths and external URLs
 */
export function ProblemImageDisplay({ image, className = '' }: ProblemImageDisplayProps) {
  const isExternal = image.src.startsWith('http://') || image.src.startsWith('https://');
  
  // For external images, use regular img tag to avoid Next.js image optimization issues
  if (isExternal) {
    return (
      <figure className={`my-4 ${className}`}>
        <div className="border rounded-lg overflow-hidden bg-slate-50 p-2">
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="mx-auto max-w-full h-auto"
          />
        </div>
        {image.caption && (
          <figcaption className="text-center text-sm text-slate-500 mt-2 italic">
            {image.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // For local images, use Next.js Image component
  return (
    <figure className={`my-4 ${className}`}>
      <div className="border rounded-lg overflow-hidden bg-slate-50 p-2 flex justify-center">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width || 600}
          height={image.height || 400}
          className="max-w-full h-auto"
          unoptimized // Skip optimization for dynamic paths
        />
      </div>
      {image.caption && (
        <figcaption className="text-center text-sm text-slate-500 mt-2 italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default ProblemImageDisplay;