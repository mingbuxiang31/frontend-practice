/* =========================================================
 * 校园公共信息与数据展示中心 - js/app.js
 * 模块三（交互）+ 模块四（数据）+ 模块五（可视化）
 * 数据链路：data/data.json ─┬─ 首页统计与横幅
 *                          ├─ 公告板（CRUD + localStorage 持久化）
 *                          ├─ 环形图（实时统计公告分类）
 *                          └─ 三维页 three-d/scene.html（buildings 字段）
 * ========================================================= */

const STORAGE_KEY = 'campus-hub-announcements-v1';
const CATEGORIES = ['通知', '活动', '讲座', '失物招领'];

// file:// 直接打开时 fetch 会被浏览器拦截，降级使用这份数据（与 data/data.json 内容一致）
const EMBEDDED_DATA = {
  site: { title: '校园公共信息与数据展示中心', slogan: '一页看校园：通知公告 · 借阅数据 · 三维导览', updatedAt: '2026-09-18' },
  announcements: [
    { id: 1, title: '关于2026年秋季学期选修课补选的通知', category: '通知', author: '教务处', date: '2026-09-15', content: '补选时间为9月20日9:00至9月22日17:00，请同学们登录教务系统完成操作，逾期不再受理。', likes: 12 },
    { id: 2, title: '第十八届校园运动会志愿者招募', category: '活动', author: '校团委', date: '2026-09-16', content: '招募裁判助理、引导员、后勤组志愿者共80名，报名截止9月25日，欢迎各学院同学参与。', likes: 30 },
    { id: 3, title: '人工智能前沿讲座：大模型与智能体', category: '讲座', author: '计算机学院', date: '2026-09-17', content: '9月26日14:00在学术报告厅举行，凭校园卡入场，座位有限先到先得。', likes: 21 },
    { id: 4, title: '失物招领：图书馆三楼拾到黑色保温杯', category: '失物招领', author: '图书馆服务台', date: '2026-09-17', content: '请失主携带有效证件到图书馆一楼服务台认领，认领时间为每日8:00-20:00。', likes: 5 },
    { id: 5, title: '国庆假期图书馆开放时间调整', category: '通知', author: '图书馆', date: '2026-09-18', content: '10月1日至10月3日开放时间为9:00-16:00，其余时间照常开放，请相互转告。', likes: 18 }
  ],
  library: {
    months: ['4月', '5月', '6月', '7月', '8月', '9月'],
    series: [
      { category: '文学类', counts: [120, 190, 150, 220, 180, 240] },
      { category: '理工类', counts: [90, 130, 170, 140, 160, 200] },
      { category: '社科类', counts: [70, 110, 95, 130, 150, 170] }
    ]
  }
};

// 应用状态：筛选条件、关键字、当前公告都存在这里（模块四：状态处理）
const state = {
  data: null,          // data.json 原始数据
  announcements: [],   // 当前公告（含用户新增，可能来自 localStorage）
  filter: '全部',
  keyword: ''
};

let barChart = null;      // ECharts 实例：各月借阅量
let doughnutChart = null; // Chart.js 实例：公告分类占比

$(function () {
  loadSiteData();
});

/* ---------- 模块四：数据加载与状态处理 ---------- */
async function loadSiteData() {
  const $status = $('#loadStatus');
  $status.removeClass('d-none alert-danger').addClass('alert-warning').text('数据加载中…');
  try {
    const res = await fetch('data/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    applyData(await res.json());
    $status.addClass('d-none');
  } catch (err) {
    // 降级：fetch 失败（file:// 打开或断网）时使用内置数据，页面依然可用
    applyData(EMBEDDED_DATA);
    $status.removeClass('alert-warning').addClass('alert-danger')
      .text(`在线数据加载失败（${err.message}），已降级为内置演示数据；请通过本地服务器打开以获得完整体验。`);
  }
}

function applyData(data) {
  state.data = data;
  // 本地保存优先：用户增删过的公告存在 localStorage 里
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    state.announcements = saved ? JSON.parse(saved) : data.announcements.slice();
  } catch { state.announcements = data.announcements.slice(); }
  initPage();
}

function initPage() {
  // 横幅与页脚
  $('#siteTitle').text(state.data.site.title);
  $('#siteSlogan').text(state.data.site.slogan);
  $('#updatedAt').text('数据更新：' + state.data.site.updatedAt);
  $('#footerDate').text(state.data.site.updatedAt);

  // 快捷统计：三个数字分别来自公告、借阅、三维建筑数据，体现模块衔接
  const totalBorrow = state.data.library.series
    .reduce((sum, s) => sum + s.counts.reduce((a, b) => a + b, 0), 0);
  $('#statAnnounce').text(state.announcements.length);
  $('#statBorrow').text(totalBorrow);
  $('#statBuilding').text(state.data.buildings.length);

  bindEvents();
  renderAnnouncements();
  renderBarChart(state.data.library);
  renderDoughnutChart();
}

