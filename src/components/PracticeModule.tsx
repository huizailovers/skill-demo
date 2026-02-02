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
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Download,
  FileDown,
  Zap,
  GraduationCap,
  Trophy,
  ArrowLeft,
} from 'lucide-react';

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert' | null;

// Different templates based on difficulty
const skillTemplates = {
  beginner: `# Coding Standards Skill

定义代码规范和最佳实践，可被多个 Command 复用。

## 规则
- 变量命名使用 camelCase
- 函数应该有明确的单一职责
- 避免魔法数字，使用常量

## 示例
好的代码：
const MAX_RETRY_COUNT = 3;

不好的代码：
if (count > 3) { ... }
`,
  intermediate: `# Coding Standards Skill

<!-- 在这里定义你的代码规范 -->

## 规则


## 示例

`,
  expert: `# Your Skill

`
};

const commandTemplates = {
  beginner: `# Review Command

执行代码审查，检查代码是否符合规范。

## 引用 Skill
@skill:coding-standards

## 执行步骤
1. 获取代码变��
2. 应用 coding-standards 规则检查
3. 生成审查报告
`,
  intermediate: `# Review Command

<!-- 定义你的审查命令 -->

## 引用 Skill
@skill:coding-standards

## 执行步骤

`,
  expert: `# Your Command

`
};

// Step 3: Test code with issues
const testCode = `// 用户管理模块
function f(d) {
  var x = d.n;
  var y = d.a;

  if (y > 18) {
    console.log("adult");
  }

  for (var i = 0; i < 10; i++) {
    // do something
  }

  var result = x + "_" + y;
  return result;
}

var data = {n: "john", a: 25};
var temp = f(data);
console.log(temp);

function processData(input) {
  if (input == null) {
    return null;
  }
  if (input == undefined) {
    return undefined;
  }
  var output = input * 2;
  return output;
}
`;

interface TerminalLine {
  type: 'input' | 'system' | 'output' | 'success' | 'error' | 'warning' | 'dim';
  content: string;
}

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

