import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import logoImage from '../../resource/logo.png';
import ky from 'ky';
import { userAuth, setUserAuth } from '../store';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

const Login: Component = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = createSignal('');

  const handleKakaoLogin = async () => {
    try {
      // Use popup approach for easier integration
      // 1. First get authorization from Kakao
      const KAKAO_CLIENT_ID = 'YOUR_KAKAO_CLIENT_ID';
      const REDIRECT_URI = window.location.origin + '/auth-callback';
      
      // Store the current URL state for return after auth
      localStorage.setItem('authRedirect', window.location.pathname);
      
      // Redirect to Kakao login
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    } catch (error) {
      console.error('Failed to initiate Kakao login:', error);
      setErrorMessage('카카오 로그인을 시작하는 중 오류가 발생했습니다.');
    }
  };

  const handleNaverLogin = async () => {
    try {
      // Redirect to Naver OAuth authorization page
      window.location.href = '/api/auth/naver/login';
    } catch (error) {
      console.error('Failed to initiate Naver login:', error);
      setErrorMessage('네이버 로그인을 시작하는 중 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth authorization page
      window.location.href = '/api/auth/google/login';
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
      setErrorMessage('구글 로그인을 시작하는 중 오류가 발생했습니다.');
    }
  };

  const handleSkipLogin = () => {
    // For users who don't want to use any login method
    navigate('/');
  };

  return (
    <div class="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div class="bg-gray-800 rounded-lg p-8 flex flex-col shadow-lg">
        <div class="flex flex-col items-center text-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-36 w-auto mb-3"
          />
        </div>
        <div class="text-gray-200 text-xl text-center mb-2 font-sans">한국형 생존 대비 시뮬레이션</div>
        <div class="text-gray-400 text-sm text-center mb-6 font-sans">간편로그인만 지원됩니다.</div>
        
        <div class="flex justify-center gap-6 mb-8">
          {/* Kakao Login */}
          <button 
            onClick={handleKakaoLogin}
            class="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
            title="카카오 로그인"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="black">
              <path d="M12 3C7.03 3 3 6.14 3 10C3 12.08 4.16 13.94 6.02 15.15C5.94 15.4 5.71 16.5 5.42 17.13C5.03 17.93 6.2 18.48 6.88 17.95C7.38 17.58 8.37 16.85 9.04 16.37C10 16.78 11 17 12 17C16.97 17 21 13.86 21 10C21 6.14 16.97 3 12 3Z"/>
            </svg>
          </button>
          
          {/* Naver Login */}
          <button 
            onClick={handleNaverLogin}
            class="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition-colors" 
            title="네이버 로그인"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M16 8.5V15.5H13.2L10.8 11.8V15.5H8V8.5H10.7L13.2 12.2V8.5H16Z"/>
            </svg>
          </button>
          
          {/* Google Login */}
          <button 
            onClick={handleGoogleLogin}
            class="flex items-center justify-center w-14 h-14 rounded-full bg-white hover:bg-gray-200 transition-colors"
            title="구글 로그인"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
              <path d="M6.52 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6zm0 2.667c-.587 0-1.067-.48-1.067-1.067 0-.587.48-1.067 1.067-1.067.587 0 1.067.48 1.067 1.067 0 .587-.48 1.067-1.067 1.067z" fill="#EA4335"/>
              <path d="M6.52 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6z" fill="#EA4335"/>
              <path d="M17.707 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6zm0 2.667c-.587 0-1.067-.48-1.067-1.067 0-.587.48-1.067 1.067-1.067.587 0 1.067.48 1.067 1.067 0 .587-.48 1.067-1.067 1.067z" fill="#FBBC05"/>
              <path d="M17.707 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6z" fill="#FBBC05"/>
              <path d="M12.48 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6zm0 2.667c-.587 0-1.067-.48-1.067-1.067 0-.587.48-1.067 1.067-1.067.587 0 1.067.48 1.067 1.067 0 .587-.48 1.067-1.067 1.067z" fill="#4285F4"/>
              <path d="M12.48 7.467c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6z" fill="#4285F4"/>
              <path d="M6.52 12.533c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6zm0 2.667c-.587 0-1.067-.48-1.067-1.067 0-.587.48-1.067 1.067-1.067.587 0 1.067.48 1.067 1.067 0 .587-.48 1.067-1.067 1.067z" fill="#34A853"/>
              <path d="M6.52 12.533c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6z" fill="#34A853"/>
              <path d="M17.707 12.533c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6zm0 2.667c-.587 0-1.067-.48-1.067-1.067 0-.587.48-1.067 1.067-1.067.587 0 1.067.48 1.067 1.067 0 .587-.48 1.067-1.067 1.067z" fill="#EA4335"/>
              <path d="M17.707 12.533c-.84 0-1.6.733-1.6 1.6 0 .867.76 1.6 1.6 1.6.84 0 1.6-.733 1.6-1.6 0-.867-.76-1.6-1.6-1.6z" fill="#EA4335"/>
            </svg>
          </button>
        </div>
        
        <button
          class="w-full py-3 text-gray-300 font-medium rounded-lg bg-gray-700 hover:bg-gray-600 font-sans flex items-center justify-center transition-colors"
          onClick={handleSkipLogin}
        >
          <span class="text-sm">로그인 없이 계속하기</span>
        </button>
        
        {errorMessage() && (
          <div class="mt-4 text-red-500 text-center">{errorMessage()}</div>
        )}
      </div>
    </div>
  );
};

export default Login; 