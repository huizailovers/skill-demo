'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import KnowledgePanel from '@/components/KnowledgePanel';
import { Columns, Layers, GripVertical, BookOpen, Code } from 'lucide-react';

const OnlineIDE = dynamic(() => import('@/components/OnlineIDE'), {
  ssr: false,
  loading: () => null,
});

const FloatingTerminal = dynamic(() => import('@/components/FloatingTerminal'), {
  ssr: false,
  loading: () => null,
});

const PracticeModule = dynamic(() => import('@/components/PracticeModule'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400">
      Loading...
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  const [layoutMode, setLayoutMode] = useState<'split' | 'float'>('split');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;

      setSplitRatio(Math.min(75, Math.max(25, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <h1 className="text-lg font-semibold text-white">
              Claude Code Skill 详解
            </h1>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('learn')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-all ${
                  activeTab === 'learn'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                学习
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-all ${
                  activeTab === 'practice'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code size={16} />
                实战
              </button>
            </div>

            {/* Layout Toggle - only show in learn tab */}
            {activeTab === 'learn' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">布局：</span>
                <div className="flex items-center rounded-lg p-1 bg-gray-800">
                  <button
                    onClick={() => setLayoutMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                      layoutMode === 'split'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Columns size={16} />
                    分栏
                  </button>
                  <button
                    onClick={() => setLayoutMode('float')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                      layoutMode === 'float'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Layers size={16} />
                    悬浮
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <>
          {/* Split Layout Mode */}
          {layoutMode === 'split' && (
            <main ref={containerRef} className="flex h-[calc(100vh-57px)]">
              <div className="overflow-hidden" style={{ width: `${splitRatio}%` }}>
                <KnowledgePanel />
              </div>

              <div
                className={`w-1 bg-gray-800 hover:bg-blue-500 cursor-col-resize flex items-center justify-center group transition-colors ${isDragging ? 'bg-blue-500' : ''}`}
                onMouseDown={handleMouseDown}
              >
                <div className={`w-4 h-8 rounded bg-gray-700 group-hover:bg-blue-400 flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-400' : ''}`}>
                  <GripVertical size={12} className="text-gray-400 group-hover:text-white" />
                </div>
              </div>

              <div className="overflow-hidden" style={{ width: `${100 - splitRatio}%` }}>
                <OnlineIDE />
              </div>
            </main>
          )}

          {/* Float Layout Mode */}
          {layoutMode === 'float' && (
            <>
              <main className="max-w-4xl mx-auto pb-20 bg-gray-100 min-h-[calc(100vh-57px)]">
                <KnowledgePanel />
              </main>
              <FloatingTerminal />
            </>
          )}
        </>
      )}

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <main className="h-[calc(100vh-57px)]">
          <PracticeModule />
        </main>
      )}
    </div>
  );
}
