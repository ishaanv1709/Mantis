"use client";
import React from "react";

export function PixelatedCanvas({
  src,
  width,
  height,
  className
}: {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  cellSize?: number;
  dotScale?: number;
  shape?: string;
  backgroundColor?: string;
  dropoutStrength?: number;
  interactive?: boolean;
  distortionStrength?: number;
  distortionRadius?: number;
  distortionMode?: string;
  followSpeed?: number;
  jitterStrength?: number;
  jitterSpeed?: number;
  sampleAverage?: boolean;
  tintColor?: string;
  tintStrength?: number;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height, backgroundColor: "#000000" }}>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700" 
        style={{ backgroundImage: `url(${src})`, filter: "contrast(1.2) brightness(1.5)" }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      {/* Fallback pattern for pixelation effect since raw WebGL implementation is missing */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffff00 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.1 }} />
    </div>
  );
}
