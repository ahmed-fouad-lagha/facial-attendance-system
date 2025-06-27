'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CameraComponent from '@/components/CameraComponent'
import { createEmployee } from '@/lib/database'
import { uploadPhoto, dataURLtoFile } from '@/lib/utils'
import { testSupabaseConnection, testImageUpload } from '@/lib/test-supabase'
import { User, Mail, Camera, Save, Bug } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc)
    setShowCamera(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !capturedImage) {
      alert('Please fill all fields and capture a photo')
      return
    }

    setIsLoading(true)

    try {
      // Convert captured image to file
      const file = dataURLtoFile(capturedImage, `${formData.name}-photo.jpg`)
      
      // Upload photo
      const photoUrl = await uploadPhoto(file, 'employees')
      
      if (!photoUrl) {
        alert('Failed to upload photo')
        return
      }

      // Create employee record
      const employee = await createEmployee({
        name: formData.name,
        email: formData.email,
        photo_url: photoUrl
      })

      if (employee) {
        alert('Employee registered successfully!')
        router.push('/')
      } else {
        alert('Failed to register employee')
      }
    } catch (error) {
      console.error('Error registering employee:', error)
      alert('Failed to register employee')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugTest = async () => {
    console.log('Running Supabase debug tests...')
    const connectionTest = await testSupabaseConnection()
    if (connectionTest) {
      const uploadTest = await testImageUpload()
      if (uploadTest) {
        alert('All tests passed! Supabase is working correctly.')
      } else {
        alert('Connection test passed but upload test failed. Check console for details.')
      }
    } else {
      alert('Connection test failed. Check your Supabase configuration.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Employee Registration</h1>
            <button
              onClick={handleDebugTest}
              className="ml-auto px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
              type="button"
            >
              <Bug size={16} />
              Debug Test
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Photo Capture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Photo
              </label>
              
              {!showCamera && !capturedImage && (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Camera className="text-gray-400" size={48} />
                  <span className="text-gray-600">Click to open camera</span>
                </button>
              )}

              {showCamera && (
                <div className="space-y-4">
                  <CameraComponent onCapture={handleCapture} />
                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-4">
                  <Image
                    src={capturedImage}
                    alt="Captured employee"
                    width={400}
                    height={256}
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null)
                      setShowCamera(true)
                    }}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email || !capturedImage}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={20} />
                  Register Employee
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
