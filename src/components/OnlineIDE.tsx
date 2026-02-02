'use client';

import { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  X,
  Terminal as TerminalIcon,
  ChevronUp,
} from 'lucide-react';

// --- Virtual File System ---

const virtualFileSystem: Record<string, string> = {
  'skills/git-conventions/SKILL.md': `---
name: git-conventions
description: Git commit message conventions and best practices
version: 1.0.0
---

# Git Conventions Skill

## Description
封装 Git 提交规范和最佳实践。
此 Skill 可被 /commit、/pr 等多个 Command 复用。

## Commit Message Format
使用 Conventional Commits 规范：

| 类型     | 说明           |
|----------|----------------|
| feat     | 新功能         |
| fix      | 修复 bug       |
| docs     | 文档更新       |
| refactor | 重构代码       |
| test     | 测试相关       |
| chore    | 构建/工具变更  |

## Rules
- 标题行不超过 50 字符
- 使用英文撰写
- 首字母小写，结尾不加句号
- Body 部分说明 Why，而非 What
- 末尾添加 Co-Authored-By 签名

## Example
\`\`\`
feat: add user authentication module

- Implement JWT token generation
- Add login/logout API endpoints
- Create auth middleware

Co-Authored-By: Claude <noreply@anthropic.com>
\`\`\`
`,
  'skills/coding-standards/SKILL.md': `---
name: coding-standards
description: Code quality and style guidelines
version: 1.0.0
---

# Coding Standards Skill

## Description
定义代码质量标准和风格指南，确保团队代码一致性。

## TypeScript 规范
- 优先使用 \`interface\` 而非 \`type\`
- 所有公开 API 必须有 JSDoc 注释
- 禁止使用 \`any\`，使用 \`unknown\` 替代
- 使用 \`const\` 优先，避免 \`let\`

## Naming Conventions
| 类型       | 风格           | 示例              |
|------------|----------------|--------------------|
| 变量/函数  | camelCase      | getUserName        |
| 类/接口    | PascalCase     | UserService        |
| 常量       | UPPER_SNAKE    | MAX_RETRY_COUNT    |
| 文件名     | kebab-case     | user-service.ts    |

## Error Handling
\`\`\`typescript
// Good: 明确的错误处理
try {
  const result = await fetchData();
  return result;
} catch (error) {
  if (error instanceof NetworkError) {
    logger.warn('Network issue', { error });
    return fallbackData;
  }
  throw error;
}
\`\`\`
`,
  'commands/commit.md': `---
name: commit
description: Auto-generate git commit messages
skill_deps:
  - git-conventions
---

# /commit Command

## What it does
自动分析暂存区变更，生成符合规范的 commit message。

## Workflow
1. 运行 \`git status\` 检查工作区状态
2. 运行 \`git diff --staged\` 分析变更内容
3. 根据 git-conventions skill 生成 commit message
4. 用户确认后执行 \`git commit\`

## Usage
\`\`\`
> /commit
\`\`\`

## Options
- 默认自动检测变更类型 (feat/fix/docs...)
- 支持 \`--amend\` 修改上次提交
- 支持 \`--scope <name>\` 指定作用域
`,
  'commands/review-pr.md': `---
name: review-pr
description: Automated pull request review
skill_deps:
  - coding-standards
  - git-conventions
---

# /review-pr Command

## What it does
自动审查 Pull Request，检查代码质量和规范。

## Workflow
1. 获取 PR 的 diff 内容
2. 逐文件分析变更
3. 基于 coding-standards 检查代码质量
4. 基于 git-conventions 检查提交信息
5. 生成审查报告

## Check Items
- [ ] 代码风格是否符合规范
- [ ] 是否有潜在的安全问题
- [ ] 测试覆盖率是否足够
- [ ] 文档是否需要更新
- [ ] Commit message 是否规范
`,
  'agents/code-reviewer.md': `---
name: code-reviewer
description: Expert code review agent
model: claude-opus-4-5-20251101
tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Code Reviewer Agent

## Role
专业代码审查 Agent，负责检查代码质量、安全性和可维护性。

## Capabilities
- 识别代码中的 bug 和潜在问题
- 检查安全漏洞 (OWASP Top 10)
- 评估代码复杂度
- 建议重构方案

## Review Checklist
1. **正确性**: 逻辑是否正确？边界条件是否处理？
2. **安全性**: 是否有注入、XSS、CSRF 风险？
3. **性能**: 是否有 N+1 查询、内存泄漏？
4. **可读性**: 命名是否清晰？结构是否合理？
5. **测试**: 是否有足够的测试覆盖？
`,
  'agents/tdd-guide.md': `---
name: tdd-guide
description: Test-Driven Development specialist
model: claude-opus-4-5-20251101
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
---

# TDD Guide Agent

## Role
测试驱动开发专家，指导团队实践 TDD 方法论。

## Methodology
### Red-Green-Refactor Cycle
1. **Red**: 先编写失败的测试
2. **Green**: 编写最少代码使测试通过
3. **Refactor**: 在测试保护下重构代码

## Test Types
| 类型       | 比例  | 工具              |
|------------|-------|-------------------|
| 单元测试   | 70%   | Jest / Vitest     |
| 集成测试   | 20%   | Supertest / MSW   |
| E2E 测试   | 10%   | Playwright        |

## Best Practices
- 每个测试只测一件事
- 测试命名遵循 "should...when..." 模式
- 使用 AAA 模式：Arrange, Act, Assert
- Mock 外部依赖，不 Mock 内部实现
`,
};

