import { createSignal, onMount } from 'solid-js';
import { auth } from './firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import ky from 'ky';

const LOCAL_STORAGE_KEY = 'roomCode';
const USER_STORAGE_KEY = 'userAuth';

export const [socket, setSocket] = createSignal<WebSocket | null>(null);

export function initSocket(roomCode: string, username: string, isHost: boolean, onOpen?: () => void) {
  const role = isHost ? "host" : "player";
  const ws = new WebSocket(`/${role}/ws/${roomCode}/${username}`);

  ws.onopen = () => {
    console.log("WebSocket 연결 완료");
    setSocket(ws);
    if (onOpen) onOpen(); // 연결 후 navigate 호출
  };

  ws.onclose = () => console.warn("WebSocket 연결 종료");
  ws.onerror = (e) => console.error("WebSocket 오류", e);
}

// Function to get room code from local storage
const getRoomCodeFromStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || null;
};

// Function to set room code in local storage
const setRoomCodeInStorage = (code: string | null) => {
  if (code) {
    localStorage.setItem(LOCAL_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

// Initialize roomCode from local storage
const [roomCode, setRoomCode] = createSignal<string | null>(getRoomCodeFromStorage());

const updateRoomCode = (code: string | null) => {
  setRoomCodeInStorage(code);
  setRoomCode(code);
};

// User authentication
interface UserAuth {
  isAuthenticated: boolean;
  provider: string | null; // 'kakao', 'normal', etc.
  userId: string | null;
  name: string | null;
  profileImage: string | null;
  role: 'user' | 'authorized_host' | 'master' | null; // New field for permission levels
  certificationRequested: boolean; // Flag to track if user has requested host certification
}

// Get user authentication from local storage
const getUserAuthFromStorage = (): UserAuth => {
  const savedAuth = localStorage.getItem(USER_STORAGE_KEY);
  if (savedAuth) {
    return JSON.parse(savedAuth);
  }
  return {
    isAuthenticated: false,
    provider: null,
    userId: null,
    name: null,
    profileImage: null,
    role: null,
    certificationRequested: false
  };
};

// Save user authentication to local storage
const setUserAuthInStorage = (auth: UserAuth) => {
  console.log('Saving auth to localStorage:', auth);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth));
};

// Initialize user authentication from local storage
const [userAuth, setUserAuth] = createSignal<UserAuth>(getUserAuthFromStorage());

const updateUserAuth = (auth: UserAuth) => {
  console.log('Updating user auth:', auth);
  setUserAuthInStorage(auth);
  setUserAuth(auth);
  console.log('User auth updated, current state:', userAuth());
};

// Logout function
const logout = async () => {
  try {
    // Sign out from Firebase
    await auth.signOut();
    
    // Update local state
    updateUserAuth({
      isAuthenticated: false,
      provider: null,
      userId: null,
      name: null,
      profileImage: null,
      role: null,
      certificationRequested: false
    });
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Function to manually refresh the token and user info
export const refreshUserAuth = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user is currently signed in');
      return;
    }
    
    // Force token refresh
    await currentUser.getIdToken(true);
    
    // Get the updated token result
    const tokenResult = await getIdTokenResult(currentUser);
    console.log('Refreshed token claims:', tokenResult.claims);
    
    // Extract role and certification status from claims
    const role = tokenResult.claims.role as UserAuth['role'] || 'user';
    const certificationRequested = tokenResult.claims.certificationRequested === true;
    
    // Update auth state
    updateUserAuth({
      isAuthenticated: true,
      provider: currentUser.providerData[0]?.providerId || 'kakao',
      userId: currentUser.uid,
      name: currentUser.displayName || 'User',
      profileImage: currentUser.photoURL || null,
      role: role,
      certificationRequested: certificationRequested
    });
    
    console.log('User auth refreshed successfully');
  } catch (error) {
    console.error('Error refreshing user auth:', error);
  }
};

interface Result1 {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[]; //각 이벤트에서 필요한 아이템 태그 저장
  hunger: number[];
  thirst: number[];
  stress: number[];
}

interface Result2 {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[]; //각 이벤트에서 필요한 아이템 태그 저장
  hunger: number[];
  thirst: number[];
  stress: number[];
}

