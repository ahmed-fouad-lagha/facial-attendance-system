"""
DeepFace Detection Service for Facial Attendance System
FastAPI service providing face verification, liveness detection, and anti-spoofing
"""

import os
import io
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import face_recognition
from deepface import DeepFace
from PIL import Image
import tempfile
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DeepFace Detection Service",
    description="Face verification, liveness detection, and anti-spoofing service",
    version="1.0.0"
)

# Add CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for responses
class FaceAnalysis(BaseModel):
    face_detected: bool
    age: int
    gender: str
    emotion: str
    race: str
    confidence: float
    error: Optional[str] = None

class LivenessCheck(BaseModel):
    is_live: bool
    confidence: float
    reasons: List[str]
    quality_metrics: Optional[Dict[str, float]] = None

class VerificationResult(BaseModel):
    verified: bool
    confidence: float
    model_results: List[Dict[str, Any]]
    consensus: str
    error: Optional[str] = None

class AttendanceRecommendation(BaseModel):
    allow_checkin: bool
    reason: str
    confidence_level: str
    risk_level: str
    overall_confidence: Optional[float] = None
    liveness_reasons: Optional[List[str]] = None

class DeepFaceResponse(BaseModel):
    success: bool
    verification: VerificationResult
    liveness_check: LivenessCheck
    current_analysis: FaceAnalysis
    recommendation: AttendanceRecommendation
    timestamp: float

def image_file_to_array(image_file: UploadFile) -> np.ndarray:
    """Convert uploaded image file to numpy array"""
    try:
        # Read image data
        image_data = image_file.file.read()
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to numpy array
        image_array = np.array(pil_image)
        
        return image_array
    except Exception as e:
        logger.error(f"Error converting image file to array: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

def analyze_face_with_deepface(image_array: np.ndarray) -> FaceAnalysis:
    """Analyze face using DeepFace"""
    try:
        # Save image temporarily for DeepFace
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            tmp_path = tmp_file.name
            cv2.imwrite(tmp_path, cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR))
        
        try:
            # Analyze face
            analysis = DeepFace.analyze(
                img_path=tmp_path,
                actions=['age', 'gender', 'emotion', 'race'],
                enforce_detection=False
            )
            
            # Handle both list and dict responses
            if isinstance(analysis, list):
                analysis = analysis[0]
            
            return FaceAnalysis(
                face_detected=True,
                age=int(analysis.get('age', 0)),
                gender=analysis.get('dominant_gender', 'unknown'),
                emotion=analysis.get('dominant_emotion', 'unknown'),
                race=analysis.get('dominant_race', 'unknown'),
                confidence=0.8  # DeepFace doesn't provide overall confidence
            )
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"DeepFace analysis error: {e}")
        return FaceAnalysis(
            face_detected=False,
            age=0,
            gender="unknown",
            emotion="unknown",
            race="unknown",
            confidence=0.0,
            error=str(e)
        )

def perform_liveness_detection(image_array: np.ndarray) -> LivenessCheck:
    """Perform basic liveness detection using image quality metrics"""
    try:
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate quality metrics
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness_mean = np.mean(gray)
        brightness_std = np.std(gray)
        
        # Calculate edge density
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Calculate color variance
        color_variance = np.var(image_array)
        
        quality_metrics = {
            "sharpness": float(sharpness),
            "brightness_mean": float(brightness_mean),
            "brightness_std": float(brightness_std),
            "edge_density": float(edge_density),
            "color_variance": float(color_variance)
        }
        
        # Liveness decision logic
        reasons = []
        is_live = True
        confidence = 0.8
        
        # Check for basic quality indicators
        if sharpness < 100:
            reasons.append("Image appears blurry")
            confidence -= 0.2
        
        if brightness_mean < 50 or brightness_mean > 200:
            reasons.append("Poor lighting conditions")
            confidence -= 0.1
        
        if edge_density < 0.1:
            reasons.append("Low detail/texture in image")
            confidence -= 0.2
        
        if color_variance < 1000:
            reasons.append("Limited color variation (possible screen/photo)")
            confidence -= 0.3
            is_live = False
        
        # Ensure confidence is between 0 and 1
        confidence = max(0.0, min(1.0, confidence))
        
        if confidence < 0.5:
            is_live = False
        
        if not reasons:
            reasons.append("Good image quality detected")
        
        return LivenessCheck(
            is_live=is_live,
            confidence=confidence,
            reasons=reasons,
            quality_metrics=quality_metrics
        )
        
    except Exception as e:
        logger.error(f"Liveness detection error: {e}")
        return LivenessCheck(
            is_live=False,
            confidence=0.0,
            reasons=[f"Liveness check failed: {e}"]
        )

def verify_faces_with_deepface(registered_path: str, current_path: str) -> VerificationResult:
    """Verify faces using multiple DeepFace models"""
    models = ['VGG-Face', 'Facenet', 'OpenFace', 'DeepID']
    model_results = []
    verified_count = 0
    total_confidence = 0.0
    
    for model in models:
        try:
            result = DeepFace.verify(
                img1_path=registered_path,
                img2_path=current_path,
                model_name=model,
                enforce_detection=False
            )
            
            verified = result['verified']
            distance = result['distance']
            threshold = result['threshold']
            confidence = max(0, min(1, 1 - (distance / threshold)))
            
            model_results.append({
                "model": model,
                "verified": verified,
                "distance": distance,
                "threshold": threshold,
                "confidence": confidence
            })
            
            if verified:
                verified_count += 1
            total_confidence += confidence
            
        except Exception as e:
            logger.error(f"Error with model {model}: {e}")
            model_results.append({
                "model": model,
                "verified": False,
                "distance": 1.0,
                "threshold": 0.5,
                "confidence": 0.0,
                "error": str(e)
            })
    
    # Determine overall verification result
    avg_confidence = total_confidence / len(models) if models else 0.0
    verification_threshold = 0.5  # At least 50% of models must verify
    verified = (verified_count / len(models)) >= verification_threshold
    
    # Determine consensus
    if verified_count == len(models):
        consensus = "strong_match"
    elif verified_count >= len(models) * 0.7:
        consensus = "likely_match"
    elif verified_count >= len(models) * 0.3:
        consensus = "uncertain"
    else:
        consensus = "no_match"
    
    return VerificationResult(
        verified=verified,
        confidence=avg_confidence,
        model_results=model_results,
        consensus=consensus
    )

