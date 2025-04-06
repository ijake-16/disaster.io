from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
import httpx
from typing import Optional, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv
import logging
import json
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Define router with prefix
router = APIRouter(prefix="/auth")

class KakaoCodeRequest(BaseModel):
    code: str

class CertificationRequest(BaseModel):
    userId: str
    name: str = None
    organization: str
    phoneNumber: str
    email: str
    remarks: str = ""

class MasterPromotionRequest(BaseModel):
    userId: str
    secret_key: str

# Initialize Firebase Admin
firebase_service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
try:
    # Simply use the service account path
    logger.info(f"Initializing Firebase with service account from: {firebase_service_account}")
    cred = credentials.Certificate(firebase_service_account)
    
    # Initialize Firebase
    firebase_app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase and Firestore initialized successfully")
except ValueError as e:
    # App already initialized
    logger.warning(f"Firebase initialization warning: {str(e)}")
    try:
        firebase_app = firebase_admin.get_app()
        db = firestore.client()
        logger.info("Firebase app already initialized, using existing app")
    except Exception as e:
        logger.error(f"Failed to get existing Firebase app: {str(e)}")
        raise
except Exception as e:
    logger.error(f"Firebase initialization error: {str(e)}")
    raise

# User helper methods for Firestore
def save_certification_request(request_data: Dict[str, Any]) -> str:
    """Save certification request to Firestore and return the document ID"""
    # Add request to Firestore with auto-generated ID
    request_ref = db.collection('certification_requests').document(request_data['userId'])
    request_ref.set({
        **request_data,
        'status': 'pending',
        'requestDate': firestore.SERVER_TIMESTAMP,
    })
    return request_data['userId']

def get_certification_requests(status: Optional[str] = None) -> list:
    """Get certification requests, optionally filtered by status"""
    requests_ref = db.collection('certification_requests')
    
    # Filter by status if provided
    if status:
        requests_ref = requests_ref.where('status', '==', status)
    
    # Get the documents
    requests = requests_ref.get()
    
    # Convert to list of dictionaries
    result = []
    for request in requests:
        data = request.to_dict()
        data['id'] = request.id
        result.append(data)
    
    return result

def update_certification_status(user_id: str, status: str, approver_id: Optional[str] = None) -> bool:
    """Update certification request status in Firestore"""
    request_ref = db.collection('certification_requests').document(user_id)
    
    update_data = {
        'status': status,
        f'{status}At': firestore.SERVER_TIMESTAMP,
    }
    
    if approver_id:
        update_data['approverId'] = approver_id
    
    request_ref.update(update_data)
    return True

