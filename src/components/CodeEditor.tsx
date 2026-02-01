'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

const gitConventionsSkill = `# Git Conventions Skill

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

## Validation Checklist
提交前自动检查：
- [ ] 不包含敏感文件 (.env, credentials)
- [ ] 不包含大型二进制文件 (>10MB)
- [ ] 已通过 pre-commit hooks
- [ ] commit message 符合规范
`;

export default function CodeEditor() {
  const [code, setCode] = useState(gitConventionsSkill);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-sm text-gray-400 font-mono">~/.claude/skills/git-conventions/skill.md</span>
        <div className="w-20"></div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16 },
            readOnly: false,
          }}
        />
      </div>
    </div>
  );
}
