import React, { useState, useEffect, useCallback } from 'react'

interface VideoItem {
  id: string
  projectId: string
  productName: string
  videoUrl: string
  bazaarUrl: string
  cost: number
  createdAt: string
}

interface VideoCarouselProps {
  videos: VideoItem[]
  onPublish: (video: VideoItem) => void
  onExport: (video: VideoItem) => void
  exportingId: string | null
}

export default function VideoCarousel({ videos, onPublish, onExport, exportingId }: VideoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const count = videos.length

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % (count || 1))
  }, [count])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + (count || 1)) % (count || 1))
  }, [count])

  // Auto-advance every 3 seconds (clockwise = next)
  useEffect(() => {
    if (paused || count === 0) return
    const interval = setInterval(handleNext, 3000)
    return () => clearInterval(interval)
  }, [paused, count, handleNext])

  if (count === 0) return null

  // Get offset from active index, wrapping around
  function getOffset(i: number): number {
    let diff = i - activeIndex
    // Wrap around for shortest path
    if (diff > count / 2) diff -= count
    if (diff < -count / 2) diff += count
    return diff
  }

  const activeVideo = videos[activeIndex]

  return (
    <div
      className="relative w-full py-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: '#2D2A26' }}>
          Your Generated Content
        </h2>
        <p className="text-sm mt-2" style={{ color: '#8A8580' }}>
          Boost your brand with AI-generated UGC videos
        </p>
      </div>

      {/* Carousel container */}
      <div className="relative mx-auto select-none" style={{ height: 380, perspective: 1000 }}>
        <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          {videos.map((video, i) => {
            const offset = getOffset(i)

            // Only render cards within visible range
            if (Math.abs(offset) > 3) return null

            const xOffset = offset * 155
            const zOffset = -Math.abs(offset) * 70
            const rotateY = offset * 22
            const scale = offset === 0 ? 1 : Math.max(0.68, 1 - Math.abs(offset) * 0.13)
            const opacity = offset === 0 ? 1 : Math.max(0.35, 1 - Math.abs(offset) * 0.22)
            const isActive = offset === 0

            return (
              <div
                key={video.id}
                className="absolute transition-all duration-700 ease-out cursor-pointer"
                style={{
                  width: 200,
                  height: 356,
                  left: '50%',
                  top: 0,
                  marginLeft: -100,
                  transform: `translateX(${xOffset}px) translateZ(${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex: 10 - Math.abs(offset),
                }}
                onClick={() => {
                  setActiveIndex(i)
                  setPaused(true)
                }}
              >
                <div
                  className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    background: video.videoUrl ? '#000' : '#EDE8E0',
                    border: isActive ? '3px solid #D4826A' : '2px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls={isActive}
                      muted={!isActive}
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="15" stroke="#D4826A" strokeWidth="1.5" strokeDasharray="4 3" />
                        <path d="M13 12v8l7-4-7-4z" fill="#D4826A" />
                      </svg>
                      <span className="text-xs" style={{ color: '#8A8580' }}>Not exported</span>
                      {isActive && (
                        <button
                          disabled={exportingId === video.projectId}
                          onClick={(e) => { e.stopPropagation(); onExport(video) }}
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{
                            background: '#D4826A',
                            color: '#FFF',
                            opacity: exportingId === video.projectId ? 0.5 : 1,
                          }}
                        >
                          {exportingId === video.projectId ? 'Exporting...' : 'Export'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => { handlePrev(); setPaused(true) }}
        className="absolute left-6 top-1/2 mt-8 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212, 130, 106, 0.15)', color: '#D4826A' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={() => { handleNext(); setPaused(true) }}
        className="absolute right-6 top-1/2 mt-8 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212, 130, 106, 0.15)', color: '#D4826A' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Active video label */}
      {activeVideo && (
        <div className="text-center mt-6">
          <p className="text-base font-medium" style={{ color: '#2D2A26' }}>
            {activeVideo.productName}
          </p>
        </div>
      )}

      {/* Action buttons */}
      {activeVideo && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {activeVideo.videoUrl && (
            <button
              onClick={() => onPublish(activeVideo)}
              className="px-5 py-2 text-sm font-medium rounded-full transition-all hover:scale-105"
              style={{ background: '#D4826A', color: '#FFF' }}
            >
              Post to Socials
            </button>
          )}
          <a
            href={activeVideo.bazaarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm rounded-full border transition-all hover:scale-105 inline-flex items-center gap-1.5"
            style={{ borderColor: '#D4826A', color: '#D4826A' }}
          >
            Edit in Bazaar
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5h5v5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {activeVideo.videoUrl && (
            <button
              onClick={() => navigator.clipboard.writeText(activeVideo.videoUrl)}
              className="px-4 py-2 text-sm rounded-full border transition-all hover:scale-105"
              style={{ borderColor: '#C4BFB6', color: '#8A8580' }}
            >
              Copy URL
            </button>
          )}
        </div>
      )}

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setPaused(true) }}
            className="rounded-full transition-all"
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              background: i === activeIndex ? '#D4826A' : '#D4826A40',
            }}
          />
        ))}
      </div>
    </div>
  )
}
