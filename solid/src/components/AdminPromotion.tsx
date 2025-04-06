import { Component, createSignal } from 'solid-js';
import { userAuth } from '../store';
import ky from 'ky';

const AdminPromotion: Component = () => {
  const [userId, setUserId] = createSignal(userAuth().userId || '');
  const [secretKey, setSecretKey] = createSignal('');
  const [result, setResult] = createSignal<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const response = await ky.post('/api/auth/promote-to-master', {
        json: {
          userId: userId(),
          secret_key: secretKey()
        }
      }).json<{ success: boolean; message: string }>();
      
      setResult({
        success: response.success,
        message: response.message
      });
      
      // Clear the secret key for security
      setSecretKey('');
    } catch (error) {
      console.error('Error promoting to master:', error);
      setResult({
        success: false,
        error: 'Failed to promote user. Check the console for details.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="container mx-auto px-4 py-10 max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">관리자 권한 설정</h1>
        
        <div class="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p class="text-sm">
            <strong>주의:</strong> 이 페이지는 관리자 권한 설정을 위한 것입니다. 
            적절한 권한이 없는 경우 사용하지 마세요.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="userId">
              사용자 ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId()}
              onInput={(e) => setUserId(e.target.value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="kakao:12345678"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="secretKey">
              보안 키
            </label>
            <input
              id="secretKey"
              type="password"
              value={secretKey()}
              onInput={(e) => setSecretKey(e.target.value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="보안 키를 입력하세요"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading()}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading() ? '처리 중...' : '관리자로 승급하기'}
          </button>
        </form>
        
        {result() && (
          <div class={`mt-4 p-3 rounded ${result()?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result()?.success ? result()?.message : result()?.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotion; 