import { Component, onMount } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { setUserAuth, userAuth } from '../store';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';
import ky from 'ky';

interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string | null;
    display_name: string | null;
    role: 'user' | 'authorized_host' | 'master' | null;
    certificationRequested: boolean;
    certificationStatus: string | null;
  };
}

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
      
      console.log('Auth callback received with code:', code);
      
      // Exchange code for Firebase custom token
      const response = await ky.post('/api/auth/kakao/token', {
        json: { code },
        timeout: 10000
      }).json<AuthResponse>();
      
      console.log('Authentication successful, response:', response);
      
      // Sign in to Firebase with the custom token
      const userCredential = await signInWithCustomToken(auth, response.token);
      const user = userCredential.user;
      
      console.log('Firebase sign-in successful:', user);
      
      // Update application state with role information from the backend
      setUserAuth({
        isAuthenticated: true,
        provider: 'kakao',
        userId: user.uid,
        name: user.displayName || 'User',
        profileImage: user.photoURL || null,
        role: response.user.role || 'user', 
        certificationRequested: response.user.certificationRequested || false
      });
      
      console.log('Updated auth state with role information:', userAuth());
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Redirecting to host-profile, auth state:', userAuth());
      
      // Redirect to host profile
      navigate('/host-profile');
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
