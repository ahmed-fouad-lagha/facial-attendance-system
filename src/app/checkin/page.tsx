'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CameraComponent from '@/components/CameraComponent'
import { getEmployees, createAttendance } from '@/lib/database'
import { uploadPhoto, dataURLtoFile } from '@/lib/utils'
import { deepFaceService, DeepFaceResponse } from '@/lib/deepface-service'
import { Employee } from '@/lib/supabase'
import { Clock, Camera, CheckCircle, Users, Shield, AlertTriangle } from 'lucide-react'

export default function CheckInPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [step, setStep] = useState<'select' | 'camera' | 'confirm' | 'verifying'>('select')
  const [deepFaceResult, setDeepFaceResult] = useState<DeepFaceResponse | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    const employeeList = await getEmployees()
    setEmployees(employeeList)
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    setStep('camera')
    setShowCamera(true)
  }

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc)
    setShowCamera(false)
    setStep('verifying')
    setVerificationError(null)

    if (!selectedEmployee) return

    try {
      // Perform DeepFace verification
      const result = await deepFaceService.verifyAttendanceWithFiles(
        selectedEmployee.photo_url,
        imageSrc
      )
      
      setDeepFaceResult(result)
      setStep('confirm')
    } catch (error) {
      console.error('DeepFace verification failed:', error)
      setVerificationError('Face verification service is currently unavailable. Proceeding with basic check-in.')
      setStep('confirm')
    }
  }

  const handleCheckIn = async () => {
    if (!selectedEmployee || !capturedImage) {
      alert('Please select an employee and capture a photo')
      return
    }

    // Check if DeepFace verification passed (if it was performed)
    if (deepFaceResult && !deepFaceResult.recommendation.allow_checkin) {
      alert('Check-in denied: Face verification failed. Please try again or contact your administrator.')
      return
    }

    // If there was a verification error but no deepFaceResult, warn the user
    if (verificationError && !deepFaceResult) {
      const proceed = confirm(
        'Face verification service is unavailable. Do you want to proceed with basic check-in? ' +
        'Note: This bypass should only be used temporarily and may require manual verification later.'
      )
      if (!proceed) {
        return
      }
    }

    setIsLoading(true)

    try {
      // Convert captured image to file
      const file = dataURLtoFile(capturedImage, `${selectedEmployee.name}-checkin-${Date.now()}.jpg`)
      
      // Upload photo
      const photoUrl = await uploadPhoto(file, 'attendance')
      
      if (!photoUrl) {
        alert('Failed to upload photo')
        return
      }

      // Create attendance record
      const attendance = await createAttendance({
        employee_id: selectedEmployee.id,
        check_in_time: new Date().toISOString(),
        photo_url: photoUrl
      })

      if (attendance) {
        alert('Check-in successful!')
        router.push('/')
      } else {
        alert('Failed to record attendance')
      }
    } catch (error) {
      console.error('Error recording attendance:', error)
      alert('Failed to record attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setSelectedEmployee(null)
    setCapturedImage(null)
    setShowCamera(false)
    setStep('select')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Attendance Check-In</h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Users size={20} />
                <span className="ml-2">Select Employee</span>
              </div>
              <div className="w-6 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 'camera' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Camera size={20} />
                <span className="ml-2">Capture Photo</span>
              </div>
              <div className="w-6 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 'verifying' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Shield size={20} />
                <span className="ml-2">Verify Face</span>
              </div>
              <div className="w-6 h-px bg-gray-300"></div>
              <div className={`flex items-center ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CheckCircle size={20} />
                <span className="ml-2">Confirm</span>
              </div>
            </div>
          </div>

          {/* Step 1: Employee Selection */}
          {step === 'select' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Employee</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={employee.photo_url}
                        alt={employee.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {employees.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No employees registered yet.</p>
                  <button
                    onClick={() => router.push('/register')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register Employee
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Camera */}
          {step === 'camera' && selectedEmployee && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Take Photo for {selectedEmployee.name}
              </h2>
              
              {showCamera && (
                <div className="space-y-4">
                  <CameraComponent onCapture={handleCapture} />
                  <button
                    onClick={resetFlow}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2.5: Verification */}
          {step === 'verifying' && selectedEmployee && (
            <div className="text-center py-8">
              <Shield className="mx-auto text-blue-600 mb-4 animate-pulse" size={48} />
              <h2 className="text-xl font-semibold mb-2">Verifying Face with DeepFace</h2>
              <p className="text-gray-600 mb-4">
                Please wait while we verify your identity using advanced facial recognition...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedEmployee && capturedImage && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Confirm Check-In</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Employee Photo</h3>
                  <Image
                    src={selectedEmployee.photo_url}
                    alt={selectedEmployee.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Photo</h3>
                  <Image
                    src={capturedImage}
                    alt="Current capture"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Check-In Details</h3>
                <p><strong>Employee:</strong> {selectedEmployee.name}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
              </div>

              {/* DeepFace Verification Results */}
              {deepFaceResult && (
                <div className={`p-4 rounded-lg mb-6 border ${
                  deepFaceResult.recommendation.allow_checkin 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {deepFaceResult.recommendation.allow_checkin ? (
                      <Shield className="text-green-600" size={20} />
                    ) : (
                      <AlertTriangle className="text-red-600" size={20} />
                    )}
                    <h3 className="font-medium">
                      DeepFace Verification Results
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Face Verification:</span>
                      <span className={deepFaceResult.verification.verified ? 'text-green-600' : 'text-red-600'}>
                        {deepFaceResult.verification.verified ? '✓ Verified' : '✗ Failed'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Liveness Check:</span>
                      <span className={deepFaceResult.liveness_check.is_live ? 'text-green-600' : 'text-red-600'}>
                        {deepFaceResult.liveness_check.is_live ? '✓ Live Person' : '✗ Possible Spoof'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Overall Confidence:</span>
                      <span className={`font-medium ${
                        (deepFaceResult.recommendation.overall_confidence || 0) > 0.7 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {((deepFaceResult.recommendation.overall_confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <p className={`font-medium ${
                        deepFaceResult.recommendation.allow_checkin 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {deepFaceResult.recommendation.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verificationError && (
                <div className="p-4 rounded-lg mb-6 border bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <h3 className="font-medium text-yellow-800">Verification Service Warning</h3>
                  </div>
                  <p className="text-yellow-700 text-sm">{verificationError}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Check-In Details</h3>
                <p><strong>Employee:</strong> {selectedEmployee.name}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading || (deepFaceResult !== null && !deepFaceResult.recommendation.allow_checkin)}
                  className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    deepFaceResult && !deepFaceResult.recommendation.allow_checkin
                      ? 'bg-red-600 text-white cursor-not-allowed'
                      : isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : verificationError && !deepFaceResult
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : deepFaceResult && !deepFaceResult.recommendation.allow_checkin ? (
                    <>
                      <AlertTriangle size={20} />
                      Check-In Denied
                    </>
                  ) : verificationError && !deepFaceResult ? (
                    <>
                      <AlertTriangle size={20} />
                      Proceed Anyway
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Check-In
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetFlow}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {deepFaceResult && !deepFaceResult.recommendation.allow_checkin ? 'Try Again' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
