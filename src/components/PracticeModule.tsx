'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronRight, RotateCcw, CheckCircle, AlertTriangle, Lightbulb, Download, FileDown, Zap, GraduationCap, Trophy, ArrowLeft } from 'lucide-react';

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
1. 获取代码变更
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

// Step 1: Skill template (default for backward compatibility)
const skillTemplate = skillTemplates.beginner;

// Step 2: Command template
const commandTemplate = commandTemplates.beginner;

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

export default function PracticeModule() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [skillCode, setSkillCode] = useState(skillTemplate);
  const [commandCode, setCommandCode] = useState(commandTemplate);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
    { type: 'dim', content: '' },
    { type: 'system', content: '📝 创建一个 Skill' },
    { type: 'dim', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Select difficulty and initialize
  const selectDifficulty = (level: DifficultyLevel) => {
    if (!level) return;
    setDifficulty(level);
    setSkillCode(skillTemplates[level]);
    setCommandCode(commandTemplates[level]);

    const initialLines: TerminalLine[] = [
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ];

    if (level === 'beginner') {
      initialLines.push(
        { type: 'system', content: '📝 Step 1: 创建一个 Skill' },
        { type: 'dim', content: '在左侧编辑器中编写 Skill 定义' },
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
    downloadFile(skillCode, 'skill.md');
  };

  const downloadCommand = () => {
    downloadFile(commandCode, 'review.md');
  };

  const downloadAll = () => {
    // Download skill
    downloadFile(skillCode, 'coding-standards-skill.md');
    // Download command after a small delay
    setTimeout(() => {
      downloadFile(commandCode, 'review-command.md');
    }, 100);
  };

  const getSkillName = () => {
    const match = commandCode.match(/@skill:([a-z-]+)/);
    return match ? match[1] : 'coding-standards';
  };

  const goToStep2 = () => {
    setCurrentStep(2);
    if (difficulty === 'beginner') {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Step 1 完成！' },
        { type: 'dim', content: '' },
        { type: 'system', content: '📝 Step 2: 创建一个 Command' },
        { type: 'dim', content: '在左侧编辑器中编写 Command 定义' },
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
    if (difficulty === 'beginner') {
      setTerminalLines(prev => [
        ...prev,
        { type: 'success', content: '✓ Step 2 完成！' },
        { type: 'dim', content: '' },
        { type: 'system', content: '🧪 Step 3: 测试你的 Skill' },
        { type: 'dim', content: '左侧是一段有问题的代码' },
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

  const resetPractice = () => {
    setDifficulty(null);
    setCurrentStep(1);
    setSkillCode(skillTemplate);
    setCommandCode(commandTemplate);
    setShowEvaluation(false);
    setTerminalLines([
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ]);
  };

  const changeDifficulty = () => {
    setDifficulty(null);
    setCurrentStep(1);
    setShowEvaluation(false);
    setTerminalLines([
      { type: 'dim', content: 'Claude Code v2.1.0 - Practice Mode' },
      { type: 'dim', content: '' },
    ]);
  };

  const runReviewDemo = () => {
    setIsRunning(true);
    setTerminalLines(prev => [...prev, { type: 'input', content: `> ${input}` }, { type: 'dim', content: '' }]);
    setInput('');

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
        setTimeout(() => addLine(index + 1), 100);
      } else {
        setIsRunning(false);
        if (isStep3) {
          setTimeout(() => setShowEvaluation(true), 500);
        }
      }
    };

    setTimeout(() => addLine(0), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRunning) {
      const cmd = input.trim().toLowerCase();
      if (cmd === '/review') {
        // Beginner mode requires completing steps first
        if (difficulty === 'beginner' && currentStep === 1) {
          setTerminalLines(prev => [
            ...prev,
            { type: 'input', content: `> ${input}` },
            { type: 'error', content: '请先完成 Step 1，点击"继续 Step 2"' },
            { type: 'dim', content: '' },
          ]);
          setInput('');
        } else if (difficulty === 'beginner' && currentStep === 2) {
          setTerminalLines(prev => [
            ...prev,
            { type: 'input', content: `> ${input}` },
            { type: 'error', content: '请先完成 Step 2，点击"继续 Step 3"' },
            { type: 'dim', content: '' },
          ]);
          setInput('');
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
        setInput('');
      } else if (cmd) {
        setTerminalLines(prev => [
          ...prev,
          { type: 'input', content: `> ${input}` },
          { type: 'error', content: `Unknown command: ${input}` },
          { type: 'dim', content: '输入 /review 测试' },
          { type: 'dim', content: '' },
        ]);
        setInput('');
      }
    }
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

  const getCurrentCode = () => {
    if (currentStep === 1) return skillCode;
    if (currentStep === 2) return commandCode;
    return testCode;
  };

  const setCurrentCode = (value: string) => {
    if (currentStep === 1) setSkillCode(value);
    else if (currentStep === 2) setCommandCode(value);
  };

  const getCurrentFile = () => {
    if (currentStep === 1) return '~/.claude/skills/coding-standards/skill.md';
    if (currentStep === 2) return '~/.claude/commands/review.md';
    return 'test-code.js (待审查代码)';
  };

  const isReadOnly = currentStep === 3;

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
        <>
          {/* Step Indicator & Task Description */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-700 p-4">
            {/* Header with difficulty badge and controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Back to difficulty selection */}
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
              </div>

              <button
                onClick={resetPractice}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                重置
              </button>
            </div>

            {/* Steps - Only show for beginner mode */}
            {difficulty === 'beginner' && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-green-500/20 text-green-400'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                  创建 Skill
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 2 ? 'bg-blue-500 text-white' : currentStep > 2 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                  创建 Command
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
                  测试验证
                </div>
              </div>
            )}

            {/* Compact steps for intermediate */}
            {difficulty === 'intermediate' && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-green-500/20 text-green-400'
                }`}>
                  Skill
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 2 ? 'bg-blue-500 text-white' : currentStep > 2 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  Command
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  测试
                </div>
              </div>
            )}

            {/* Current Task - Beginner Mode */}
            {difficulty === 'beginner' && currentStep === 1 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">
                  📦 Step 1: 创建一个 Skill
                </h2>
                <div className="bg-gray-800/50 rounded-lg p-3 mb-3 text-sm">
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">场景：</strong>你的团队希望在代码审查时有统一的规范标准，避免每次 review 都要重复说明相同的规则。
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">任务：</strong>创建一个 <code className="bg-gray-700 px-1 rounded text-green-400">coding-standards</code> Skill，定义团队的代码规范，包括命名规则、代码风格、最佳实践等。
                  </p>
                  <p className="text-gray-400 text-xs">
                    提示：Skill 格式自由，可以包含规则列表、示例代码、检查项等任何你认为有用的内容。
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={goToStep2}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                  >
                    继续 Step 2 →
                  </button>
                </div>
              </>
            )}

            {difficulty === 'beginner' && currentStep === 2 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">
                  📁 Step 2: 创建一个 Command 并引用 Skill
                </h2>
                <div className="bg-gray-800/50 rounded-lg p-3 mb-3 text-sm">
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">任务：</strong>创建一个 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> Command，当用户输入这个命令时，自动执行代码审查。
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">要求：</strong>使用 <code className="bg-gray-700 px-1 rounded text-green-400">@skill:coding-standards</code> 引用你在 Step 1 创建的 Skill，让审查过程遵循统一的规范。
                  </p>
                  <p className="text-gray-400 text-xs">
                    提示：Command 通常包含执行步骤（Workflow），定义 Claude 应该按什么顺序完成任务。
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors"
                  >
                    ← 返回 Step 1
                  </button>
                  <button
                    onClick={goToStep3}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                  >
                    继续 Step 3 →
                  </button>
                </div>
              </>
            )}

            {difficulty === 'beginner' && currentStep === 3 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">
                  🧪 Step 3: 测试验证
                </h2>
                <div className="bg-gray-800/50 rounded-lg p-3 mb-3 text-sm">
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">测试：</strong>左侧是一段有问题的代码，包含命名不规范、魔法数字、使用 var 等问题。
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">验证：</strong>在终端输入 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code>，看看你的 Skill 能发现多少问题。
                  </p>
                </div>
                <div className="flex items-center justify-start">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors"
                  >
                    ← 返回修改 Skill
                  </button>
                </div>
              </>
            )}

            {/* Intermediate Mode - Compact task description */}
            {difficulty === 'intermediate' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-300">
                    {currentStep === 1 && (
                      <span>定义 <code className="bg-gray-700 px-1 rounded text-green-400">coding-standards</code> Skill</span>
                    )}
                    {currentStep === 2 && (
                      <span>创建 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> Command，引用 <code className="bg-gray-700 px-1 rounded text-purple-400">@skill:coding-standards</code></span>
                    )}
                    {currentStep === 3 && (
                      <span>输入 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> 测试</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStep === 1 && (
                      <button onClick={goToStep2} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                        下一步 →
                      </button>
                    )}
                    {currentStep === 2 && (
                      <>
                        <button onClick={() => setCurrentStep(1)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">
                          ←
                        </button>
                        <button onClick={goToStep3} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                          测试 →
                        </button>
                      </>
                    )}
                    {currentStep === 3 && (
                      <button onClick={() => setCurrentStep(2)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">
                        ← 修改
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Expert Mode - Minimal */}
            {difficulty === 'expert' && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  <span className="text-orange-400 font-medium">🎯 挑战：</span> 创建一个代码审查系统（Skill + Command），使 <code className="bg-gray-700 px-1 rounded text-green-400">/review</code> 能检测代码问题
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {currentStep === 1 && <span>编辑 Skill</span>}
                  {currentStep === 2 && <span>编辑 Command</span>}
                  {currentStep === 3 && <span>测试中</span>}
                  {currentStep !== 3 && (
                    <>
                      <button
                        onClick={() => setCurrentStep(currentStep === 1 ? 2 : 1)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs"
                      >
                        切换 {currentStep === 1 ? 'Command' : 'Skill'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex min-h-0">
            {/* Left - Editor (Always visible) */}
            <div className="w-1/2 flex flex-col border-r border-gray-700">
              <div className="px-4 py-2 bg-[#252525] border-b border-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-mono">{getCurrentFile()}</span>
                {isReadOnly && (
                  <span className="text-xs text-yellow-400">只读</span>
                )}
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage={currentStep === 3 ? 'javascript' : 'markdown'}
                  theme="vs-dark"
                  value={getCurrentCode()}
                  onChange={(value) => setCurrentCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 16 },
                    readOnly: isReadOnly,
                  }}
                />
              </div>
            </div>

            {/* Right - Reference Panel or Terminal */}
            <div className="w-1/2 flex flex-col bg-[#0d0d0d]">
              {/* Beginner: Reference Panel for Step 1&2, Terminal for Step 3 */}
              {/* Intermediate/Expert: Always show Terminal */}
              {difficulty === 'beginner' && currentStep !== 3 ? (
                /* Reference Panel for Beginner Step 1 & 2 */
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb size={18} className="text-yellow-400" />
                    参考示例
                  </h3>

                  {currentStep === 1 ? (
                    /* Step 1: Skill Reference */
                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Skill 结构参考</h4>
                        <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{`# Skill 名称

简短描述这个 Skill 的用途。

## 规则
- 规则 1
- 规则 2
- 规则 3

## 示例
好的做法：
\`\`\`
代码示例
\`\`\`

不好的做法：
\`\`\`
代码示例
\`\`\``}</pre>
                      </div>

                      <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                        <h4 className="text-blue-300 text-sm font-medium mb-2">💡 提示</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• Skill 格式自由，没有强制要求</li>
                          <li>• 规则越具体，Claude 执行越准确</li>
                          <li>• 提供正反示例有助于理解</li>
                        </ul>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">常见代码规范检查项</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>✓ 变量/函数命名规范</li>
                          <li>✓ 避免魔法数字</li>
                          <li>✓ 使用 const/let 而非 var</li>
                          <li>✓ 使用 === 而非 ==</li>
                          <li>✓ 函数单一职责</li>
                          <li>✓ 添加必要注释</li>
                          <li>✓ 移除调试代码</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: Command Reference */
                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Command 结构参考</h4>
                        <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{`# Command 名称

描述这个命令的功能。

## 引用 Skill
@skill:skill-name

## 执行步骤
1. 第一步操作
2. 第二步操作
3. 第三步操作

## 输出格式
定义输出的格式要求`}</pre>
                      </div>

                      <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                        <h4 className="text-blue-300 text-sm font-medium mb-2">💡 提示</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• 使用 <code className="bg-gray-700 px-1 rounded">@skill:name</code> 引用 Skill</li>
                          <li>• 执行步骤要清晰、有序</li>
                          <li>• 可以引用多个 Skill</li>
                        </ul>
                      </div>

                      <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-3">
                        <h4 className="text-purple-300 text-sm font-medium mb-2">🔗 你的 Skill</h4>
                        <p className="text-xs text-gray-400 mb-2">
                          在 Step 1 创建的 Skill 可以通过以下方式引用：
                        </p>
                        <code className="text-sm text-green-400 bg-gray-800 px-2 py-1 rounded block">
                          @skill:coding-standards
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Terminal for all other cases */
                <>
                  <div className="px-4 py-2 bg-[#1a1a1a] border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-gray-400 font-mono">
                      {difficulty === 'beginner' ? '测试终端' : '终端'}
                    </span>
                    <div className="w-16"></div>
                  </div>

                  {/* Terminal */}
                  <div className={`${showEvaluation ? 'h-1/2' : 'flex-1'} p-4 font-mono text-sm overflow-y-auto`}>
                    {terminalLines.map((line, index) => (
                      <div key={index} className={`${getLineStyle(line.type)} leading-6 whitespace-pre`}>
                        {line.content || '\u00A0'}
                      </div>
                    ))}
                    <div className="flex items-center leading-6">
                      <span className="text-green-400 mr-1">&gt;</span>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isRunning}
                        className="flex-1 bg-transparent text-gray-100 outline-none font-mono"
                        placeholder={isRunning ? '' : '输入 /review 测试...'}
                      />
                      {!isRunning && <span className="text-gray-400 cursor-blink">▋</span>}
                    </div>
                  </div>

                  {/* Evaluation Panel */}
                  {showEvaluation && (
                    <div className="h-1/2 border-t border-gray-700 overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-400" />
                          Skill 测评结果
                        </h3>

                        <div className="space-y-3">
                          {/* Score */}
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">检测能力评分</span>
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

                          {/* Suggestions - Only show for beginner/intermediate */}
                          {difficulty !== 'expert' && (
                            <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                              <h4 className="text-blue-300 text-sm font-medium mb-2 flex items-center gap-1">
                                <Lightbulb size={14} />
                                Skill 优化建议
                              </h4>
                              <ul className="text-xs text-gray-300 space-y-2">
                                <li>
                                  <strong className="text-white">1. 添加注释规范：</strong>
                                  <span className="text-gray-400">要求函数必须有 JSDoc 注释说明用途和参数</span>
                                </li>
                                <li>
                                  <strong className="text-white">2. 添加调试代码检查：</strong>
                                  <span className="text-gray-400">检测并提醒移除 console.log 等调试语句</span>
                                </li>
                                <li>
                                  <strong className="text-white">3. 添加更多示例：</strong>
                                  <span className="text-gray-400">为每条规则提供正反示例，让 Claude 更好理解</span>
                                </li>
                              </ul>
                            </div>
                          )}

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
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
