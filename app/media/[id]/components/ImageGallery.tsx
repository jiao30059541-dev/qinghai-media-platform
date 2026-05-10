'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

interface ImageGalleryProps {
  mediaId: number
  assets: any[]
  mediaName: string
}

export default function ImageGallery({ mediaId, assets, mediaName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // 如果没有素材，使用默认图片
  const images = assets.length > 0 
    ? assets.filter((asset: any) => asset.type === 'image').map((asset: any) => asset.url)
    : ['/placeholder.jpg']
  
  const currentImage = images[currentIndex]
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }
  
  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }
  
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* 主图区域 */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={currentImage}
          alt={`${mediaName} - 图片 ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* 导航按钮 */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all"
              aria-label="上一张图片"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all"
              aria-label="下一张图片"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* 全屏按钮 */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition-all"
          aria-label="全屏查看"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
        
        {/* 图片指示器 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`查看图片 ${index + 1}`}
            />
          ))}
        </div>
        
        {/* 图片计数器 */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* 缩略图列表 */}
      {images.length > 1 && (
        <div className="p-4 bg-gray-50">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}`}
              >
                <img
                  src={image}
                  alt={`缩略图 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
