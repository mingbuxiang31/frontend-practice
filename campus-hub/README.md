# 校园信息与数据展示中心（campus-hub）

前端综合实践期末大作业：围绕校园公共信息服务主题的响应式前端应用。
技术范围：jQuery、Bootstrap、ECharts、Chart.js、A-Frame，均来自课堂讲授内容；无需后端服务器。

## 运行说明

1. 安装 Chrome 或 Edge 浏览器（需联网加载 CDN：jQuery / Bootstrap / ECharts / Chart.js）。
2. 进入本仓库 campus-hub 目录，双击 `index.html` 即可在浏览器打开首页；
   或在本目录启动本地服务：`python -m http.server 8080` 后访问 <http://localhost:8080>。
3. 页面结构：
   - `index.html` 信息首页：功能入口卡片 + 最新公告摘要（fetch 加载 data/notice.json）
   - `notice.html` 公告中心（功能页 1）：关键词搜索、分类筛选、发布公告（添加）
   - `data.html` 数据看板（功能页 2）：ECharts 柱状图、Chart.js 环形图、A-Frame 三维校园场景
4. 三维场景引用同仓库 `../three-d/campus.html`（A-Frame，使用 three-d/libs 离线库，断网可看）。

## 功能与要求对照

| 要求 | 实现 |
| --- | --- |
| 信息首页 + 至少 2 个功能页面 | index.html、notice.html、data.html |
| 响应式适配手机与桌面 | css/style.css 媒体查询：≤900px 两栏、≤640px 单列、导航纵向排列 |
| 交互查询/管理模块 | 公告搜索、分类筛选、发布公告（jQuery 事件委托 + 表单校验） |
| 基于 JSON 的数据加载 | data/notice.json、data/stat.json，fetch + async 处理 |
| 至少两类有效图表 | ECharts 分组柱状图（自习区占用趋势）+ Chart.js 环形图（场馆预约占比） |
| 三维展示区域 | iframe 嵌入 A-Frame 校园角（教学楼、旗杆、路灯、动画） |
| 完整错误提示 | 统一 #status 状态栏：加载中（蓝）/失败（红，显示原因）/成功（绿）；fetch 判断 res.ok，JSON 字段校验，图表库缺失提示，input 转义防 XSS |
| jQuery / Bootstrap 至少一种 | 同时使用：jQuery 3.7.1（交互）+ Bootstrap 5.3.3（CSS 类） |
| Three.js / A-Frame 至少一种 | A-Frame（three-d/campus.html，three-d/libs 本地库） |

## 目录结构

```
campus-hub/
├── index.html        # 信息首页
├── notice.html       # 公告中心
├── data.html         # 数据看板
├── css/style.css     # 全局样式与响应式
├── js/app.js         # 公共脚本（导航高亮、状态栏、错误提示）
├── js/notice.js      # 公告：加载/搜索/筛选/添加
├── js/data.js        # 看板：fetch + 两张图表渲染
└── data/
    ├── notice.json   # 公告数据（6 条）
    └── stat.json     # 统计数据（趋势 + 分类占比）
../three-d/           # Three.js 旋转展示台 + A-Frame 校园角（本地离线库）
```

## 已知限制

- 公告“发布”仅在本页内存中生效，刷新后恢复初始数据（无后端，不持久化）。
- CDN 资源需联网；三维场景使用本地库，断网可正常显示。