// --- Terminal Types & Data ---

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

// --- Helper: Build tree structure from flat file paths ---

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

function buildFileTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of paths) {
    const parts = filePath.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      const existing = current.find((n) => n.name === part);

      if (existing) {
        current = existing.children;
      } else {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
        };
        current.push(node);
        current = node.children;
      }
    }
  }

  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map((n) => ({ ...n, children: sortNodes(n.children) }))
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  };

  return sortNodes(root);
}

// --- Main Component ---

export default function OnlineIDE() {
  // File system state
  const [files, setFiles] = useState<Record<string, string>>(virtualFileSystem);
  const [openTabs, setOpenTabs] = useState<string[]>(['skills/git-conventions/SKILL.md']);
  const [activeTab, setActiveTab] = useState<string>('skills/git-conventions/SKILL.md');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['skills', 'skills/git-conventions', 'commands', 'agents'])
  );

  // Terminal state
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'dim', content: 'Claude Code v2.1.0' },
    { type: 'dim', content: 'Type /commit to see the skill in action' },
    { type: 'dim', content: '' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build file tree from current files (only rebuild when file keys change, not on content edits)
  const fileKeys = Object.keys(files);
  const fileKeysKey = fileKeys.join('\0');
  const fileTree = useMemo(() => buildFileTree(fileKeys), [fileKeysKey]);

  // --- File Tree Handlers ---

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const openFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    setActiveTab(path);
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(nextTabs);
    if (activeTab === path) {
      setActiveTab(nextTabs[nextTabs.length - 1] || '');
    }
  };

  // --- Terminal Handlers (reused from Terminal.tsx) ---

  const runCommitDemo = () => {
    const currentInput = terminalInput;
    setIsRunning(true);
    setTerminalLines((prev) => [
      ...prev,
      { type: 'input', content: `> ${currentInput}` },
      { type: 'dim', content: '' },
    ]);
    setTerminalInput('');

    const addLine = (index: number) => {
      if (index < commitDemoLines.length) {
        const line = commitDemoLines[index];
        setTerminalLines((prev) => [...prev, line]);
        timeoutRef.current = setTimeout(() => addLine(index + 1), 150);
      } else {
        setIsRunning(false);
        setTerminalLines((prev) => [...prev, { type: 'dim', content: '' }]);
      }
    };

    timeoutRef.current = setTimeout(() => addLine(0), 100);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTerminalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRunning) {
      const cmd = terminalInput.trim().toLowerCase();
      if (cmd === '/commit') {
        runCommitDemo();
      } else if (cmd === 'clear') {
        setTerminalLines([
          { type: 'dim', content: 'Claude Code v2.1.0' },
          { type: 'dim', content: '' },
        ]);
        setTerminalInput('');
      } else if (cmd) {
        setTerminalLines((prev) => [
          ...prev,
          { type: 'input', content: `> ${terminalInput}` },
          { type: 'error', content: `Unknown command: ${terminalInput}` },
          { type: 'dim', content: 'Try /commit to see the demo' },
          { type: 'dim', content: '' },
        ]);
        setTerminalInput('');
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const focusTerminalInput = () => {
    inputRef.current?.focus();
  };

  const getLineStyle = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':
        return 'text-green-400 font-semibold';
      case 'system':
        return 'text-blue-400';
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'error':
        return 'text-red-400';
      case 'code':
        return 'text-yellow-300';
      case 'dim':
        return 'text-gray-500';
      default:
        return 'text-gray-300';
    }
  };

  // --- File Tree Renderer ---

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeTab === node.path;

    if (node.isFolder) {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-gray-300 text-[13px]"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-gray-500 shrink-0" />
            ) : (
              <ChevronRight size={14} className="text-gray-500 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen size={14} className="text-yellow-400 shrink-0" />
            ) : (
              <Folder size={14} className="text-yellow-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {isExpanded &&
            node.children.map((child) => renderTreeNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-[13px] ${
          isActive
            ? 'bg-[#37373d] text-white'
            : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => openFile(node.path)}
      >
        <FileText size={14} className="text-blue-400 shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  };

  // --- Editor Change Handler ---

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      setFiles((prev) => ({ ...prev, [activeTab]: value }));
    }
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#323233] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400 font-mono">~/.claude</span>
        <div className="w-16"></div>
      </div>

      {/* Main content: sidebar + editor */}
      <div className="flex flex-1 min-h-0">
        {/* File Tree Sidebar */}
        <div className="w-48 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
          <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto">
            {fileTree.map((node) => renderTreeNode(node))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          {openTabs.length > 0 && (
            <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
              {openTabs.map((tab) => {
                const fileName = tab.split('/').pop() || tab;
                const isActive2 = tab === activeTab;
                return (
                  <div
                    key={tab}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] cursor-pointer border-r border-[#3c3c3c] shrink-0 ${
                      isActive2
                        ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                        : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a] border-t-2 border-t-transparent'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <FileText size={13} className="text-blue-400 shrink-0" />
                    <span className="truncate max-w-[120px]">{fileName}</span>
                    <button
                      className="ml-1 p-0.5 rounded hover:bg-[#404040] text-gray-500 hover:text-white"
                      onClick={(e) => closeTab(tab, e)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            {activeTab && files[activeTab] !== undefined ? (
              <Editor
                key={activeTab}
                height="100%"
                defaultLanguage="markdown"
                theme="vs-dark"
                value={files[activeTab]}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  readOnly: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">No file open</p>
                  <p className="text-gray-700 text-xs">
                    Select a file from the explorer to start editing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal Panel */}
      <div className="border-t border-[#3c3c3c] flex flex-col bg-[#1e1e1e]">
        {/* Terminal Header */}
        <div
          className="flex items-center justify-between px-3 py-1 bg-[#252526] cursor-pointer select-none"
          onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
        >
          <div className="flex items-center gap-1.5">
            <TerminalIcon size={14} className="text-gray-400" />
            <span className="text-xs text-gray-300 font-medium">Terminal</span>
          </div>
          {isTerminalExpanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronUp size={14} className="text-gray-400" />
          )}
        </div>

        {/* Terminal Content */}
        {isTerminalExpanded && (
          <div
            className="h-48 bg-[#0d0d0d] overflow-hidden flex flex-col cursor-text"
            onClick={focusTerminalInput}
          >
            <div
              ref={terminalRef}
              className="flex-1 px-3 py-2 font-mono text-sm overflow-y-auto"
            >
              {terminalLines.map((line, index) => (
                <div
                  key={index}
                  className={`${getLineStyle(line.type)} leading-6 whitespace-pre`}
                >
                  {line.content || '\u00A0'}
                </div>
              ))}

              {/* Input line */}
              <div className="flex items-center leading-6">
                <span className="text-green-400 mr-1">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalKeyDown}
                  disabled={isRunning}
                  className="flex-1 bg-transparent text-gray-100 outline-none font-mono text-sm"
                  placeholder={isRunning ? '' : 'Type /commit here...'}
                />
                {!isRunning && (
                  <span className="text-gray-400 cursor-blink">▋</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