def generate_recommendation(
    verification: VerificationResult,
    liveness: LivenessCheck,
    analysis: FaceAnalysis
) -> AttendanceRecommendation:
    """Generate attendance recommendation based on all checks"""
    
    # Calculate overall confidence
    verification_weight = 0.6
    liveness_weight = 0.4
    
    overall_confidence = (
        verification.confidence * verification_weight +
        liveness.confidence * liveness_weight
    )
    
    # Determine confidence level
    if overall_confidence >= 0.8:
        confidence_level = "high"
    elif overall_confidence >= 0.6:
        confidence_level = "medium"
    elif overall_confidence >= 0.4:
        confidence_level = "low"
    elif overall_confidence >= 0.2:
        confidence_level = "very_low"
    else:
        confidence_level = "none"
    
    # Determine risk level
    if not liveness.is_live:
        risk_level = "high"
    elif verification.consensus == "no_match":
        risk_level = "high"
    elif overall_confidence < 0.5:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    # Make recommendation
    allow_checkin = (
        verification.verified and
        liveness.is_live and
        overall_confidence >= 0.5 and
        analysis.face_detected
    )
    
    # Generate reason
    if not analysis.face_detected:
        reason = "No face detected in the image"
    elif not verification.verified:
        reason = f"Face verification failed ({verification.consensus})"
    elif not liveness.is_live:
        reason = f"Liveness check failed: {', '.join(liveness.reasons)}"
    elif overall_confidence < 0.5:
        reason = f"Low confidence score ({overall_confidence:.1%})"
    else:
        reason = f"Verification successful (confidence: {overall_confidence:.1%})"
    
    return AttendanceRecommendation(
        allow_checkin=allow_checkin,
        reason=reason,
        confidence_level=confidence_level,
        risk_level=risk_level,
        overall_confidence=overall_confidence,
        liveness_reasons=liveness.reasons
    )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "DeepFace Detection Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test DeepFace import
        import deepface
        deepface_version = deepface.__version__
        
        return {
            "status": "healthy",
            "deepface_version": deepface_version,
            "available_models": ["VGG-Face", "Facenet", "OpenFace", "DeepID"],
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }

@app.post("/verify-attendance", response_model=DeepFaceResponse)
async def verify_attendance(
    registered_photo: UploadFile = File(..., description="Registered employee photo"),
    current_photo: UploadFile = File(..., description="Current check-in photo")
):
    """
    Complete verification workflow for attendance check-in
    Includes face verification, liveness detection, and attendance recommendation
    """
    try:
        timestamp = time.time()
        
        # Convert uploaded files to numpy arrays
        logger.info("Processing uploaded images...")
        current_array = image_file_to_array(current_photo)
        registered_array = image_file_to_array(registered_photo)
        
        # Analyze current photo with DeepFace
        logger.info("Analyzing current photo...")
        analysis = analyze_face_with_deepface(current_array)
        
        # Perform liveness detection
        logger.info("Performing liveness detection...")
        liveness = perform_liveness_detection(current_array)
        
        # Perform face verification
        logger.info("Performing face verification...")
        
        # Save temporary files for DeepFace verification
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_registered:
            cv2.imwrite(tmp_registered.name, cv2.cvtColor(registered_array, cv2.COLOR_RGB2BGR))
            registered_path = tmp_registered.name
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_current:
            cv2.imwrite(tmp_current.name, cv2.cvtColor(current_array, cv2.COLOR_RGB2BGR))
            current_path = tmp_current.name
        
        try:
            verification = verify_faces_with_deepface(registered_path, current_path)
        finally:
            # Clean up temporary files
            for path in [registered_path, current_path]:
                if os.path.exists(path):
                    os.unlink(path)
        
        # Generate recommendation
        logger.info("Generating attendance recommendation...")
        recommendation = generate_recommendation(verification, liveness, analysis)
        
        response = DeepFaceResponse(
            success=True,
            verification=verification,
            liveness_check=liveness,
            current_analysis=analysis,
            recommendation=recommendation,
            timestamp=timestamp
        )
        
        logger.info(f"Verification complete. Allow check-in: {recommendation.allow_checkin}")
        return response
        
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {e}")

@app.post("/analyze-face")
async def analyze_face_only(
    photo: UploadFile = File(..., description="Photo to analyze")
):
    """Analyze a single photo for face attributes"""
    try:
        image_array = image_file_to_array(photo)
        analysis = analyze_face_with_deepface(image_array)
        return {"success": True, "analysis": analysis, "timestamp": time.time()}
    except Exception as e:
        logger.error(f"Face analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {e}")

@app.post("/liveness-check")
async def liveness_check_only(
    photo: UploadFile = File(..., description="Photo to check for liveness")
):
    """Perform liveness detection on a single photo"""
    try:
        image_array = image_file_to_array(photo)
        liveness = perform_liveness_detection(image_array)
        return {"success": True, "liveness": liveness, "timestamp": time.time()}
    except Exception as e:
        logger.error(f"Liveness check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Liveness check failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
