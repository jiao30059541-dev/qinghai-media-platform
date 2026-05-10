'use client';

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isClient, setIsClient] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    setIsOnline(navigator.onLine);

    // 只在客户端执行
    if (typeof window !== 'undefined') {
      setupServiceWorker();
      setupNetworkListeners();
      setupInstallPrompt();
    }
  }, []);

  const setupServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker 注册成功:', registration.scope);

        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新版本可用，提示用户刷新
                if (confirm('新版本可用！是否立即刷新以获取最新功能？')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  };

  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setIsOnline(true);
      hideOfflineNotification();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showOfflineNotification();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const setupInstallPrompt = () => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 延迟显示安装提示
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`安装结果: ${outcome}`);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const showOfflineNotification = () => {
    // 简单的控制台日志
    console.log('📶 离线模式 - 部分功能可能受限');
  };

  const hideOfflineNotification = () => {
    console.log('📶 网络连接恢复');
  };

  // 如果不是客户端，不渲染任何内容
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* 安装提示 */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
                      bg-gradient-to-br from-gray-900 to-gray-800 text-white 
                      p-4 rounded-2xl shadow-2xl border border-blue-500/30 
                      max-w-md w-[90%] animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl text-blue-400">📱</div>
            <div>
              <div className="font-bold text-lg">安装应用</div>
              <div className="text-sm text-gray-300">
                将青海全媒体广告平台安装到主屏幕，获得更好的体验
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 
                       rounded-xl transition-colors"
            >
              稍后
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700 text-white 
                       font-semibold rounded-xl transition-all hover:shadow-lg"
            >
              立即安装
            </button>
          </div>
        </div>
      )}

      {/* 离线指示器 */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-40 
                      bg-gradient-to-r from-amber-500 to-amber-600 text-white 
                      px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 
                      animate-slide-in">
          <div className="text-xl">📶</div>
          <div>
            <div className="font-semibold">离线模式</div>
            <div className="text-sm opacity-90">部分功能可能受限</div>
          </div>
        </div>
      )}

      {/* 内联样式 */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease;
        }
        
        /* 安全区域支持 */
        @supports (padding: max(0px)) {
          .pwa-safe-top {
            padding-top: max(1rem, env(safe-area-inset-top));
          }
          
          .pwa-safe-bottom {
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}