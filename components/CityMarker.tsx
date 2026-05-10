// components/CityMarker.tsx
'use client'

import { motion } from 'framer-motion'

interface CityMarkerProps {
  city: {
    id: string
    name: string
    x: number
    y: number
    resources: number
    color: string
  }
  isHovered: boolean
  isSelected: boolean
  onHover: (id: string | null) => void
  onClick: (id: string | null) => void
}

export default function CityMarker({
  city,
  isHovered,
  isSelected,
  onHover,
  onClick
}: CityMarkerProps) {
  const size = isSelected ? 24 : isHovered ? 20 : 16
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${city.x}%`,
        top: `${city.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        scale: isSelected ? 1.5 : isHovered ? 1.2 : 1
      }}
      transition={{ type: 'spring', stiffness: 300 }}
      onMouseEnter={() => onHover(city.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(isSelected ? null : city.id)}
    >
      {/* 脉动光环 */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: city.color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* 主标记 */}
      <div
        className="relative rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: size,
          height: size,
          backgroundColor: city.color
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
      
      {/* 标签 */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: isHovered || isSelected ? 1 : 0,
          y: isHovered || isSelected ? 0 : -10
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
          <div className="font-semibold text-gray-900">{city.name}</div>
          <div className="text-xs text-gray-600">{city.resources}个资源</div>
        </div>
      </motion.div>
    </motion.div>
  )
}