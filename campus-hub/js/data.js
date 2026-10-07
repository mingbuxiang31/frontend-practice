/**
 * 数据看板：fetch 加载 stat.json，渲染 ECharts 柱状图 + Chart.js 环形图
 * 数据源：data/stat.json
 */
var barChartIns = null;
var pieChartIns = null;

function renderBarChart(data) {
  var dom = document.getElementById("barChart");
  if (typeof echarts === "undefined") { showStatus("ECharts 加载失败，请检查网络后刷新。", "error"); return; }
  barChartIns = echarts.init(dom);
  barChartIns.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: data.series.map(function (s) { return s.category; }) },
    xAxis: { type: "category", data: data.months },
    yAxis: { type: "value", name: "占用率(%)", max: 100 },
    series: data.series.map(function (s) {
      return { name: s.category, type: "bar", data: s.counts, barMaxWidth: 28 };
    })
  });
  window.addEventListener("resize", function () { barChartIns.resize(); });
}

function renderPieChart(data) {
  var ctx = document.getElementById("pieChart").getContext("2d");
  if (typeof Chart === "undefined") { showStatus("Chart.js 加载失败，请检查网络后刷新。", "error"); return; }
  pieChartIns = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: ["#42a5f5", "#66bb6a", "#ffa726", "#ab47bc"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

$(function () {
  showStatus("正在加载统计数据…", "info");
  fetch("data/stat.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data.roomTrend || !data.venueType) throw new Error("统计数据字段缺失");
      renderBarChart(data.roomTrend);
      renderPieChart(data.venueType);
      showStatus("图表渲染完成", "ok", 2);
    })
    .catch(function (err) { showError(err, "统计加载"); });
});
