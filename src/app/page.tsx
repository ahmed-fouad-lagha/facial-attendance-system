'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getTodayAttendance } from '@/lib/database'
import { Attendance, Employee } from '@/lib/supabase'
import { UserPlus, Clock, Users, Calendar } from 'lucide-react'

export default function Home() {
  const [todayAttendance, setTodayAttendance] = useState<(Attendance & { employee: Employee })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTodayAttendance()
  }, [])

  const loadTodayAttendance = async () => {
    setIsLoading(true)
    const attendance = await getTodayAttendance()
    setTodayAttendance(attendance)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Facial Attendance System
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/register">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Register Employee</h2>
                  <p className="text-gray-600">Add new employees to the system</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/checkin">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Check-In</h2>
                  <p className="text-gray-600">Record employee attendance</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-gray-700" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Attendance</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : todayAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Photo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={record.employee.photo_url}
                            alt={record.employee.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{record.employee.name}</p>
                            <p className="text-sm text-gray-600">{record.employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Image
                          src={record.photo_url}
                          alt="Check-in photo"
                          width={60}
                          height={40}
                          className="w-15 h-10 rounded object-cover"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">
                          {new Date(record.check_in_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No attendance records for today yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
