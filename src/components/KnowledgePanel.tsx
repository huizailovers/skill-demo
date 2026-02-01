'use client';

import { useState } from 'react';
import { BookOpen, FolderTree, FileCode, Play, Link, ChevronDown, ChevronRight, Layers, Settings, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

// Collapsible Section Component
function Section({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = true
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        <Icon size={18} className={iconColor} />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </section>
  );
}

// Code Block Component
function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      {title && (
        <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-300 font-mono">
          {title}
        </div>
      )}
      <pre className="p-3 bg-gray-900 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

export default function KnowledgePanel() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-4 bg-white">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Claude Code Skill 详解
        </h1>
        <p className="text-gray-600">
          深入理解 Skill 的设计理念、规范结构与实际应用
        </p>
      </div>

      {/* Section 1: What is Skill */}
      <Section title="什么是 Skill？" icon={BookOpen} iconColor="text-blue-500">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-blue-700">Skill</strong> 是 Claude Code 中的<strong>可复用知识模块</strong>，
              它封装了特定领域的最佳实践、规范和工作流程。Skill 不能被用户直接调用，而是作为
              <strong className="text-purple-600"> Command </strong>和<strong className="text-green-600"> Agent </strong>
              的"能力组件"被引用。
            </p>
          </div>

          <div>
            <h3 className="text-gray-800 font-medium mb-2">核心特征</h3>
            <div className="grid gap-2">
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
                <span className="text-blue-500 mt-0.5">📦</span>
                <div>
                  <span className="text-gray-800 text-sm font-medium">模块化</span>
                  <p className="text-gray-500 text-xs">每个 Skill 专注于单一领域，如 TDD、安全审查、代码规范等</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
                <span className="text-purple-500 mt-0.5">🔄</span>
                <div>
                  <span className="text-gray-800 text-sm font-medium">可复用</span>
                  <p className="text-gray-500 text-xs">一个 Skill 可被多个 Command/Agent 引用，避免重复定义</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
                <span className="text-green-500 mt-0.5">📋</span>
                <div>
                  <span className="text-gray-800 text-sm font-medium">声明式</span>
                  <p className="text-gray-500 text-xs">通过 Markdown 定义，包含 frontmatter 元数据和详细指导</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
                <span className="text-orange-500 mt-0.5">🎯</span>
                <div>
                  <span className="text-gray-800 text-sm font-medium">上下文感知</span>
                  <p className="text-gray-500 text-xs">通过 description 字段让 Claude 理解何时该激活此 Skill</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-800 font-medium mb-2">Skill 解决的问题</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span><strong>知识固化</strong> - 将团队积累的最佳实践转化为可执行指令</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span><strong>一致性保障</strong> - 确保所有成员遵循相同的规范和流程</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span><strong>降低认知负担</strong> - 无需记忆复杂流程，Skill 会自动指导执行</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span><strong>持续改进</strong> - 更新 Skill 后所有引用它的组件自动获得改进</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Section 2: Three Pillars */}
      <Section title="三大核心组件对比" icon={Layers} iconColor="text-purple-500">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Claude Code 的配置体系由三大核心组件构成，它们各司其职又相互协作：
          </p>

          <div className="grid gap-3">
            {/* Command */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📁</span>
                <h4 className="text-blue-700 font-semibold">Command (命令)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">存放位置</p>
                  <code className="bg-white px-2 py-1 rounded text-blue-600">commands/*.md</code>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">调用方式</p>
                  <code className="bg-white px-2 py-1 rounded text-blue-600">/commit, /plan</code>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">用途</p>
                  <p className="text-gray-700">用户可直接调用的快捷指令，定义完整的任务流程</p>
                </div>
              </div>
            </div>

            {/* Skill */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📦</span>
                <h4 className="text-purple-700 font-semibold">Skill (技能)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">存放位置</p>
                  <code className="bg-white px-2 py-1 rounded text-purple-600">skills/*/SKILL.md</code>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">调用方式</p>
                  <span className="bg-white px-2 py-1 rounded text-gray-500">不可直接调用</span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">用途</p>
                  <p className="text-gray-700">可复用的知识模块，被 Command/Agent 引用以获得特定能力</p>
                </div>
              </div>
            </div>

            {/* Agent */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <h4 className="text-green-700 font-semibold">Agent (代理)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">存放位置</p>
                  <code className="bg-white px-2 py-1 rounded text-green-600">agents/*.md</code>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">调用方式</p>
                  <span className="bg-white px-2 py-1 rounded text-gray-500">由 Task 工具调用</span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">用途</p>
                  <p className="text-gray-700">专门化的子代理，执行特定类型的复杂任务（如代码审查、TDD）</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-yellow-700 text-sm font-medium mb-2">💡 关系类比</h4>
            <div className="text-gray-600 text-xs space-y-1">
              <p><strong>Command</strong> = 餐厅菜单上的菜品（顾客可以直接点）</p>
              <p><strong>Skill</strong> = 后厨的标准食谱（定义如何制作）</p>
              <p><strong>Agent</strong> = 专业厨师（专注于某一类菜品）</p>
            </div>
          </div>

          {/* Relationship Diagram */}
          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-2">协作关系</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-blue-700 font-medium">
                  /commit
                </div>
                <span className="text-gray-400">→ 引用 →</span>
                <div className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-purple-700 font-medium">
                  git-conventions
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm mt-2">
                <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-green-700 font-medium">
                  tdd-guide agent
                </div>
                <span className="text-gray-400">→ 引用 →</span>
                <div className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-purple-700 font-medium">
                  tdd-workflow
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 3: Skill File Format */}
      <Section title="Skill 文件格式详解" icon={FileCode} iconColor="text-orange-500">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Skill 文件采用 <strong>Markdown + YAML Frontmatter</strong> 格式，结构清晰且易于维护：
          </p>

          <CodeBlock title="skills/tdd-workflow/SKILL.md">{`---
name: tdd-workflow
description: Use this skill when writing new features,
  fixing bugs, or refactoring code. Enforces test-driven
  development with 80%+ coverage.
---

# Test-Driven Development Workflow

This skill ensures all code follows TDD principles.

## When to Activate
- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code

## Core Principles

### 1. Tests BEFORE Code
ALWAYS write tests first, then implement code.

### 2. Coverage Requirements
- Minimum 80% coverage
- All edge cases covered
- Error scenarios tested

## TDD Workflow Steps

### Step 1: Write Failing Tests
\`\`\`typescript
describe('UserService', () => {
  it('creates user with valid data', async () => {
    // Test implementation
  })
})
\`\`\`

### Step 2: Implement Code
Write minimal code to make tests pass.

### Step 3: Refactor
Improve code quality while keeping tests green.`}</CodeBlock>

          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-3">文件结构解析</h4>
            <div className="space-y-3">
              {/* Frontmatter */}
              <div className="border border-orange-200 rounded-lg overflow-hidden">
                <div className="bg-orange-50 px-3 py-2 border-b border-orange-200">
                  <span className="text-orange-700 font-medium text-sm">1. Frontmatter (必需)</span>
                </div>
                <div className="p-3 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-orange-600 shrink-0">name</code>
                      <span className="text-gray-600">Skill 的唯一标识符，用于引用</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-orange-600 shrink-0">description</code>
                      <span className="text-gray-600">详细描述，帮助 Claude 判断何时激活此 Skill</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* When to Activate */}
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-200">
                  <span className="text-blue-700 font-medium text-sm">2. When to Activate (推荐)</span>
                </div>
                <div className="p-3 text-sm text-gray-600">
                  列出触发此 Skill 的场景，让 Claude 明确知道什么时候该应用这些规则
                </div>
              </div>

              {/* Core Content */}
              <div className="border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-3 py-2 border-b border-green-200">
                  <span className="text-green-700 font-medium text-sm">3. Core Principles (核心)</span>
                </div>
                <div className="p-3 text-sm text-gray-600">
                  定义核心原则和规则，这是 Skill 的主要价值所在
                </div>
              </div>

              {/* Workflow */}
              <div className="border border-purple-200 rounded-lg overflow-hidden">
                <div className="bg-purple-50 px-3 py-2 border-b border-purple-200">
                  <span className="text-purple-700 font-medium text-sm">4. Workflow Steps (可选)</span>
                </div>
                <div className="p-3 text-sm text-gray-600">
                  具体的执行步骤，包含代码示例和最佳实践
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-blue-700 text-sm font-medium mb-2">📝 description 字段的重要性</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              <code className="bg-white px-1 rounded">description</code> 是 Claude 决定是否激活 Skill 的关键。
              应该清晰描述：<strong>什么情况下使用</strong>、<strong>能解决什么问题</strong>、<strong>提供什么能力</strong>。
              写得越具体，Claude 的判断就越准确。
            </p>
          </div>
        </div>
      </Section>

      {/* Section 4: Directory Structure */}
      <Section title="目录结构与作用域" icon={FolderTree} iconColor="text-yellow-500">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Skill 支持两种作用域：<strong>全局级别</strong>（用户目录）和<strong>项目级别</strong>：
          </p>

          <div className="grid gap-3">
            {/* Global */}
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-3 py-2 border-b border-blue-200 flex items-center gap-2">
                <span className="text-blue-600">🌐</span>
                <span className="text-blue-700 font-medium text-sm">全局 Skills（所有项目共享）</span>
              </div>
              <div className="p-3">
                <CodeBlock>{`~/.claude/
├── skills/
│   ├── git-conventions/
│   │   └── SKILL.md
│   ├── coding-standards/
│   │   └── SKILL.md
│   └── security-review/
│       └── SKILL.md
├── commands/
│   └── commit.md
└── agents/
    └── reviewer.md`}</CodeBlock>
              </div>
            </div>

            {/* Project */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-3 py-2 border-b border-green-200 flex items-center gap-2">
                <span className="text-green-600">📁</span>
                <span className="text-green-700 font-medium text-sm">项目 Skills（仅当前项目）</span>
              </div>
              <div className="p-3">
                <CodeBlock>{`your-project/
├── .claude/
│   ├── skills/
│   │   ├── api-design/
│   │   │   └── SKILL.md
│   │   └── db-migrations/
│   │       └── SKILL.md
│   └── commands/
│       └── deploy.md
├── src/
└── package.json`}</CodeBlock>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-yellow-700 text-sm font-medium mb-2">⚠️ 优先级规则</h4>
            <p className="text-gray-600 text-xs">
              当全局和项目存在同名 Skill 时，<strong>项目级别优先</strong>。
              这允许项目覆盖全局配置以满足特定需求。
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-2">命名约定</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <code className="bg-white px-2 py-0.5 rounded text-purple-600">skills/skill-name/SKILL.md</code>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">标准格式（推荐）</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <code className="bg-white px-2 py-0.5 rounded text-purple-600">skills/skill-name/skill.md</code>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">小写也可以</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 5: Practical Examples */}
      <Section title="实战 Skill 示例" icon={Zap} iconColor="text-green-500">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            以下是几个常用的 Skill 示例，展示不同场景下的最佳实践：
          </p>

          {/* Example 1: Coding Standards */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <span className="font-medium text-sm text-gray-700">示例 1：coding-standards（代码规范）</span>
            </div>
            <CodeBlock>{`---
name: coding-standards
description: Universal coding standards for TypeScript,
  React, and Node.js. Apply when writing or reviewing code.
---

# Coding Standards

## Variable Naming
- Use camelCase for variables: \`userName\`
- Use PascalCase for components: \`UserProfile\`
- Use UPPER_SNAKE_CASE for constants: \`MAX_RETRIES\`

## TypeScript Rules
- NO \`any\` type - always define proper types
- Use interfaces for object shapes
- Enable strict mode

## React Patterns
- Functional components only
- Custom hooks for reusable logic
- Props interface for every component`}</CodeBlock>
          </div>

          {/* Example 2: Security Review */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <span className="font-medium text-sm text-gray-700">示例 2：security-review（安全审查）</span>
            </div>
            <CodeBlock>{`---
name: security-review
description: Security vulnerability detection. Use when
  reviewing code that handles user input, authentication,
  API endpoints, or sensitive data.
---

# Security Review Checklist

## Critical Checks
- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (escape output)

## Authentication
- [ ] Passwords properly hashed (bcrypt/argon2)
- [ ] JWT tokens have expiration
- [ ] Session management secure

## OWASP Top 10
- Injection, Broken Auth, XSS, CSRF, etc.`}</CodeBlock>
          </div>

          {/* Example 3: API Design */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <span className="font-medium text-sm text-gray-700">示例 3：backend-patterns（后端模式）</span>
            </div>
            <CodeBlock>{`---
name: backend-patterns
description: Backend architecture patterns, API design,
  and database optimization for Node.js and Next.js.
---

# Backend Patterns

## API Response Format
\`\`\`typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
\`\`\`

## Error Handling
- Use custom ApiError class
- Centralized error handler
- Proper HTTP status codes

## Database
- Repository pattern for data access
- Avoid N+1 queries
- Use transactions for multi-step operations`}</CodeBlock>
          </div>
        </div>
      </Section>

      {/* Section 6: How to Use */}
      <Section title="如何使用 Skill" icon={Play} iconColor="text-blue-500">
        <div className="space-y-4">
          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-2">方式一：自动激活</h4>
            <p className="text-gray-600 text-sm mb-3">
              Claude 会根据 <code className="bg-gray-100 px-1 rounded">description</code> 自动判断是否需要激活某个 Skill。
              当你的请求匹配 Skill 的描述时，Claude 会自动应用其中的规则。
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2">用户请求：</p>
              <p className="text-sm text-gray-700 mb-3">"帮我写一个用户注册的 API"</p>
              <p className="text-xs text-gray-500 mb-2">Claude 自动激活：</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">backend-patterns</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">security-review</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">coding-standards</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-2">方式二：通过 Command 引用</h4>
            <p className="text-gray-600 text-sm mb-3">
              Command 可以显式声明依赖的 Skill，确保执行时加载相关规则：
            </p>
            <CodeBlock title="commands/commit.md">{`---
description: Generate and commit with conventional format
---

# Commit Command

Uses: @skill:git-conventions

## Workflow
1. Run git status and git diff
2. Analyze changes
3. Generate commit message per git-conventions
4. Execute git commit`}</CodeBlock>
          </div>

          <div>
            <h4 className="text-gray-800 text-sm font-medium mb-2">执行流程图解</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded p-2 text-sm text-gray-700">
                  用户输入 <code className="text-blue-600 bg-white px-1 rounded">/commit</code>
                </div>
              </div>
              <div className="w-7 border-l-2 border-gray-300 ml-3.5 h-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded p-2 text-sm text-gray-700">
                  加载 <code className="text-blue-600 bg-white px-1 rounded">commands/commit.md</code>
                </div>
              </div>
              <div className="w-7 border-l-2 border-gray-300 ml-3.5 h-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div className="flex-1 bg-purple-50 border border-purple-200 rounded p-2 text-sm text-gray-700">
                  解析并加载 <code className="text-purple-600 bg-white px-1 rounded">skills/git-conventions/SKILL.md</code>
                </div>
              </div>
              <div className="w-7 border-l-2 border-gray-300 ml-3.5 h-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <div className="flex-1 bg-green-50 border border-green-200 rounded p-2 text-sm text-gray-700">
                  执行 workflow，应用 Skill 中的规则
                </div>
              </div>
              <div className="w-7 border-l-2 border-gray-300 ml-3.5 h-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                <div className="flex-1 bg-green-50 border border-green-200 rounded p-2 text-sm text-gray-700">
                  输出符合规范的 commit message
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 7: Best Practices */}
      <Section title="Skill 编写最佳实践" icon={Settings} iconColor="text-gray-500">
        <div className="space-y-4">
          <div className="grid gap-3">
            {/* Do */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-3 py-2 border-b border-green-200 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-green-700 font-medium text-sm">推荐做法</span>
              </div>
              <div className="p-3">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>精确的 description</strong> - 明确说明激活场景</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>提供代码示例</strong> - 用示例展示期望的格式</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>包含正反例</strong> - 用 ✅/❌ 对比好坏实践</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>保持聚焦</strong> - 每个 Skill 专注一个领域</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>可操作指令</strong> - 使用祈使句而非描述句</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Don't */}
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-3 py-2 border-b border-red-200 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-red-700 font-medium text-sm">避免做法</span>
              </div>
              <div className="p-3">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span><strong>模糊的描述</strong> - 如 "通用编程技能"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span><strong>过于庞大</strong> - 一个 Skill 包含所有内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span><strong>重复定义</strong> - 多个 Skill 有重叠内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span><strong>缺少示例</strong> - 只有抽象规则没有具体示例</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-blue-700 text-sm font-medium mb-2">💡 设计原则</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              好的 Skill 应该像一位<strong>经验丰富的导师</strong>：不仅告诉你"该做什么"，
              还要说明"为什么这样做"，并通过具体示例展示"怎么做"。
              Claude 读取 Skill 后应该能立即理解并正确应用这些规则。
            </p>
          </div>
        </div>
      </Section>

      {/* Section 8: Summary */}
      <Section title="总结" icon={BookOpen} iconColor="text-indigo-500" defaultOpen={false}>
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium shrink-0">本质</span>
                <span className="text-gray-700">Skill 是可复用的知识模块，封装领域最佳实践</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium shrink-0">格式</span>
                <span className="text-gray-700">YAML Frontmatter (name, description) + Markdown 内容</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium shrink-0">位置</span>
                <span className="text-gray-700">~/.claude/skills/ (全局) 或 .claude/skills/ (项目)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium shrink-0">调用</span>
                <span className="text-gray-700">通过 Command/Agent 引用，或 Claude 自动激活</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium shrink-0">价值</span>
                <span className="text-gray-700">标准化流程、知识复用、持续改进</span>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs">
            掌握 Skill 是高效使用 Claude Code 的关键一步 🚀
          </div>
        </div>
      </Section>

      {/* Footer spacing */}
      <div className="h-6"></div>
    </div>
  );
}