/* ---------- 模块三：交互事件绑定 ---------- */
function bindEvents() {
  // 分类筛选
  $('#filterGroup').on('click', 'button', function () {
    $('#filterGroup button').removeClass('active');
    $(this).addClass('active');
    state.filter = $(this).data('cat');
    renderAnnouncements();
  });

  // 关键字搜索
  $('#searchInput').on('input', function () {
    state.keyword = $(this).val().trim();
    renderAnnouncements();
  });

  // 发布公告（表单校验 -> 新增 -> 保存 -> 渲染 -> 环形图联动）
  $('#publishForm').on('submit', function (e) {
    e.preventDefault();
    const form = this;
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    state.announcements.unshift({
      id: Date.now(),
      title: $('#formTitle').val().trim(),
      category: $('#formCategory').val(),
      author: $('#formAuthor').val().trim(),
      date: new Date().toISOString().slice(0, 10),
      content: $('#formContent').val().trim(),
      likes: 0
    });
    saveLocal();
    form.reset();
    form.classList.remove('was-validated');
    bootstrap.Collapse.getOrCreateInstance(form).hide();
    renderAnnouncements();
    updateDoughnut();
    $('#statAnnounce').text(state.announcements.length);
    showToast('发布成功，环形图已同步更新');
  });

  // 点赞 / 删除（事件委托，列表是动态渲染的）
  $('#announcementList')
    .on('click', '.btn-like', function () {
      const item = findAnnouncement(this);
      item.likes++;
      saveLocal();
      renderAnnouncements();
    })
    .on('click', '.btn-del', function () {
      const id = Number($(this).data('id'));
      const item = state.announcements.find(a => a.id === id);
      if (item && !confirm(`确定删除「${item.title}」吗？`)) return;
      state.announcements = state.announcements.filter(a => a.id !== id);
      saveLocal();
      renderAnnouncements();
      updateDoughnut();
      $('#statAnnounce').text(state.announcements.length);
      showToast('已删除，环形图已同步更新');
    });

  // 恢复初始数据（清空 localStorage，便于测试）
  $('#btnResetData').on('click', function () {
    if (!confirm('将清除本机保存的修改，恢复为 data.json 初始公告，确定吗？')) return;
    localStorage.removeItem(STORAGE_KEY);
    state.announcements = state.data.announcements.slice();
    renderAnnouncements();
    updateDoughnut();
    $('#statAnnounce').text(state.announcements.length);
    showToast('已恢复初始数据');
  });
}

function findAnnouncement(btnEl) {
  const id = Number($(btnEl).data('id'));
  return state.announcements.find(a => a.id === id);
}

/* ---------- 公告列表渲染 ---------- */
function renderAnnouncements() {
  const list = state.announcements
    .filter(a => state.filter === '全部' || a.category === state.filter)
    .filter(a => !state.keyword || (a.title + a.content).includes(state.keyword))
    .sort((a, b) => b.date.localeCompare(a.date)); // 新的在前

  $('#boardCount').text(`共 ${list.length} 条`);
  $('#emptyTip').toggleClass('d-none', list.length > 0);
  $('#announcementList').html(list.map(postCardHtml).join(''));
}

function postCardHtml(a) {
  const safeTitle = escHtml(a.title);
  const safeContent = escHtml(a.content);
  const safeAuthor = escHtml(a.author);
  return `
  <article class="col-12 col-md-6 col-lg-4">
    <div class="card post-card h-100 shadow-sm">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start">
          <span class="badge" data-cat="${a.category}">${a.category}</span>
          <small class="text-muted">${a.date}</small>
        </div>
        <h5 class="card-title mt-2 mb-1">${safeTitle}</h5>
        <p class="card-text small flex-grow-1">${safeContent}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">来源：${safeAuthor}</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-danger btn-like" data-id="${a.id}">赞（${a.likes}）</button>
            <button class="btn btn-outline-secondary btn-del" data-id="${a.id}" aria-label="删除公告">删除</button>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

// 防止用户输入的 HTML 被当作标签执行（安全习惯）
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

/* ---------- 模块四：本地保存 ---------- */
function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.announcements));
}

/* ---------- 模块五：可视化 ---------- */
// 图表一：ECharts 柱状图，各月借阅量（数据来自 data.json 的 library 字段）
function renderBarChart(library) {
  barChart = echarts.init(document.getElementById('barChart'));
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: library.series.map(s => s.category) },
    grid: { left: 45, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: library.months },
    yAxis: { type: 'value', name: '册' },
    series: library.series.map((s, i) => ({
      name: s.category,
      type: 'bar',
      data: s.counts,
      itemStyle: { color: ['#1565c0', '#2e7d32', '#f57f17'][i % 3] }
    }))
  });
  window.addEventListener('resize', () => barChart.resize());
}

// 图表二：Chart.js 环形图，实时统计当前公告的分类占比（与公告板联动）
function renderDoughnutChart() {
  doughnutChart = new Chart(document.getElementById('doughnutChart'), {
    type: 'doughnut',
    data: {
      labels: CATEGORIES,
      datasets: [{
        data: countByCategory(),
        backgroundColor: ['#1565c0', '#2e7d32', '#f57f17', '#00838f']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function countByCategory() {
  return CATEGORIES.map(cat =>
    state.announcements.filter(a => a.category === cat).length
  );
}

function updateDoughnut() {
  if (!doughnutChart) return;
  doughnutChart.data.datasets[0].data = countByCategory();
  doughnutChart.update();
}

/* ---------- 提示气泡 ---------- */
function showToast(message) {
  const $el = $(`
    <div class="toast align-items-center text-bg-primary border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${escHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  $('#toastBox').append($el);
  const toast = new bootstrap.Toast($el[0], { delay: 2200 });
  $el[0].addEventListener('hidden.bs.toast', () => $el.remove());
  toast.show();
}
