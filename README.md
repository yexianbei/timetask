# 律师事务所时间管理系统

一款专为律师事务所设计的日程管理与时间追踪软件，支持任务管理、计时功能、案件管理和统计分析。

## 功能特性

### 1. 日历视图（Calendar）
- 显示本周的日历视图（周一至周日）
- 当天任务列表，显示任务名称和对应时间段
- 支持点击任务修改时间段
- 支持任务的上下拖动来调整时间

### 2. 计时功能（Time Tracking）
- 每个任务都有计时功能
- 可设置每小时的费用，精确到秒
- 最小计时单元可设置为 30 分钟
- 计时结束时展示已计时的时间和费用
- 计时过程中实时更新显示已计时的时间和收入

### 3. 案件管理（Case Management）
- 老板为案件设置收费，并分配给指定的员工
- 员工为案件中的任务记录工时
- 根据员工工时和薪资，计算案件的成本与利润

### 4. 统计面板（Statistics）
- 展示本周的工作统计（客户数量、消耗的时间、总收入、总成本和利润）
- 查看每个案件的工作进度
- 展示员工每月的工作时间、收入和薪资，支持图表展示

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **图表**: Recharts
- **日期处理**: date-fns
- **数据存储**: localStorage (可替换为数据库)

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. Vercel 会自动检测 Next.js 项目并完成部署

或者使用 Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 项目结构

```
time/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── Calendar.tsx       # 日历组件
│   ├── TaskList.tsx       # 任务列表组件
│   ├── TaskModal.tsx      # 任务编辑模态框
│   ├── TimeTracker.tsx    # 计时器组件
│   ├── CaseManagement.tsx # 案件管理组件
│   └── Statistics.tsx     # 统计面板组件
├── lib/                   # 工具函数
│   ├── utils.ts          # 通用工具函数
│   └── storage.ts        # 数据存储工具
├── types/                 # TypeScript 类型定义
│   └── index.ts          # 数据模型类型
└── public/               # 静态资源
```

## 数据模型

- **Task**: 任务（标题、时间、费率、状态等）
- **TimeEntry**: 时间记录（任务ID、开始/结束时间、时长、费用等）
- **Case**: 案件（名称、总收费、分配员工、任务列表等）
- **Employee**: 员工（姓名、时薪等）
- **Statistics**: 统计数据

## 注意事项

- 当前使用 localStorage 存储数据，生产环境建议替换为数据库
- 所有时间计算基于秒数，确保精确度
- 最小计时单元默认为 30 分钟
- 支持中文界面和日期格式

## 许可证

MIT

