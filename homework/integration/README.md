# 校园公共信息与数据展示中心

前端课程期末大作业原型：以「校园公共信息与数据展示中心」为主题（延续前几次作业的校园三维 + 图书馆借阅看板风格），把课堂所学的六个模块整合进**一个统一入口**，全部模块由同一份 `data/data.json` 串联，而不是四个孤立页面。

## 运行方式

需要通过本地 HTTP 服务器打开（因为 `fetch` 加载 JSON 在 `file://` 下会被浏览器拦截）：

```bash
# 方式一：VS Code 安装 Live Server 插件，右键 index.html -> Open with Live Server（推荐）

# 方式二：Python 自带服务器（在本目录执行）
cd integration
python -m http.server 8000
# 然后浏览器访问 http://localhost:8000
```

> 直接双击 `index.html` 也可以打开，页面会自动降级为内置演示数据（顶部会出现黄色提示条），功能不受影响，但建议按上面方式运行以体验完整的 JSON 加载流程。

## 目录结构

```
integration/
├── index.html          统一入口（导航 + 五个区块）
├── css/style.css       自定义样式（在 Bootstrap 之后引入，含三档响应式）
├── js/app.js           交互逻辑（公告 CRUD、筛选搜索、双图表渲染）
├── data/data.json      唯一数据源（公告、借阅统计、三维建筑）
├── three-d/scene.html  三维展示页（A-Frame，由 data.json 驱动）
└── README.md
```

## 模块对照表

| 序号 | 作业要求 | 实现位置 | 对应课堂 |
|------|----------|----------|----------|
| 1 | 页面结构 | `index.html`：header/nav/main/section/footer 语义化骨架 + 固定导航 + 滚动监听高亮 | 课堂一、二 |
| 2 | 样式与响应式 | `css/style.css`：CSS 变量主题、覆盖 Bootstrap；手机(<576px)/平板(576~991px)/桌面(≥992px)三档媒体查询 + Bootstrap 栅格 | 课堂二、三 |
| 3 | 交互 | 公告板：表单校验发布、分类筛选、关键字搜索、点赞、删除（`js/app.js`） | 课堂四、五 |
| 4 | 数据 | `fetch` 加载 `data/data.json`；加载中/失败降级/成功三种状态；公告增删存 `localStorage`，可一键恢复初始数据 | 课堂五、六 |
| 5 | 可视化 | 两类图表：ECharts 柱状图（图书馆各月借阅量）+ Chart.js 环形图（公告分类占比，随公告增删实时更新） | 课堂六 |
| 6 | 三维展示（加分） | `three-d/scene.html`：A-Frame 校园场景，建筑列表由 `data.json` 的 `buildings` 字段动态生成，点击建筑查看介绍（iframe 嵌入主页面，也可独立打开） | 课堂七 |

## 模块衔接（数据流）

```
data/data.json（唯一数据源）
 ├─ site 字段 ────────────> 首页横幅标题、更新时间
 ├─ announcements 字段 ──> 公告板初始数据 ──(增删/点赞)──> localStorage 持久化
 │        └──(实时统计分类)──> Chart.js 环形图
 ├─ library 字段 ────────> ECharts 各月借阅量柱状图 + 首页统计卡
 └─ buildings 字段 ──────> 三维页动态生成建筑（scene.html fetch 同一文件）
```

交互与可视化直接联动：在公告板发布或删除公告，环形图与首页"在办公告"统计卡会同步变化。

## 质量自查清单

- [x] 统一入口 + 导航可达全部模块，非孤立页面
- [x] 语义化标签：header / nav / main / section / article / footer
- [x] 自定义样式在 Bootstrap 之后引入，用 CSS 变量统一主题色
- [x] 三档响应式（手机 / 平板 / 桌面），导航在小屏折叠
- [x] 表单有必填校验（Bootstrap was-validated 样式）
- [x] 用户输入渲染前做了 HTML 转义（防注入的编码习惯）
- [x] JSON 加载有加载中 / 失败 / 成功三种状态处理
- [x] 两类以上图表（柱状图 + 环形图），窗口缩放自适应
- [x] 三维场景数据驱动、可交互（点击建筑高亮 + 信息卡）
- [x] 公告修改保存在 localStorage，刷新不丢失，可恢复初始数据

## 提交建议

```bash
git add integration/
git commit -m "feat: 期末原型-校园公共信息与数据展示中心（六模块整合）"
```
