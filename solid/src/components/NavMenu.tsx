import { Component, Show } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { userAuth, logout } from '../store';

const NavMenu: Component = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'font-bold border-b-2 border-orange-500' : '';
  };
  
  return (
    <nav class="bg-neutral-900 text-white py-4 px-6 fixed w-full top-0 z-10">
      <div class="container mx-auto flex justify-between items-center">
        <A href="/" class="text-xl font-bold text-orange-500">Disaster.io</A>
        
        <div class="flex items-center space-x-6">
          <Show when={userAuth().isAuthenticated} fallback={
            <>
              <A href="/login" class={`hover:text-orange-400 ${isActive('/login')}`}>로그인</A>
              <A href="/register" class={`hover:text-orange-400 ${isActive('/register')}`}>회원가입</A>
            </>
          }>
            <A href="/home" class={`hover:text-orange-400 ${isActive('/home')}`}>홈</A>
            <A href="/map" class={`hover:text-orange-400 ${isActive('/map')}`}>지도</A>
            <A href="/host-profile" class={`hover:text-orange-400 ${isActive('/host-profile')}`}>내 프로필</A>
            
            <Show when={userAuth().role === 'master'}>
              <A href="/admin" class={`flex items-center hover:text-orange-400 ${isActive('/admin')}`}>
                <span class="bg-purple-500 text-white text-xs px-2 py-0.5 rounded mr-1">M</span>
                관리자
              </A>
            </Show>
            
            <button 
              onClick={logout}
              class="hover:text-orange-400"
            >
              로그아웃
            </button>
          </Show>
        </div>
      </div>
    </nav>
  );
};

export default NavMenu; 