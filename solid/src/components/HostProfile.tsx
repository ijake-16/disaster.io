import { Component, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { userAuth, setUserAuth } from '../store';
import { auth } from '../firebase';

const HostProfile: Component = () => {
  const navigate = useNavigate();

  // Add debugging
  console.log('HostProfile rendering, auth state:', userAuth());

  // Redirect if not authenticated
  createEffect(() => {
    const currentAuth = userAuth();
    console.log('Auth state in effect:', currentAuth);
    
    if (!currentAuth.isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
    }
  });

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserAuth({
        isAuthenticated: false,
        provider: null,
        userId: null,
        name: null,
        profileImage: null,
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-lg">
        <h1 class="text-2xl font-bold mb-6 text-center">호스트 프로필</h1>
        
        <div class="mb-6">
          {userAuth().profileImage && (
            <div class="flex justify-center mb-4">
              <img 
                src={userAuth().profileImage || ''} 
                alt="Profile" 
                class="w-24 h-24 rounded-full object-cover border-2 border-orange-400"
              />
            </div>
          )}
          
          <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <p class="text-gray-400 text-sm mb-1">이름</p>
            <p class="text-lg">{userAuth().name || '이름 없음'}</p>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <p class="text-gray-400 text-sm mb-1">사용자 ID</p>
            <p class="text-lg">{userAuth().userId || '없음'}</p>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">로그인 방식</p>
            <p class="text-lg capitalize">{userAuth().provider || '없음'}</p>
          </div>
        </div>
        
        <div class="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/host/roombuild')} 
            class="py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            방 만들기
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            class="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            홈으로
          </button>
          
          <button 
            onClick={handleLogout} 
            class="py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostProfile; 