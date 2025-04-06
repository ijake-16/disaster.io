import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { userAuth } from '../store';
import ky from 'ky';

interface CertificationRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  organization: string;
  remarks?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPanel: Component = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = createSignal<CertificationRequest[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedRequest, setSelectedRequest] = createSignal<CertificationRequest | null>(null);
  const [showDetails, setShowDetails] = createSignal(false);

  // Redirect if not a master
  createEffect(() => {
    if (!userAuth().isAuthenticated || userAuth().role !== 'master') {
      navigate('/login');
    }
  });

  // Load certification requests from the backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const response = await ky.get('/api/auth/certification-requests').json<{
        success: boolean;
        requests: CertificationRequest[];
      }>();
      
      if (response.success) {
        console.log('Fetched certification requests:', response.requests);
        setRequests(response.requests);
      } else {
        throw new Error('Failed to fetch certification requests');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load certification requests:', err);
      setError('인증 요청을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // Fetch requests on mount
  createEffect(() => {
    if (userAuth().isAuthenticated && userAuth().role === 'master') {
      fetchRequests();
    }
  });

  const handleViewDetails = (request: CertificationRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const handleApprove = async (userId: string) => {
    try {
      setLoading(true);
      
      // Call the API to approve the certification
      const response = await ky.post('/api/auth/approve-certification', {
        json: { userId }
      }).json<{success: boolean; message: string}>();
      
      console.log('Approval response:', response);
      
      if (response.success) {
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.userId === userId 
              ? { ...req, status: 'approved' as const } 
              : req
          )
        );
        
        // Close details modal if open
        if (selectedRequest()?.userId === userId) {
          setShowDetails(false);
        }
        
        // Show success message
        setError(null);
      } else {
        throw new Error('Failed to approve certification');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to approve certification:', err);
      setError('인증 승인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setLoading(true);
      
      // Call the API to reject the certification
      const response = await ky.post('/api/auth/reject-certification', {
        json: { userId }
      }).json<{success: boolean; message: string}>();
      
      console.log('Rejection response:', response);
      
      if (response.success) {
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.userId === userId 
              ? { ...req, status: 'rejected' as const } 
              : req
          )
        );
        
        // Close details modal if open
        if (selectedRequest()?.userId === userId) {
          setShowDetails(false);
        }
        
        // Show success message
        setError(null);
      } else {
        throw new Error('Failed to reject certification');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to reject certification:', err);
      setError('인증 거부 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">관리자 패널 - 인증 요청 관리</h1>
      
      <Show when={error()}>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error()}
        </div>
      </Show>
      
      <Show when={loading()} fallback={
        <Show when={requests().length > 0} fallback={
          <div class="bg-blue-50 p-4 rounded text-center">
            현재 처리할 인증 요청이 없습니다.
          </div>
        }>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-3 px-4 text-left">이름</th>
                  <th class="py-3 px-4 text-left">조직</th>
                  <th class="py-3 px-4 text-left">이메일</th>
                  <th class="py-3 px-4 text-left">요청일</th>
                  <th class="py-3 px-4 text-left">상태</th>
                  <th class="py-3 px-4 text-left">관리</th>
                </tr>
              </thead>
              <tbody>
                <For each={requests()}>
                  {(request) => (
                    <tr class="border-t border-gray-200 hover:bg-gray-50">
                      <td class="py-3 px-4">{request.name}</td>
                      <td class="py-3 px-4">{request.organization}</td>
                      <td class="py-3 px-4">{request.email}</td>
                      <td class="py-3 px-4">
                        {new Date(request.requestDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td class="py-3 px-4">
                        <span class={
                          request.status === 'pending' ? 'text-yellow-600 font-medium' :
                          request.status === 'approved' ? 'text-green-600 font-medium' :
                          'text-red-600 font-medium'
                        }>
                          {
                            request.status === 'pending' ? '대기중' :
                            request.status === 'approved' ? '승인됨' :
                            '거부됨'
                          }
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <Show when={request.status === 'pending'}>
                          <div class="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              class="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm"
                            >
                              상세보기
                            </button>
                            <button
                              onClick={() => handleApprove(request.userId)}
                              class="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 text-sm"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(request.userId)}
                              class="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 text-sm"
                            >
                              거부
                            </button>
                          </div>
                        </Show>
                        <Show when={request.status !== 'pending'}>
                          <button
                            onClick={() => handleViewDetails(request)}
                            class="bg-gray-500 hover:bg-gray-600 text-white rounded px-3 py-1 text-sm"
                          >
                            상세보기
                          </button>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      }>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Show>
      
      {/* Request Details Modal */}
      <Show when={showDetails() && selectedRequest()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">인증 요청 상세 정보</h2>
                <button 
                  onClick={handleCloseDetails}
                  class="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">이름</p>
                    <p class="font-medium">{selectedRequest()?.name}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">사용자 ID</p>
                    <p class="font-medium">{selectedRequest()?.userId}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">조직</p>
                    <p class="font-medium">{selectedRequest()?.organization}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">이메일</p>
                    <p class="font-medium">{selectedRequest()?.email}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">전화번호</p>
                    <p class="font-medium">{selectedRequest()?.phoneNumber}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">요청일</p>
                    <p class="font-medium">{new Date(selectedRequest()?.requestDate || '').toLocaleString('ko-KR')}</p>
                  </div>
                </div>
                
                <div>
                  <p class="text-sm text-gray-500">비고</p>
                  <p class="font-medium whitespace-pre-wrap">{selectedRequest()?.remarks || '(없음)'}</p>
                </div>
                
                <div>
                  <p class="text-sm text-gray-500">상태</p>
                  <p class={
                    selectedRequest()?.status === 'pending' ? 'text-yellow-600 font-medium' :
                    selectedRequest()?.status === 'approved' ? 'text-green-600 font-medium' :
                    'text-red-600 font-medium'
                  }>
                    {
                      selectedRequest()?.status === 'pending' ? '대기중' :
                      selectedRequest()?.status === 'approved' ? '승인됨' :
                      '거부됨'
                    }
                  </p>
                </div>
              </div>
              
              <Show when={selectedRequest()?.status === 'pending'}>
                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleReject(selectedRequest()?.userId || '')}
                    class="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                    disabled={loading()}
                  >
                    거부
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest()?.userId || '')}
                    class="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2"
                    disabled={loading()}
                  >
                    승인
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default AdminPanel; 