export default function PracticeModule() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Unified virtual file system state
  const [files, setFiles] = useState<Record<string, string>>({});
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['skills', 'skills/coding-standards', 'commands'])
  );

  // Terminal state
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
    { type: 'dim', content: '' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File paths
  const SKILL_PATH = 'skills/coding-standards/SKILL.md';
  const COMMAND_PATH = 'commands/review.md';
  const TEST_CODE_PATH = 'test-code.js';

  // Build file tree
  const fileKeys = Object.keys(files);
  const fileKeysKey = fileKeys.join('\0');
  const fileTree = useMemo(() => buildFileTree(fileKeys), [fileKeysKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Select difficulty and initialize
  const selectDifficulty = (level: DifficultyLevel) => {
    if (!level) return;
    setDifficulty(level);

    // Initialize files
    const initialFiles: Record<string, string> = {
      [SKILL_PATH]: skillTemplates[level],
      [COMMAND_PATH]: commandTemplates[level],
      [TEST_CODE_PATH]: testCode,
    };
    setFiles(initialFiles);

    // Set initial tab to skill file
    setOpenTabs([SKILL_PATH]);
    setActiveTab(SKILL_PATH);

    const initialLines: TerminalLine[] = [
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ];

    if (level === 'beginner') {
      initialLines.push(
        { type: 'system', content: '📝 Step 1: 创建一个 Skill' },
        { type: 'dim', content: '在右侧编辑器中编写 Skill 定义' },
        { type: 'dim', content: '' }
      );
    } else if (level === 'intermediate') {
      initialLines.push(
        { type: 'system', content: '📝 创建 Skill 和 Command' },
        { type: 'dim', content: '' }
      );
    } else {
      initialLines.push(
        { type: 'system', content: '🎯 挑战: 创建一个代码审查系统' },
        { type: 'dim', content: '输入 /review 测试你的实现' },
        { type: 'dim', content: '' }
      );
    }

    setTerminalLines(initialLines);
  };

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

  // Download functions
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSkill = () => {
    downloadFile(files[SKILL_PATH] || '', 'skill.md');
  };

  const downloadCommand = () => {
    downloadFile(files[COMMAND_PATH] || '', 'review.md');
  };

  const downloadAll = () => {
    downloadFile(files[SKILL_PATH] || '', 'coding-standards-skill.md');
    setTimeout(() => {
      downloadFile(files[COMMAND_PATH] || '', 'review-command.md');
    }, 100);
  };

  const getSkillName = () => {
    const commandContent = files[COMMAND_PATH] || '';
    const match = commandContent.match(/@skill:([a-z-]+)/);
    return match ? match[1] : 'coding-standards';
  };

  const goToStep2 = () => {
    setCurrentStep(2);
    // Auto-open command file
    if (!openTabs.includes(COMMAND_PATH)) {
      setOpenTabs((prev) => [...prev, COMMAND_PATH]);
    }
    setActiveTab(COMMAND_PATH);

    if (difficulty === 'beginner') {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Step 1 完成！' },
        { type: 'dim', content: '' },
        { type: 'system', content: '📝 Step 2: 创建一个 Command' },
        { type: 'dim', content: '在右侧编辑器中编写 Command 定义' },
        { type: 'dim', content: '使用 @skill:xxx 引用你的 Skill' },
        { type: 'dim', content: '' },
      ]);
    } else {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Skill 已创建' },
        { type: 'dim', content: '' },
      ]);
    }
  };

  const goToStep3 = () => {
    setCurrentStep(3);
    setShowEvaluation(false);
    // Auto-open test code file
    if (!openTabs.includes(TEST_CODE_PATH)) {
      setOpenTabs((prev) => [...prev, TEST_CODE_PATH]);
    }
    setActiveTab(TEST_CODE_PATH);

    if (difficulty === 'beginner') {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Step 2 完成！' },
        { type: 'dim', content: '' },
        { type: 'system', content: '🧪 Step 3: 测试你的 Skill' },
        { type: 'dim', content: '右侧是一段有问题的代码' },
        { type: 'dim', content: '输入 /review 运行你的 Skill，看看能发现多少问题' },
        { type: 'dim', content: '' },
      ]);
    } else {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Command 已创建' },
        { type: 'dim', content: '' },
        { type: 'system', content: '🧪 测试验证' },
        { type: 'dim', content: '输入 /review 测试' },
        { type: 'dim', content: '' },
      ]);
    }
  };

  const goToStep1 = () => {
    setCurrentStep(1);
    setActiveTab(SKILL_PATH);
    if (!openTabs.includes(SKILL_PATH)) {
      setOpenTabs((prev) => [SKILL_PATH, ...prev]);
    }
  };

  const goBackToStep2 = () => {
    setCurrentStep(2);
    setActiveTab(COMMAND_PATH);
    if (!openTabs.includes(COMMAND_PATH)) {
      setOpenTabs((prev) => [...prev, COMMAND_PATH]);
    }
  };

  const resetPractice = () => {
    setDifficulty(null);
    setCurrentStep(1);
    setFiles({});
    setOpenTabs([]);
    setActiveTab('');
    setShowEvaluation(false);
    setTerminalLines([
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ]);
  };

  const changeDifficulty = () => {
    setDifficulty(null);
    setCurrentStep(1);
    setFiles({});
    setOpenTabs([]);
    setActiveTab('');
    setShowEvaluation(false);
    setTerminalLines([
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ]);
  };

  const runReviewDemo = () => {
    setIsRunning(true);
    setTerminalLines(prev => [...prev, { type: 'input', content: `> ${terminalInput}` }, { type: 'dim', content: '' }]);
    setTerminalInput('');

    const skillName = getSkillName();
    const isStep3 = currentStep === 3;

    const baseDemoLines: TerminalLine[] = [
      { type: 'system', content: '⏺ Loading command: ~/.claude/commands/review.md' },
      { type: 'system', content: `⏺ Loading skill: @skill:${skillName}` },
      { type: 'dim', content: '' },
    ];

    const step2DemoLines: TerminalLine[] = [
      ...baseDemoLines,
      { type: 'system', content: '⏺ Running: git diff HEAD~1' },
      { type: 'dim', content: '  Analyzing changes in 5 files...' },
      { type: 'dim', content: '' },
      { type: 'system', content: `⏺ Applying skill: ${skillName}` },
      { type: 'dim', content: '  - Checking code standards...' },
      { type: 'dim', content: '' },
      { type: 'output', content: '┌─────────────────────────────────────────────────┐' },
      { type: 'output', content: '│  Code Review Results                            │' },
      { type: 'output', content: '├─────────────────────────────────────────────────┤' },
      { type: 'success', content: '│  ✓ No critical issues found                     │' },
      { type: 'output', content: '└─────────────────────────────────────────────────┘' },
      { type: 'dim', content: '' },
      { type: 'success', content: '✓ Review completed!' },
    ];

    const step3DemoLines: TerminalLine[] = [
      ...baseDemoLines,
      { type: 'system', content: '⏺ Analyzing test code...' },
      { type: 'dim', content: '' },
      { type: 'system', content: `⏺ Applying skill: ${skillName}` },
      { type: 'dim', content: '' },
      { type: 'output', content: '┌─────────────────────────────────────────────────┐' },
      { type: 'output', content: '│  Code Review Results                            │' },
      { type: 'output', content: '├─────────────────────────────────────────────────┤' },
      { type: 'warning', content: '│  ⚠ Found 6 issues                               │' },
      { type: 'output', content: '├─────────────────────────────────────────────────┤' },
      { type: 'error', content: '│  Line 2: 函数名 f 不符合命名规范                │' },
      { type: 'error', content: '│  Line 3-4: 变量名 x, y 含义不明确               │' },
      { type: 'warning', content: '│  Line 6: 魔法数字 18，建议使用常量             │' },
      { type: 'warning', content: '│  Line 10: 魔法数字 10，建议使用常量            │' },
      { type: 'error', content: '│  Line 18: 使用 var 而非 const/let              │' },
      { type: 'warning', content: '│  Line 23-26: 使用 == 而非 ===                  │' },
      { type: 'output', content: '└─────────────────────────────────────────────────┘' },
      { type: 'dim', content: '' },
      { type: 'success', content: '✓ Review completed! Found 6 issues.' },
    ];

    const demoLines = isStep3 ? step3DemoLines : step2DemoLines;

    const addLine = (index: number) => {
      if (index < demoLines.length) {
        setTerminalLines(prev => [...prev, demoLines[index]]);
        timeoutRef.current = setTimeout(() => addLine(index + 1), 100);
      } else {
        setIsRunning(false);
        if (isStep3) {
          setTimeout(() => setShowEvaluation(true), 500);
        }
      }
    };

    timeoutRef.current = setTimeout(() => addLine(0), 100);
  };

  const handleTerminalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRunning) {
      const cmd = terminalInput.trim().toLowerCase();
      if (cmd === '/review') {
        // Beginner mode requires completing steps first
        if (difficulty === 'beginner' && currentStep === 1) {
          setTerminalLines(prev => [
            ...prev,
            { type: 'input', content: `> ${terminalInput}` },
            { type: 'error', content: '请先完成 Step 1，点击"继续 Step 2"' },
            { type: 'dim', content: '' },
          ]);
          setTerminalInput('');
        } else if (difficulty === 'beginner' && currentStep === 2) {
          setTerminalLines(prev => [
            ...prev,
            { type: 'input', content: `> ${terminalInput}` },
            { type: 'error', content: '请先完成 Step 2，点击"继续 Step 3"' },
            { type: 'dim', content: '' },
          ]);
          setTerminalInput('');
        } else {
          // For intermediate/expert, or beginner at step 3, run the review
          if (difficulty !== 'beginner' && currentStep !== 3) {
            setCurrentStep(3);
          }
          runReviewDemo();
        }
      } else if (cmd === 'clear') {
        setTerminalLines([
          { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
          { type: 'dim', content: '' },
        ]);
        setTerminalInput('');
      } else if (cmd) {
        setTerminalLines(prev => [
          ...prev,
          { type: 'input', content: `> ${terminalInput}` },
          { type: 'error', content: `Unknown command: ${terminalInput}` },
          { type: 'dim', content: '输入 /review 测试' },
          { type: 'dim', content: '' },
        ]);
        setTerminalInput('');
      }
    }
  };

  const focusTerminalInput = () => {
    inputRef.current?.focus();
  };

  const getLineStyle = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-400 font-semibold';
      case 'system': return 'text-blue-400';
      case 'success': return 'text-emerald-400 font-medium';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-500';
    }
  };

  // --- Editor Change Handler ---

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      setFiles((prev) => ({ ...prev, [activeTab]: value }));
    }
  };

  // Get language for Monaco based on file extension
  const getLanguage = (path: string) => {
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.md')) return 'markdown';
    return 'markdown';
  };

  // Check if file is read-only (test-code.js)
  const isReadOnly = activeTab === TEST_CODE_PATH;

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
        <FileText size={14} className={node.path.endsWith('.js') ? 'text-yellow-400' : 'text-blue-400'} />
        <span className="truncate">{node.name}</span>
      </div>
    );
  };

  // --- Render Guidance Panel Content ---

  const renderGuidanceContent = () => {
    if (difficulty === 'beginner') {
      if (currentStep === 1) {
        return (
          <div className="space-y-4">
            {/* Task Card */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">1</span>
                创建一个 Skill
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                <strong className="text-white">场景：</strong>你的团队希望在代码审查时有统一的规范标准。
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">任务：</strong>创建一个 <code className="bg-gray-700 px-1 rounded text-green-400">coding-standards</code> Skill。
              </p>
            </div>

            {/* Skill Structure Reference */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-1">
                <Lightbulb size={14} className="text-yellow-400" />
                Skill 结构参考
              </h4>
              <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-gray-900 p-2 rounded">{`# Skill 名称

简短描述这个 Skill 的用途。

## 规则
- 规则 1
- 规则 2

## 示例
好的做法 / 不好的做法`}</pre>
            </div>

            {/* Tips */}
            <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
              <h4 className="text-blue-300 text-sm font-medium mb-2">💡 提示</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Skill 格式自由，没有强制要求</li>
                <li>• 规则越具体，Claude 执行越准确</li>
                <li>• 提供正反示例有助于理解</li>
              </ul>
            </div>

            {/* Common Check Items */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">常见代码规范检查项</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ 变量/函数命名规范</li>
                <li>✓ 避免魔法数字</li>
                <li>✓ 使用 const/let 而非 var</li>
                <li>✓ 使用 === 而非 ==</li>
                <li>✓ 函数单一职责</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={goToStep2}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                继续 Step 2 →
              </button>
            </div>
          </div>
        );
      }

      if (currentStep === 2) {
        return (
          <div className="space-y-4">
            {/* Task Card */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">2</span>
                创建一个 Command
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                <strong className="text-white">任务：</strong>创建一个 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> Command。
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">要求：</strong>使用 <code className="bg-gray-700 px-1 rounded text-green-400">@skill:coding-standards</code> 引用 Skill。
              </p>
            </div>

            {/* Command Structure Reference */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-1">
                <Lightbulb size={14} className="text-yellow-400" />
                Command 结构参考
              </h4>
              <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-gray-900 p-2 rounded">{`# Command 名称

描述这个命令的功能。

## 引用 Skill
@skill:skill-name

## 执行步骤
1. 第一步操作
2. 第二步操作`}</pre>
            </div>

            {/* @skill reference explanation */}
            <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-3">
              <h4 className="text-purple-300 text-sm font-medium mb-2">🔗 @skill 引用说明</h4>
              <p className="text-xs text-gray-400 mb-2">
                使用 <code className="bg-gray-800 px-1 rounded">@skill:name</code> 引用已定义的 Skill
              </p>
              <code className="text-sm text-green-400 bg-gray-800 px-2 py-1 rounded block">
                @skill:coding-standards
              </code>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <button
                onClick={goToStep1}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors"
              >
                ← 返回 Step 1
              </button>
              <button
                onClick={goToStep3}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                继续 Step 3 →
              </button>
            </div>
          </div>
        );
      }

      // Step 3 - Test & Evaluation
      return (
        <div className="space-y-4">
          {/* Task Card */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">3</span>
              测试验证
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              <strong className="text-white">测试：</strong>右侧是一段有问题的代码（命名不规范、魔法数字、使用 var 等）。
            </p>
            <p className="text-gray-300 text-sm">
              <strong className="text-white">验证：</strong>在终端输入 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code>，看看你的 Skill 能发现多少问题。
            </p>
          </div>

          {/* Evaluation Results */}
          {showEvaluation && (
            <>
              {/* Score */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    检测能力评分
                  </span>
                  <span className="text-2xl font-bold text-green-400">6/8</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              {/* Detected Issues */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-400" />
                  已检测到的问题
                </h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ 函数命名不规范</li>
                  <li>✓ 变量命名不明确</li>
                  <li>✓ 魔法数字</li>
                  <li>✓ 使用 var 声明</li>
                  <li>✓ 使用 == 比较</li>
                </ul>
              </div>

              {/* Missed Issues */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  未检测到的问题
                </h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✗ 缺少函数注释/文档</li>
                  <li>✗ console.log 未清理</li>
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                <h4 className="text-blue-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <Lightbulb size={14} />
                  Skill 优化建议
                </h4>
                <ul className="text-xs text-gray-300 space-y-2">
                  <li>
                    <strong className="text-white">1. 添加注释规范：</strong>
                    <span className="text-gray-400">要求函数必须有 JSDoc 注释</span>
                  </li>
                  <li>
                    <strong className="text-white">2. 添加调试代码检查：</strong>
                    <span className="text-gray-400">检测并提醒移除 console.log</span>
                  </li>
                </ul>
              </div>

              {/* Export Section */}
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                <h4 className="text-green-300 text-sm font-medium mb-3 flex items-center gap-1">
                  <Download size={14} />
                  导出到本地
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  下载后将文件放到 <code className="bg-gray-800 px-1 rounded">~/.claude/</code> 目录即可使用
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={downloadSkill}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                  >
                    <FileDown size={14} />
                    下载 Skill
                  </button>
                  <button
                    onClick={downloadCommand}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                  >
                    <FileDown size={14} />
                    下载 Command
                  </button>
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors"
                  >
                    <Download size={14} />
                    全部下载
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-start pt-2">
            <button
              onClick={goBackToStep2}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors"
            >
              ← 返回修改 Skill
            </button>
          </div>
        </div>
      );
    }

    // Intermediate/Expert mode - compact guidance
    return (
      <div className="space-y-4">
        {/* Compact Task */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-2">
            {difficulty === 'expert' ? '🎯 挑战模式' : '📝 进阶模式'}
          </h3>
          <p className="text-gray-300 text-sm">
            创建一个代码审查系统（Skill + Command），使 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> 能检测代码问题。
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="flex gap-2">
          <button
            onClick={goToStep1}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Skill
          </button>
          <button
            onClick={goBackToStep2}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Command
          </button>
          <button
            onClick={goToStep3}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            测试
          </button>
        </div>

        {/* Evaluation Results for intermediate/expert */}
        {showEvaluation && (
          <>
            {/* Score */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  检测能力评分
                </span>
                <span className="text-2xl font-bold text-green-400">6/8</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Export Section */}
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
              <h4 className="text-green-300 text-sm font-medium mb-3 flex items-center gap-1">
                <Download size={14} />
                导出到本地
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadSkill}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                >
                  <FileDown size={14} />
                  Skill
                </button>
                <button
                  onClick={downloadCommand}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                >
                  <FileDown size={14} />
                  Command
                </button>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors"
                >
                  <Download size={14} />
                  全部
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Difficulty Selection Screen */}
      {!difficulty && (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
          <div className="max-w-3xl w-full px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">选择挑战难度</h1>
              <p className="text-gray-400">根据你对 Skill 的了解程度选择合适的难度</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Beginner */}
              <button
                onClick={() => selectDifficulty('beginner')}
                className="group bg-gray-800/50 hover:bg-green-900/30 border border-gray-700 hover:border-green-500 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <GraduationCap size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">新手模式</h3>
                    <span className="text-xs text-green-400">Beginner</span>
                  </div>
                </div>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <span>完整的 Step 1/2/3 引导</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <span>预置模板代码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <span>详细的参考示例</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">推荐首次使用者</span>
                </div>
              </button>

              {/* Intermediate */}
              <button
                onClick={() => selectDifficulty('intermediate')}
                className="group bg-gray-800/50 hover:bg-blue-900/30 border border-gray-700 hover:border-blue-500 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Zap size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">进阶模式</h3>
                    <span className="text-xs text-blue-400">Intermediate</span>
                  </div>
                </div>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <span>简化的步骤提示</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <span>基础模板结构</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <span>可随时运行测试</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">适合有一定经验者</span>
                </div>
              </button>

              {/* Expert */}
              <button
                onClick={() => selectDifficulty('expert')}
                className="group bg-gray-800/50 hover:bg-orange-900/30 border border-gray-700 hover:border-orange-500 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Trophy size={24} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">挑战模式</h3>
                    <span className="text-xs text-orange-400">Expert</span>
                  </div>
                </div>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>只给任务目标</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>空白编辑器</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>自由探索实现</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">适合熟练掌握者</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Practice Interface */}
      {difficulty && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Compact Top Bar */}
          <div className="bg-[#323233] border-b border-[#3c3c3c] px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Back button */}
              <button
                onClick={changeDifficulty}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={14} />
                返回
              </button>

              {/* Difficulty Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
                difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {difficulty === 'beginner' && <GraduationCap size={12} />}
                {difficulty === 'intermediate' && <Zap size={12} />}
                {difficulty === 'expert' && <Trophy size={12} />}
                {difficulty === 'beginner' ? '新手模式' : difficulty === 'intermediate' ? '进阶模式' : '挑战模式'}
              </div>

              {/* Steps indicator for beginner */}
              {difficulty === 'beginner' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className={`px-2 py-0.5 rounded ${currentStep === 1 ? 'bg-blue-500 text-white' : currentStep > 1 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    Step 1
                  </span>
                  <ChevronRight size={12} className="text-gray-600" />
                  <span className={`px-2 py-0.5 rounded ${currentStep === 2 ? 'bg-blue-500 text-white' : currentStep > 2 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    Step 2
                  </span>
                  <ChevronRight size={12} className="text-gray-600" />
                  <span className={`px-2 py-0.5 rounded ${currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    Step 3
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={resetPractice}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              重置
            </button>
          </div>

          {/* Main Content: Left Guidance + Right IDE */}
          <div className="flex-1 flex min-h-0">
            {/* Left: Guidance Panel (35%) */}
            <div className="w-[35%] bg-[#1a1a1a] border-r border-[#3c3c3c] flex flex-col shrink-0">
              <div className="flex-1 overflow-y-auto p-4">
                {renderGuidanceContent()}
              </div>
            </div>

            {/* Right: IDE (65%) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
              {/* IDE: File Tree + Editor */}
              <div className="flex-1 flex min-h-0">
                {/* File Tree Sidebar */}
                <div className="w-44 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
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
                    <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto shrink-0">
                      {openTabs.map((tab) => {
                        const fileName = tab.split('/').pop() || tab;
                        const isActiveTab = tab === activeTab;
                        return (
                          <div
                            key={tab}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] cursor-pointer border-r border-[#3c3c3c] shrink-0 ${
                              isActiveTab
                                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a] border-t-2 border-t-transparent'
                            }`}
                            onClick={() => setActiveTab(tab)}
                          >
                            <FileText size={13} className={tab.endsWith('.js') ? 'text-yellow-400' : 'text-blue-400'} />
                            <span className="truncate max-w-[120px]">{fileName}</span>
                            {tab === TEST_CODE_PATH && (
                              <span className="text-[10px] text-yellow-400 ml-1">只读</span>
                            )}
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
                        defaultLanguage={getLanguage(activeTab)}
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
                          readOnly: isReadOnly,
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
              <div className="border-t border-[#3c3c3c] flex flex-col bg-[#1e1e1e] shrink-0">
                {/* Terminal Header */}
                <div
                  className="flex items-center justify-between px-3 py-1 bg-[#252526] cursor-pointer select-none"
                  onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                >
                  <div className="flex items-center gap-1.5">
                    <TerminalIcon size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300 font-medium">Terminal</span>
                    <span className="text-xs text-gray-500">(/review)</span>
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
                    className="h-40 bg-[#0d0d0d] overflow-hidden flex flex-col cursor-text"
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
                          placeholder={isRunning ? '' : '输入 /review 测试...'}
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
          </div>
        </div>
      )}
    </div>
  );
}
