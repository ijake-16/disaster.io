from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import firebase_admin
from firebase_admin import auth, credentials
import os
import httpx
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Define router with prefix
router = APIRouter(prefix="/auth")

class KakaoCodeRequest(BaseModel):
    code: str

# Initialize Firebase Admin
cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT", "path/to/your/firebase-service-account.json"))
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    # App already initialized
    pass

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
                    logger.info(f"Created new user: {firebase_user.uid}")
                
                # Generate custom token
                custom_token = auth.create_custom_token(firebase_user.uid)
                logger.info("Generated custom token successfully")
                
                return JSONResponse({
                    "token": custom_token.decode(),
                    "user": {
                        "uid": firebase_user.uid,
                        "email": firebase_user.email,
                        "display_name": firebase_user.display_name
                    }
                })
            except Exception as e:
                logger.error(f"Firebase error: {str(e)}")
                raise
            
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
