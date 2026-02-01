'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface TerminalLine {
  type: 'input' | 'system' | 'output' | 'success' | 'error' | 'code' | 'dim';
  content: string;
}

const commitDemoLines: TerminalLine[] = [
  { type: 'system', content: '⏺ Loading skill: ~/.claude/commands/commit.md' },
  { type: 'dim', content: '' },
  { type: 'system', content: '⏺ Running: git status' },
  { type: 'output', content: 'On branch main' },
  { type: 'output', content: 'Changes not staged for commit:' },
  { type: 'code', content: '  modified:   src/components/Button.tsx' },
  { type: 'code', content: '  modified:   src/utils/helpers.ts' },
  { type: 'output', content: 'Untracked files:' },
  { type: 'code', content: '  src/hooks/useAuth.ts' },
  { type: 'dim', content: '' },
  { type: 'system', content: '⏺ Running: git diff' },
  { type: 'dim', content: '  Analyzing 3 files, 127 lines changed...' },
  { type: 'dim', content: '' },
  { type: 'system', content: '⏺ Generating commit message...' },
  { type: 'dim', content: '' },
  { type: 'output', content: '┌─────────────────────────────────────────────────┐' },
  { type: 'output', content: '│  Proposed Commit Message                        │' },
  { type: 'output', content: '├─────────────────────────────────────────────────┤' },
  { type: 'success', content: '│  feat: add user authentication hook             │' },
  { type: 'output', content: '│                                                 │' },
  { type: 'dim', content: '│  - Add useAuth hook for authentication state    │' },
  { type: 'dim', content: '│  - Refactor Button to support loading state     │' },
  { type: 'dim', content: '│  - Update helper functions for token validation │' },
  { type: 'output', content: '│                                                 │' },
  { type: 'dim', content: '│  Co-Authored-By: Claude <noreply@anthropic.com> │' },
  { type: 'output', content: '└─────────────────────────────────────────────────┘' },
  { type: 'dim', content: '' },
  { type: 'system', content: '⏺ Running: git add src/components/Button.tsx src/utils/helpers.ts src/hooks/useAuth.ts' },
  { type: 'system', content: '⏺ Running: git commit -m "feat: add user authentication hook..."' },
  { type: 'dim', content: '' },
  { type: 'success', content: '✓ Commit created successfully!' },
  { type: 'dim', content: '  [main 8a3f2d1] feat: add user authentication hook' },
  { type: 'dim', content: '  3 files changed, 127 insertions(+), 12 deletions(-)' },
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'dim', content: 'Claude Code v2.1.0' },
    { type: 'dim', content: 'Type /commit to see the skill in action' },
    { type: 'dim', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runCommitDemo = () => {
    setIsRunning(true);
    setLines(prev => [...prev, { type: 'input', content: `> ${input}` }, { type: 'dim', content: '' }]);
    setInput('');

    // Use recursive setTimeout to avoid closure issues
    const addLine = (index: number) => {
      if (index < commitDemoLines.length) {
        const line = commitDemoLines[index];
        setLines(prev => [...prev, line]);
        setTimeout(() => addLine(index + 1), 150);
      } else {
        setIsRunning(false);
        setLines(prev => [...prev, { type: 'dim', content: '' }]);
      }
    };

    setTimeout(() => addLine(0), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRunning) {
      const cmd = input.trim().toLowerCase();
      if (cmd === '/commit') {
        runCommitDemo();
      } else if (cmd === 'clear') {
        setLines([
          { type: 'dim', content: 'Claude Code v2.1.0' },
          { type: 'dim', content: '' },
        ]);
        setInput('');
      } else if (cmd) {
        setLines(prev => [
          ...prev,
          { type: 'input', content: `> ${input}` },
          { type: 'error', content: `Unknown command: ${input}` },
          { type: 'dim', content: 'Try /commit to see the demo' },
          { type: 'dim', content: '' },
        ]);
        setInput('');
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getLineStyle = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-400 font-semibold';
      case 'system': return 'text-blue-400';
      case 'success': return 'text-emerald-400 font-medium';
      case 'error': return 'text-red-400';
      case 'code': return 'text-yellow-300';
      case 'dim': return 'text-gray-500';
      default: return 'text-gray-300';
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0d0d0d] rounded-lg overflow-hidden border border-gray-700 cursor-text"
      onClick={focusInput}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-sm text-gray-400 font-mono">claude</span>
        <div className="w-16"></div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto"
      >
        {lines.map((line, index) => (
          <div key={index} className={`${getLineStyle(line.type)} leading-6 whitespace-pre`}>
            {line.content || '\u00A0'}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center leading-6">
          <span className="text-green-400 mr-1">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            className="flex-1 bg-transparent text-gray-100 outline-none font-mono"
            placeholder={isRunning ? '' : 'Type /commit here...'}
            autoFocus
          />
          {!isRunning && <span className="text-gray-400 cursor-blink">▋</span>}
        </div>
      </div>
    </div>
  );
}