@router.post("/kakao/token")
async def kakao_token(request: KakaoCodeRequest):
    try:
        logger.info(f"Received code: {request.code}")
        
        # Log environment variables (without sensitive values)
        logger.info(f"KAKAO_CLIENT_ID set: {'Yes' if os.getenv('KAKAO_CLIENT_ID') else 'No'}")
        logger.info(f"KAKAO_REDIRECT_URI: {os.getenv('KAKAO_REDIRECT_URI')}")
        
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_payload = {
                "grant_type": "authorization_code",
                "client_id": os.getenv("KAKAO_CLIENT_ID"),
                "redirect_uri": os.getenv("KAKAO_REDIRECT_URI"),
                "code": request.code
            }
            logger.info(f"Token request payload: {token_payload}")
            
            token_response = await client.post(
                "https://kauth.kakao.com/oauth/token",
                data=token_payload
            )
            
            if token_response.status_code != 200:
                logger.error(f"Kakao token error: {token_response.status_code} - {token_response.text}")
                return JSONResponse(
                    status_code=400, 
                    content={"error": "Failed to get token from Kakao", "details": token_response.text}
                )
                
            token_data = token_response.json()
            logger.info("Successfully obtained Kakao token")
            
            # Get user info from Kakao
            user_response = await client.get(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            
            if user_response.status_code != 200:
                logger.error(f"Kakao user info error: {user_response.status_code} - {user_response.text}")
                return JSONResponse(
                    status_code=400, 
                    content={"error": "Failed to get user info from Kakao", "details": user_response.text}
                )
                
            user_data = user_response.json()
            logger.info(f"User data received: {user_data.keys()}")
            
            # Create or get Firebase user
            try:
                kakao_id = f"kakao:{user_data['id']}"
                logger.info(f"Looking for existing user with ID: {kakao_id}")
                
                try:
                    firebase_user = auth.get_user(uid=kakao_id)
                    logger.info(f"Found existing user: {firebase_user.uid}")
                    
                    # Check if this user has role claims already
                    user_record = auth.get_user(kakao_id)
                    custom_claims = user_record.custom_claims or {}
                    role = custom_claims.get('role', 'user')
                    
                    # Get certification status if it exists
                    certification_doc = db.collection('certification_requests').document(kakao_id).get()
                    certification_status = None
                    certification_requested = False
                    
                    if certification_doc.exists:
                        certification_data = certification_doc.to_dict()
                        certification_status = certification_data.get('status')
                        certification_requested = certification_status == 'pending'
                    
                except auth.UserNotFoundError:
                    logger.info("User not found, creating new user")
                    
                    # Get profile info safely
                    email = user_data.get('kakao_account', {}).get('email')
                    display_name = user_data.get('properties', {}).get('nickname')
                    logger.info(f"Creating user with email: {email}, name: {display_name}")
                    
                    firebase_user = auth.create_user(
                        uid=kakao_id,
                        email=email,
                        display_name=display_name
                    )
                    
                    # New users have no role or certification status
                    custom_claims = {}
                    role = 'user'
                    certification_status = None
                    certification_requested = False
                    
                    logger.info(f"Created new user: {firebase_user.uid}")
                
                # Generate custom token
                custom_token = auth.create_custom_token(firebase_user.uid)
                logger.info("Generated custom token successfully")
                
                # Force refresh the custom claims
                if custom_claims and 'role' in custom_claims:
                    logger.info(f"User has role: {role}")
                
                return JSONResponse({
                    "token": custom_token.decode(),
                    "user": {
                        "uid": firebase_user.uid,
                        "email": firebase_user.email,
                        "display_name": firebase_user.display_name,
                        "role": role,
                        "certificationRequested": certification_requested,
                        "certificationStatus": certification_status,
                        "custom_claims": custom_claims
                    }
                })
            except Exception as e:
                logger.error(f"Firebase error: {str(e)}")
                raise
            
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/request-certification")
async def request_certification(request: CertificationRequest):
    try:
        logger.info(f"Certification request received for user: {request.userId}")
        logger.info(f"Request details: {request.dict()}")
        
        # Save to Firestore
        request_data = request.dict()
        doc_id = save_certification_request(request_data)
        logger.info(f"Certification request saved with ID: {doc_id}")
        
        # For a real app, you might want to send a notification to admin users
        # e.g., using Firebase Cloud Messaging or another notification system
        
        return JSONResponse({
            "success": True,
            "message": "Certification request received. Awaiting approval.",
            "id": doc_id
        })
        
    except Exception as e:
        logger.error(f"Certification request error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/certification-requests")
async def get_certification_requests_endpoint(status: Optional[str] = None):
    try:
        logger.info(f"Getting certification requests with status: {status}")
        
        # Get requests from Firestore
        requests = get_certification_requests(status)
        logger.info(f"Found {len(requests)} certification requests")
        
        return JSONResponse({
            "success": True,
            "requests": requests
        })
        
    except Exception as e:
        logger.error(f"Error getting certification requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/approve-certification")
async def approve_certification(request: CertificationRequest):
    try:
        # This endpoint would be called by master users to approve certification
        logger.info(f"Approving certification for user: {request.userId}")
        
        # Update request status in Firestore
        update_certification_status(request.userId, 'approved')
        
        # Set custom claims for the user
        auth.set_custom_user_claims(request.userId, {
            "role": "authorized_host"
        })
        
        logger.info(f"User {request.userId} has been authorized as a host")
        
        return JSONResponse({
            "success": True,
            "message": f"User {request.userId} has been authorized as a host."
        })
        
    except Exception as e:
        logger.error(f"Certification approval error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reject-certification")
async def reject_certification(request: CertificationRequest):
    try:
        # This endpoint would be called by master users to reject certification
        logger.info(f"Rejecting certification for user: {request.userId}")
        
        # Update request status in Firestore
        update_certification_status(request.userId, 'rejected')
        
        return JSONResponse({
            "success": True,
            "message": f"Certification request for user {request.userId} has been rejected."
        })
        
    except Exception as e:
        logger.error(f"Certification rejection error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user-profile")
async def get_user_profile(request: Request):
    try:
        # Get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("No valid authorization header provided")
            raise HTTPException(
                status_code=401, 
                detail="No valid authorization header provided"
            )
        
        # Extract the token
        token = auth_header.split(' ')[1]
        
        # Verify the Firebase ID token
        try:
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token['uid']
            logger.info(f"User authenticated: {user_id}")
            
            # Get user from Firebase
            user = auth.get_user(user_id)
            
            # Check if user has custom claims
            custom_claims = decoded_token.get('claims', {})
            role = custom_claims.get('role', 'user')
            
            # Check certification status
            certification_requested = False
            
            # Check if there are any pending certification requests for this user
            certification_requests = db.collection('certification_requests').where('userId', '==', user_id).where('status', '==', 'pending').limit(1).get()
            
            if len(certification_requests) > 0:
                certification_requested = True
                logger.info(f"User {user_id} has a pending certification request")
            
            return JSONResponse({
                "success": True,
                "user": {
                    "uid": user_id,
                    "email": user.email,
                    "displayName": user.display_name,
                    "role": role,
                    "certificationRequested": certification_requested
                }
            })
            
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail=f"Invalid authentication token: {str(e)}"
            )
    
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user profile: {str(e)}"
        )

