# Facial Attendance System

A modern facial recognition-based attendance system built with Next.js, TypeScript, Tailwind CSS, and Supabase, featuring AI-powered face verification using DeepFace.

![Facial Attendance System](https://img.shields.io/badge/Next.js-15.3.4-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-06B6D4) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)

## 🌟 Features

- **Employee Registration**: Register employees with camera photo capture
- **Face Verification**: AI-powered face recognition using DeepFace
- **Attendance Tracking**: Real-time attendance check-in with verification
- **Dashboard**: View today's attendance and analytics
- **Anti-Spoofing**: Liveness detection to prevent photo/video spoofing
- **Modern UI**: Responsive design with Tailwind CSS
- **Database Integration**: Secure data storage with Supabase
- **Photo Storage**: Cloud-based photo storage and management

## 🏗️ Architecture

The system consists of two main components:

1. **Frontend**: Next.js application with TypeScript and Tailwind CSS
2. **Backend**: Python FastAPI service with DeepFace for face verification

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  DeepFace API   │────│    Supabase     │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
│  Port: 3000     │    │  Port: 8000     │    │     Cloud       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before installing, ensure you have the following installed on your system:

- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **Python**: Version 3.8 or higher ([Download](https://python.org/))
- **Git**: For version control ([Download](https://git-scm.com/))
- **Supabase Account**: For database and storage ([Sign up](https://supabase.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd facial-attendance-system
```

### 2. Frontend Setup (Next.js)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your Supabase credentials in .env.local
```

### 3. Backend Setup (Python)

```bash
cd deepfake-detection

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Run the SQL scripts provided in `supabase-schema.sql`
3. Configure storage policies using `supabase-storage-fix.sql`
4. Update your `.env.local` with Supabase credentials

### 5. Run the Application

**Terminal 1 - Start the Backend:**
```bash
cd deepfake-detection
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📖 Detailed Installation Guide

### Frontend Installation

1. **Install Node.js Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # DeepFace Detection Service
   NEXT_PUBLIC_DEEPFACE_SERVICE_URL=http://localhost:8000
   ```

3. **Supabase Setup:**
   - Create a new project at [supabase.com](https://supabase.com/)
   - Go to Settings > API to get your URL and keys
   - Execute the SQL in `supabase-schema.sql` in the SQL editor
   - Configure storage policies using `supabase-storage-fix.sql`

### Backend Installation

1. **Create Python Virtual Environment:**
   ```bash
   cd deepfake-detection
   python -m venv venv
   ```

2. **Activate Virtual Environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Additional ML Libraries (Optional):**
   For full DeepFace functionality:
   ```bash
   pip install face-recognition deepface tensorflow
   ```

## 🖥️ Usage

### 1. Register Employees
- Navigate to http://localhost:3000
- Click "Register Employee"
- Fill in employee details (name, email)
- Take a photo using the camera
- Submit to save to database

### 2. Check-in Process
- Go to the check-in page
- Select an employee from the list
- Take a verification photo
- System will:
  - Verify face using DeepFace
  - Check for liveness (anti-spoofing)
  - Allow/deny check-in based on verification
  - Record attendance in database

### 3. View Dashboard
- See today's attendance records
- Monitor check-in activities
- View employee statistics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_DEEPFACE_SERVICE_URL` | DeepFace API URL | Yes |

### Database Schema

The system uses two main tables:

**employees**
- `id`: UUID primary key
- `name`: Employee name
- `email`: Employee email
- `photo_url`: URL to employee photo
- `created_at`: Timestamp

**attendance**
- `id`: UUID primary key
- `employee_id`: Foreign key to employees
- `check_in_time`: Check-in timestamp
- `photo_url`: URL to check-in photo
- `created_at`: Timestamp

## 🛠️ Development

### Project Structure

```
facial-attendance-system/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # React components
│   └── lib/                    # Utility functions and services
├── deepfake-detection/         # Python DeepFace service
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
├── public/                     # Static assets
├── supabase-schema.sql         # Database schema
└── README.md                   # This file
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend:**
- `python main.py` - Start FastAPI server
- `uvicorn main:app --reload` - Start with auto-reload

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Ensure all dependencies are installed: `npm install`
   - Check Python virtual environment is activated

2. **Supabase connection errors:**
   - Verify environment variables are set correctly
   - Check Supabase project status
   - Ensure SQL schema has been executed

3. **Camera not working:**
   - Use HTTPS or localhost (required for camera access)
   - Check browser permissions for camera access

4. **DeepFace service errors:**
   - Ensure Python virtual environment is activated
   - Check all Python dependencies are installed
   - Verify the service is running on port 8000

### Getting Help

1. Check the troubleshooting guides:
   - `SUPABASE_SETUP.md` - Database setup issues
   - `PHOTO_UPLOAD_TROUBLESHOOTING.md` - Photo upload problems

2. Review console logs in browser developer tools
3. Check terminal outputs for error messages

## 📚 Additional Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Photo Upload Troubleshooting](./PHOTO_UPLOAD_TROUBLESHOOTING.md)
- [DeepFace Service Documentation](./deepfake-detection/README.md)

## 🔒 Security Considerations

### For Production Use:

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use production-grade secret management
   - Rotate keys regularly

2. **Database Security:**
   - Configure proper RLS (Row Level Security) policies
   - Limit API key permissions
   - Use service role key only for server-side operations

3. **API Security:**
   - Add authentication to DeepFace service
   - Implement rate limiting
   - Use HTTPS in production

4. **Image Security:**
   - Validate image file types and sizes
   - Implement image processing safeguards
   - Consider image encryption for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [DeepFace](https://github.com/serengil/deepface) - Face recognition library
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the troubleshooting guides

---

**Made with ❤️ for modern attendance management**
