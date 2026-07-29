import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Feed', path: '/', icon: '🏠' },
    { label: 'Empregos', path: '/jobs', icon: '💼' },
    { label: 'Mensagens', path: '/chat', icon: '💬' },
    { label: 'Perfil', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center flex-1 py-1 text-xs font-medium transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}