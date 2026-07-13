import { ReactNode } from 'react';

type Page =
  | 'dashboard'
  | 'diary'
  | 'search'
  | 'weight'
  | 'exercise'
  | 'scanner'
  | 'recipes'
  | 'ai'
  | 'water'
  | 'body'
  | 'report'
  | 'workout'
  | 'voice'
  | 'settings';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { key: Page; label: string; icon: string }[] = [
  { key: 'dashboard', label: '首页', icon: '📊' },
  { key: 'diary', label: '饮食', icon: '🍽️' },
  { key: 'workout', label: '训练', icon: '🏋️' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'settings', label: '我的', icon: '⚙️' },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-gray-800">
          <span className="text-primary-500">轻享</span>健康
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('scanner')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-lg"
            title="扫条码"
          >
            📷
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-2">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-100 shrink-0 safe-bottom">
        <div className="flex justify-around items-center px-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-[60px] transition-all ${
                currentPage === item.key
                  ? 'text-primary-600 scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
