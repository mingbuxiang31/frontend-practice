/**
 * 公告中心交互：fetch 加载 JSON + 筛选/搜索/添加（jQuery 实现）
 * 数据源：data/notice.json
 */
var notices = []; // 原始数据
var nextId = 100; // 新发布公告的本地 id（不与初始数据冲突）

function renderNoticeList() {
  var keyword = $("#keyword").val().trim().toLowerCase();
  var type = $("#typeFilter").val();
  var filtered = notices.filter(function (n) {
    var hitKw = !keyword || n.title.toLowerCase().indexOf(keyword) > -1 || n.content.toLowerCase().indexOf(keyword) > -1;
    var hitType = !type || n.type === type;
    return hitKw && hitType;
  });

  if (filtered.length === 0) {
    $("#noticeList").empty();
    $("#emptyTip").show();
    return;
  }
  $("#emptyTip").hide();
  var sorted = filtered.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  var html = "";
  sorted.forEach(function (n) {
    var tagCls = n.type === "紧急" ? "tag urgent" : "tag";
    html += '<div class="notice-item">'
          +   '<span class="date">' + n.date + '</span>'
          +   '<span class="' + tagCls + '">' + n.type + '</span>'
          +   "<h4>" + escapeHtml(n.title) + "</h4>"
          +   "<p>" + escapeHtml(n.content) + "</p>"
          + "</div>";
  });
  $("#noticeList").html(html);
  showStatus("共 " + filtered.length + " 条公告" + (filtered.length < notices.length ? "（已筛选）" : ""), "ok", 2);
}

/** 防 XSS：把用户输入转义后再拼到 HTML */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/** 表单校验：标题、分类、日期、内容均不能为空 */
function addNotice(n) {
  if (!n.title || !n.title.trim()) return showStatus("标题不能为空", "error");
  if (!n.type) return showStatus("请选择分类", "error");
  if (!n.date) return showStatus("请选择日期", "error");
  if (!n.content || !n.content.trim()) return showStatus("内容不能为空", "error");
  notices.unshift({ id: nextId++, title: n.title.trim(), type: n.type, date: n.date, content: n.content.trim() });
  renderNoticeList();
  showStatus("发布成功！（数据仅在当前页面有效，刷新后恢复初始数据）", "ok", 4);
}

$(function () {
  showStatus("正在加载公告数据…", "info");
  fetch("data/notice.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (list) {
      if (!Array.isArray(list)) throw new Error("数据格式错误：应为数组");
      notices = list;
      $("#fDate").val(new Date().toISOString().slice(0, 10));
      renderNoticeList();
    })
    .catch(function (err) { showError(err, "公告加载"); });

  // 搜索与筛选：输入即时生效
  $("#keyword, #typeFilter").on("input change", renderNoticeList);

  // 添加公告
  $("#addForm").on("submit", function (e) {
    e.preventDefault();
    addNotice({ title: $("#fTitle").val(), type: $("#fType").val(), date: $("#fDate").val(), content: $("#fContent").val() });
    if ($("#fTitle").val().trim() && $("#fType").val() && $("#fDate").val() && $("#fContent").val().trim()) {
      this.reset();
      $("#fDate").val(new Date().toISOString().slice(0, 10));
    }
  });
});
