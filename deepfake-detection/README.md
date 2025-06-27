# DeepFace Detection Service

A Python FastAPI microservice for facial recognition, verification, and anti-spoofing detection using DeepFace.

## Overview

This service provides AI-powered facial analysis capabilities for the facial attendance system, including:

- **Face Verification**: Compare faces using multiple deep learning models
- **Liveness Detection**: Anti-spoofing measures to prevent photo/video attacks
- **Face Analysis**: Age, gender, emotion, and race detection
- **Quality Assessment**: Image quality metrics for verification confidence

## Features

- **Multiple Models**: Uses VGG-Face, Facenet, OpenFace, and DeepID for verification
- **Anti-Spoofing**: Quality-based liveness detection
- **RESTful API**: FastAPI with automatic documentation
- **CORS Support**: Configured for Next.js frontend integration
- **Health Monitoring**: Service health check endpoints

## Requirements

- Python 3.8 or higher
- Virtual environment (recommended)
- Sufficient RAM for ML models (minimum 4GB recommended)

## Installation

### 1. Create Virtual Environment

```bash
# Navigate to the deepfake-detection directory
cd deepfake-detection

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Install basic dependencies
pip install -r requirements.txt

# For full functionality, also install:
pip install face-recognition deepface tensorflow
```

### 3. Start the Service

```bash
python main.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/` - Basic service info
- **GET** `/health` - Detailed health check

### Face Verification
- **POST** `/verify-attendance` - Complete verification workflow
  - **Parameters**: 
    - `reference_image`: Employee's registered photo
    - `current_image`: Current check-in photo
  - **Returns**: Complete verification results with recommendation

### Individual Analysis
- **POST** `/analyze-face` - Analyze single photo for face attributes
- **POST** `/liveness-check` - Perform liveness detection only

## Response Format

```json
{
  "success": true,
  "verification": {
    "verified": true,
    "confidence": 0.85,
    "model_results": [...],
    "consensus": "strong_match"
  },
  "liveness_check": {
    "is_live": true,
    "confidence": 0.9,
    "reasons": ["Good image quality detected"],
    "quality_metrics": {...}
  },
  "current_analysis": {
    "face_detected": true,
    "age": 30,
    "gender": "Man",
    "emotion": "neutral",
    "race": "white",
    "confidence": 0.8
  },
  "recommendation": {
    "allow_checkin": true,
    "reason": "Verification successful",
    "confidence_level": "high",
    "risk_level": "low",
    "overall_confidence": 0.85
  },
  "timestamp": 1640995200.0
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Service host | `0.0.0.0` |
| `PORT` | Service port | `8000` |
| `LOG_LEVEL` | Logging level | `info` |

### CORS Configuration

The service is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

## Testing

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **API Documentation:**
   Visit `http://localhost:8000/docs` for interactive API documentation

### Integration Testing

The service integrates with the Next.js frontend at `http://localhost:3000`

## Performance Considerations

### Model Loading
- First request may take longer as models are loaded
- Subsequent requests are faster due to model caching
- Consider pre-warming models for production use

### Memory Usage
- DeepFace models require significant RAM
- Monitor memory usage in production
- Consider model optimization for resource-constrained environments

### Processing Time
- Verification typically takes 1-3 seconds per request
- Multiple model consensus improves accuracy but increases processing time
- Consider async processing for high-volume scenarios

## Troubleshooting

### Common Issues

1. **Import Errors:**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

2. **Model Download Issues:**
   ```bash
   # Models are downloaded automatically on first use
   # Ensure internet connection for initial setup
   # Models are cached in ~/.deepface/weights/
   ```

3. **Memory Issues:**
   ```bash
   # Reduce model usage or increase system RAM
   # Monitor with: pip install psutil
   ```

4. **CORS Errors:**
   ```bash
   # Check CORS configuration in main.py
   # Ensure frontend URL is in allowed origins
   ```

### Logging

The service provides detailed logging for debugging:
- Request/response logging
- Model performance metrics
- Error tracking and reporting

## Production Deployment

### Security Considerations

1. **Authentication**: Add API key authentication
2. **Rate Limiting**: Implement request rate limiting
3. **Input Validation**: Enhanced image validation
4. **HTTPS**: Use HTTPS in production
5. **Monitoring**: Add health monitoring and alerting

### Scaling

1. **Load Balancing**: Use multiple service instances
2. **Model Optimization**: Consider model quantization
3. **Caching**: Implement result caching for repeated requests
4. **Queue System**: Use async task queues for high volume

### Deployment Options

- **Docker**: Containerize the service
- **Cloud Services**: Deploy to AWS, GCP, or Azure
- **Kubernetes**: For container orchestration
- **Serverless**: Consider serverless deployment for scaling

## License

This service is part of the Facial Attendance System project and follows the same MIT license.

## Support

For issues and questions:
- Check the main project README
- Review the troubleshooting section
- Create an issue in the repository
