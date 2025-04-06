import { Component, createEffect, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { userAuth, setUserAuth, refreshUserAuth } from '../store';
import { auth } from '../firebase';
import ky from 'ky';

// Extended certification request interface
interface CertificationRequestForm {
  organization: string;
  phoneNumber: string;
  email: string;
  remarks: string;
}

const HostProfile: Component = () => {
  const navigate = useNavigate();
  const [requestSent, setRequestSent] = createSignal(false);
  const [requestMessage, setRequestMessage] = createSignal('');
  const [showRequestForm, setShowRequestForm] = createSignal(false);
  const [requestForm, setRequestForm] = createSignal<CertificationRequestForm>({
    organization: '',
    phoneNumber: '',
    email: auth.currentUser?.email || '',
    remarks: ''
  });
  const [formErrors, setFormErrors] = createSignal<Record<string, string>>({});
  const [isLoading, setIsLoading] = createSignal(false);

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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!requestForm().organization.trim()) {
      errors.organization = '소속을 입력해주세요';
    }
    
    if (!requestForm().phoneNumber.trim()) {
      errors.phoneNumber = '연락처를 입력해주세요';
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(requestForm().phoneNumber)) {
      errors.phoneNumber = '연락처 형식이 올바르지 않습니다 (예: 010-1234-5678)';
    }
    
    if (!requestForm().email.trim()) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestForm().email)) {
      errors.email = '이메일 형식이 올바르지 않습니다';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestFormChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setRequestForm(prev => ({
      ...prev,
      [target.name]: target.value
    }));
  };

  const handleRequestCertification = async (e: Event) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Requesting host certification with data:', requestForm());
      
      // Send certification request to the backend
      const response = await ky.post('/api/auth/request-certification', {
        json: { 
          userId: userAuth().userId,
          name: userAuth().name,
          ...requestForm()
        }
      }).json<{success: boolean; message: string; id: string}>();
      
      console.log('Certification request response:', response);
      
      setRequestSent(true);
      setShowRequestForm(false);
      setRequestMessage('인증 요청이 성공적으로 전송되었습니다. 관리자의 승인을 기다려주세요.');
      
      // Update user state to indicate certification has been requested
      const currentAuth = userAuth();
      setUserAuth({
        ...currentAuth,
        certificationRequested: true
      });
    } catch (error) {
      console.error('Failed to request certification:', error);
      setRequestMessage('인증 요청 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserAuth({
        isAuthenticated: false,
        provider: null,
        userId: null,
        name: null,
        profileImage: null,
        role: null,
        certificationRequested: false
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefreshAuth = async () => {
    try {
      setIsLoading(true);
      await refreshUserAuth();
      setIsLoading(false);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setIsLoading(false);
    }
  };

  return (
    <div class="flex items-center justify-center min-h-screen bg-neutral-950 text-white pt-16 pb-8 px-4">
      <div class="max-w-3xl w-full mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold text-white">호스트 프로필</h1>
            <button
              onClick={handleRefreshAuth}
              disabled={isLoading()}
              class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading() ? '새로고침 중...' : '권한 새로고침'}
            </button>
          </div>
          
          {/* User information */}
          <div class="bg-gray-700 p-4 rounded-lg mb-6">
            <div class="flex items-center space-x-4">
              <Show when={userAuth().profileImage}>
                <img 
                  src={userAuth().profileImage || ''} 
                  alt="Profile" 
                  class="w-16 h-16 rounded-full"
                />
              </Show>
              
              <div>
                <h2 class="text-xl font-semibold text-white">{userAuth().name}</h2>
                <p class="text-gray-300 text-sm">사용자 ID: {userAuth().userId}</p>
                <div class="mt-2">
                  <span class={`px-3 py-1 text-sm rounded-full ${
                    userAuth().role === 'master' ? 'bg-purple-900 text-purple-100' : 
                    userAuth().role === 'authorized_host' ? 'bg-green-900 text-green-100' : 
                    'bg-gray-900 text-gray-300'
                  }`}>
                    {userAuth().role === 'master' ? '마스터' : 
                     userAuth().role === 'authorized_host' ? '인증된 호스트' : 
                     '일반 사용자'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Show certification form only if user is not already certified or master */}
          <Show when={!userAuth().role || userAuth().role === 'user'}>
            <Show when={!userAuth().certificationRequested} fallback={
              <div class="bg-blue-900 text-blue-100 p-4 rounded-lg mb-6">
                <p>인증 요청이 제출되었습니다. 관리자의 검토를 기다리고 있습니다.</p>
              </div>
            }>
              <div class="bg-gray-700 p-4 rounded-lg mb-6">
                <h2 class="text-lg font-semibold mb-2 text-white">호스트 인증 요청</h2>
                <p class="text-sm text-gray-300 mb-4">
                  대피소나 이벤트를 호스팅하려면 호스트로 인증 받아야 합니다. 아래 양식을 작성하여 인증을 요청하세요.
                </p>
                
                {/* Certification request form */}
                <form onSubmit={handleRequestCertification}>
                  <div class="mb-4">
                    <label class="block text-gray-400 text-sm mb-1" for="organization">소속 *</label>
                    <input 
                      type="text" 
                      id="organization" 
                      name="organization" 
                      value={requestForm().organization} 
                      onInput={handleRequestFormChange}
                      class="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="회사/단체/학교명"
                    />
                    <Show when={formErrors().organization}>
                      <p class="text-red-500 text-xs mt-1">{formErrors().organization}</p>
                    </Show>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-gray-400 text-sm mb-1" for="phoneNumber">연락처 *</label>
                    <input 
                      type="text" 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      value={requestForm().phoneNumber} 
                      onInput={handleRequestFormChange}
                      class="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="010-1234-5678"
                    />
                    <Show when={formErrors().phoneNumber}>
                      <p class="text-red-500 text-xs mt-1">{formErrors().phoneNumber}</p>
                    </Show>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-gray-400 text-sm mb-1" for="email">이메일 *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={requestForm().email} 
                      onInput={handleRequestFormChange}
                      class="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="example@email.com"
                    />
                    <Show when={formErrors().email}>
                      <p class="text-red-500 text-xs mt-1">{formErrors().email}</p>
                    </Show>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-gray-400 text-sm mb-1" for="remarks">비고 (선택사항)</label>
                    <textarea 
                      id="remarks" 
                      name="remarks" 
                      value={requestForm().remarks} 
                      onInput={handleRequestFormChange}
                      class="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                      placeholder="추가 정보를 입력해주세요"
                    />
                  </div>
                  
                  <div class="flex space-x-3">
                    <button
                      type="submit"
                      class="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      제출하기
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      class="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </Show>
          </Show>
          
          {/* Show admin panel link for master users */}
          <Show when={userAuth().role === 'master'}>
            <div class="bg-purple-900 p-4 rounded-lg mb-6">
              <h2 class="text-lg font-semibold mb-2 text-white">관리자 기능</h2>
              <p class="text-sm text-gray-300 mb-4">
                마스터 권한이 있습니다. 관리자 패널에서 인증 요청을 관리할 수 있습니다.
              </p>
              <a 
                href="/admin" 
                class="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                관리자 패널로 이동
              </a>
            </div>
          </Show>
          
          {/* Room Creation - Only show for authorized hosts and masters */}
          <Show when={userAuth().role === 'authorized_host' || userAuth().role === 'master'}>
            <div class="bg-green-900 p-4 rounded-lg mb-6">
              <h2 class="text-lg font-semibold mb-2 text-white">호스트 기능</h2>
              <p class="text-sm text-gray-300 mb-4">
                인증된 호스트입니다. 게임을 만들고 호스팅할 수 있습니다.
              </p>
              <a 
                href="/host/roombuild" 
                class="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                게임 호스팅하기
              </a>
            </div>
          </Show>
          
          {/* Navigation buttons */}
          <div class="flex justify-center mt-8">
            <button
              onClick={() => navigate(-1)}
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded mr-4 transition-colors"
            >
              뒤로 가기
            </button>
            <button
              onClick={() => auth.signOut()}
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile; 