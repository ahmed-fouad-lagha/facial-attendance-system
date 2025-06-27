'use client'

import { useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'
import { Camera, RotateCcw } from 'lucide-react'

interface CameraComponentProps {
  onCapture: (imageSrc: string) => void
  className?: string
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, className = '' }) => {
  const webcamRef = useRef<Webcam>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
    }
  }, [onCapture])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode
  }

  return (
    <div className={`relative ${className}`}>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-auto rounded-lg border-2 border-gray-300"
      />
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={capture}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
          type="button"
          aria-label="Capture photo"
        >
          <Camera size={24} />
        </button>
        
        <button
          onClick={switchCamera}
          className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-colors"
          type="button"
          aria-label="Switch camera"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  )
}

export default CameraComponent
