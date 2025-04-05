import { Component, onMount } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { setUserAuth } from '../store';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';
import ky from 'ky';

const AuthCallback: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  onMount(async () => {
    try {
      // Get the authorization code from URL
      const code = searchParams.code;
      
      if (!code) {
        throw new Error('No authorization code received');
      }
      
      // Exchange code for Firebase custom token
      const response = await ky.post('/api/auth/kakao/token', {
        json: { code }
      }).json<{ customToken: string }>();
      
      // Sign in to Firebase with the custom token
      const userCredential = await signInWithCustomToken(auth, response.customToken);
      const user = userCredential.user;
      
      // Update application state
      setUserAuth({
        isAuthenticated: true,
        provider: 'kakao',
        userId: user.uid,
        name: user.displayName || 'User',
        profileImage: user.photoURL || null
      });
      
      // Redirect back to the original page or home
      const redirectPath = localStorage.getItem('authRedirect') || '/';
      localStorage.removeItem('authRedirect');
      navigate(redirectPath);
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/login', { state: { error: 'Authentication failed' } });
    }
  });
  
  return (
    <div class="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div class="text-center">
        <div class="animate-spin h-10 w-10 border-4 border-t-transparent border-orange-400 rounded-full mx-auto mb-4"></div>
        <p>로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