const initialResult1: Result1 = {
  team:"team1",
  used_item: Array(6).fill(""),
  item_path: Array(6).fill(""),
  event_result: Array(6).fill(""),
  required_item: Array(6).fill(""), //각 이벤트에서 필요한 아이템 태그 저장
  hunger: Array(6).fill(0),
  thirst: Array(6).fill(0),
  stress: Array(6).fill(0),
};

const initialResult2: Result2 = {
  team:"team2",
  used_item: Array(6).fill(""),
  item_path: Array(6).fill(""),
  event_result: Array(6).fill(""),
  required_item: Array(6).fill(""), //각 이벤트에서 필요한 아이템 태그 저장
  hunger: Array(6).fill(0),
  thirst: Array(6).fill(0),
  stress: Array(6).fill(0),
};

export const [team1Result, setTeam1Result] = createSignal<Result1>({ ...initialResult1 });
export const [team2Result, setTeam2Result] = createSignal<Result2>({ ...initialResult2 });

export { roomCode, updateRoomCode as setRoomCode, userAuth, updateUserAuth as setUserAuth, logout };

// 아이템 정보 인터페이스 추가
interface ItemInfo {
  name: string;
  korName: string;
  description: string;
}

// 아이템 태그별 매핑 데이터와 상세 정보 추가
export const [itemTagMapping, setItemTagMapping] = createSignal<Record<string, string[]>>({
  'drink': [],
  'food': [],
  'medical': [],
  'info': [],
  'shoes': [],
  'waterproof': []
});

export const [itemDetails, setItemDetails] = createSignal<Record<string, ItemInfo>>({});

// Initialize auth state
onMount(() => {
  console.log('Setting up Firebase auth state listener');
  
  onAuthStateChanged(auth, async (user) => {
    console.log('Firebase auth state changed:', user ? 'User logged in' : 'No user');
    
    if (user) {
      console.log('User details:', {
        uid: user.uid,
        displayName: user.displayName,
        provider: user.providerData[0]?.providerId
      });
      
      try {
        // Get the token result to check custom claims
        const tokenResult = await getIdTokenResult(user);
        console.log('Token claims:', tokenResult.claims);
        
        // Extract role and certification status from claims
        const role = tokenResult.claims.role as UserAuth['role'] || 'user';
        const certificationRequested = tokenResult.claims.certificationRequested === true;
        
        // Try to fetch user profile data from the server
        try {
          const userProfile = await ky.get('/api/auth/user-profile', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`
            }
          }).json<{
            success: boolean;
            user: {
              role: UserAuth['role'];
              certificationRequested: boolean;
            }
          }>();
          
          console.log('User profile from API:', userProfile);
          
          if (userProfile.success) {
            updateUserAuth({
              isAuthenticated: true,
              provider: user.providerData[0]?.providerId || 'kakao',
              userId: user.uid,
              name: user.displayName || 'User',
              profileImage: user.photoURL || null,
              role: userProfile.user.role,
              certificationRequested: userProfile.user.certificationRequested
            });
            return;
          }
        } catch (error) {
          console.warn('Could not fetch user profile from API, using token claims instead', error);
        }
        
        // If API request fails, use the claims from the token
        updateUserAuth({
          isAuthenticated: true,
          provider: user.providerData[0]?.providerId || 'kakao',
          userId: user.uid,
          name: user.displayName || 'User',
          profileImage: user.photoURL || null,
          role: role,
          certificationRequested: certificationRequested
        });
      } catch (error) {
        console.error('Error getting token claims:', error);
        
        // Fallback to basic authentication without claims
        updateUserAuth({
          isAuthenticated: true,
          provider: user.providerData[0]?.providerId || 'kakao',
          userId: user.uid,
          name: user.displayName || 'User',
          profileImage: user.photoURL || null,
          role: 'user',
          certificationRequested: false
        });
      }
    } else {
      updateUserAuth({
        isAuthenticated: false,
        provider: null,
        userId: null,
        name: null,
        profileImage: null,
        role: null,
        certificationRequested: false
      });
    }
  });
}); 