@router.post("/promote-to-master")
async def promote_to_master(request: MasterPromotionRequest):
    try:
        # Verify the secret key
        expected_key = os.getenv("MASTER_PROMOTION_KEY", "admin_secret_key")
        if request.secret_key != expected_key:
            logger.error(f"Invalid secret key used in master promotion attempt for user: {request.userId}")
            raise HTTPException(
                status_code=403,
                detail="Invalid secret key"
            )
        
        logger.info(f"Promoting user to master: {request.userId}")
        
        # Set custom claims for the user to make them a master
        auth.set_custom_user_claims(request.userId, {
            "role": "master"
        })
        
        # If the user has a certification request, update it to approved
        try:
            cert_ref = db.collection('certification_requests').document(request.userId)
            cert_doc = cert_ref.get()
            
            if cert_doc.exists:
                cert_ref.update({
                    'status': 'approved',
                    'approvedAt': firestore.SERVER_TIMESTAMP,
                    'notes': 'Promoted to master via admin endpoint'
                })
                logger.info(f"Updated certification request for user {request.userId}")
            else:
                logger.info(f"No certification request found for user {request.userId}")
        except Exception as e:
            logger.warning(f"Error updating certification request: {str(e)}")
        
        logger.info(f"User {request.userId} has been promoted to master")
        
        return JSONResponse({
            "success": True,
            "message": f"User {request.userId} has been promoted to master role"
        })
        
    except Exception as e:
        logger.error(f"Error promoting user to master: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-role/{user_id}")
async def check_user_role(user_id: str):
    try:
        # Get the user from Firebase
        user = auth.get_user(user_id)
        
        # Get custom claims (this returns the full claims object)
        user_record = auth.get_user(user_id)
        custom_claims = user_record.custom_claims or {}
        
        # Return all relevant information
        return JSONResponse({
            "success": True,
            "user": {
                "uid": user.uid,
                "email": user.email,
                "display_name": user.display_name,
                "custom_claims": custom_claims,
                "role": custom_claims.get("role", "user")
            }
        })
    except Exception as e:
        logger.error(f"Error checking user role: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
