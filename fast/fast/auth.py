from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import firebase_admin
from firebase_admin import credentials, auth
import os

class KakaoCodeRequest(BaseModel):
    code: str

router = APIRouter(prefix="/auth")

# Initialize Firebase Admin SDK
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

@router.post("/kakao/token")
async def exchange_kakao_token(request: KakaoCodeRequest):
    try:
        # Exchange authorization code for Kakao access token
        token_response = requests.post(
            "https://kauth.kakao.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": os.environ.get("KAKAO_CLIENT_ID"),
                "client_secret": os.environ.get("KAKAO_CLIENT_SECRET"),
                "code": request.code,
                "redirect_uri": f"{os.environ.get('FRONTEND_URL')}/auth-callback"
            }
        )
        token_data = token_response.json()
        
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get Kakao access token")
        
        # Get user info from Kakao
        user_response = requests.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_data = user_response.json()
        
        # Create a custom token using Firebase Admin SDK
        kakao_id = f"kakao:{user_data['id']}"
        
        # Check if user exists, if not create one
        try:
            firebase_user = auth.get_user_by_uid(kakao_id)
        except auth.UserNotFoundError:
            # Create firebase user
            firebase_user = auth.create_user(
                uid=kakao_id,
                display_name=user_data.get('properties', {}).get('nickname', 'User'),
                photo_url=user_data.get('properties', {}).get('profile_image', None),
                email=user_data.get('kakao_account', {}).get('email', None)
            )
        
        # Create custom token
        custom_token = auth.create_custom_token(kakao_id)
        
        return {"customToken": custom_token.decode('utf-8')}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")
