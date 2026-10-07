/**
 * 公共脚本：导航高亮、状态栏（加载中/错误提示）
 * 依赖：jQuery 3.x
 */
$(function () {
  // 根据当前页面高亮导航
  var page = location.pathname.split("/").pop() || "index.html";
  $(".navbar .links a").each(function () {
    var href = $(this).attr("href");
    if (href === page || (page === "" && href === "index.html")) {
      $(this).addClass("active");
    }
  });
});

/** 显示状态栏：type = info | error | ok，seconds 后自动隐藏（0 表示不自动隐藏） */
function showStatus(msg, type, seconds) {
  var $s = $("#status");
  $s.removeClass("info error ok").addClass(type).text(msg).show();
  if (seconds) {
    setTimeout(function () { $s.fadeOut(); }, seconds * 1000);
  }
}

/** 统一错误提示：网络/解析/运行异常都走这里，保证用户看得到失败原因 */
function showError(err, context) {
  var msg = err && err.message ? err.message : String(err);
  console.error("[" + context + "]", err);
  showStatus(context + "失败：" + msg + "，请刷新重试或检查数据文件是否存在。", "error");
}
