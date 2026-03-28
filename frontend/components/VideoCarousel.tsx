import React, { useState, useEffect, useRef } from 'react'

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
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const count = videos.length
  const angleStep = count > 0 ? 360 / Math.max(count, 5) : 72
  const radius = count <= 3 ? 280 : count <= 5 ? 340 : 400

  useEffect(() => {
    setRotation(-activeIndex * angleStep)
  }, [activeIndex, angleStep])

  function handlePrev() {
    setActiveIndex((prev) => (prev - 1 + count) % count)
  }

  function handleNext() {
    setActiveIndex((prev) => (prev + 1) % count)
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return
    const diff = e.clientX - startX
    if (Math.abs(diff) > 60) {
      if (diff > 0) handlePrev()
      else handleNext()
      setStartX(e.clientX)
    }
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  if (count === 0) return null

  return (
    <div className="relative w-full py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#2D2A26', fontFamily: 'serif' }}>
          Your Generated Content
        </h2>
        <p className="text-sm mt-2" style={{ color: '#8A8580' }}>
          Boost your brand with AI-generated UGC videos from your product catalog
        </p>
      </div>

      {/* 3D Carousel */}
      <div
        className="relative mx-auto select-none"
        style={{ height: 380, perspective: 1200 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        <div
          className="absolute w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {videos.map((video, i) => {
            const angle = i * angleStep
            const isActive = i === activeIndex

            return (
              <div
                key={video.id}
                className="absolute left-1/2 top-0"
                style={{
                  width: 180,
                  height: 320,
                  marginLeft: -90,
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="w-full h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer"
                  style={{
                    background: video.videoUrl ? '#000' : '#F5F0E8',
                    border: isActive ? '3px solid #D4826A' : '2px solid rgba(0,0,0,0.08)',
                    transform: isActive ? 'scale(1.08)' : 'scale(0.95)',
                    opacity: isActive ? 1 : 0.75,
                  }}
                  onClick={() => setActiveIndex(i)}
                >
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls={isActive}
                      muted={!isActive}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      style={{ borderRadius: 14 }}
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
                          className="px-3 py-1 text-xs font-medium rounded-full transition-all"
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

                {/* Label below card */}
                <div
                  className="text-center mt-2 transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <p className="text-sm font-medium" style={{ color: '#2D2A26' }}>
                    {video.productName}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 mt-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212, 130, 106, 0.15)', color: '#D4826A' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 mt-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212, 130, 106, 0.15)', color: '#D4826A' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Active video actions */}
      {videos[activeIndex] && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {videos[activeIndex].videoUrl && (
            <button
              onClick={() => onPublish(videos[activeIndex])}
              className="px-5 py-2 text-sm font-medium rounded-full transition-all hover:scale-105"
              style={{ background: '#D4826A', color: '#FFF' }}
            >
              Post to Socials
            </button>
          )}
          <a
            href={videos[activeIndex].bazaarUrl}
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
          {videos[activeIndex].videoUrl && (
            <button
              onClick={() => navigator.clipboard.writeText(videos[activeIndex].videoUrl)}
              className="px-4 py-2 text-sm rounded-full border transition-all hover:scale-105"
              style={{ borderColor: '#C4BFB6', color: '#8A8580' }}
            >
              Copy URL
            </button>
          )}
        </div>
      )}

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
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
