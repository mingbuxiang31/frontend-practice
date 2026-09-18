const state = { data: null };
let barChartIns = null;
let lineChartIns = null;

// 加载数据
async function loadData() {
  const $status = $('#status');
  $status.text('加载中...').show();
  try {
    const res = await fetch('books.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jsonData = await res.json();
    state.data = jsonData;
    $status.hide();
    renderCards(jsonData);
    renderBarChart(jsonData);
    renderLineChart(jsonData);
  } catch (err) {
    $status.text(`加载失败: ${err.message}`).show();
  }
}

// 渲染统计卡片
function renderCards(data) {
  const $wrap = $('#cards');
  $wrap.empty();
  data.series.forEach(item => {
    const total = item.counts.reduce((a,b)=>a+b,0);
    const cardHtml = `
    <div class="col-md-6 col-lg-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${item.category}</h5>
          <p class="card-text fs-4">总借阅：${total}</p>
          <p class="text-muted">6个月合计</p>
        </div>
      </div>
    </div>`;
    $wrap.append(cardHtml);
  })
}

// ECharts柱状图
function renderBarChart(data) {
  const dom = document.getElementById('barChart');
  barChartIns = echarts.init(dom);
  const opt = {
    title:{text:"各月借阅量"},
    tooltip:{trigger:"axis"},
    xAxis:{type:"category", data:data.months},
    yAxis:{type:"value"},
    series: data.series.map(s=>({
      name:s.category,
      type:"bar",
      data:s.counts
    }))
  }
  barChartIns.setOption(opt);
  window.addEventListener('resize',()=>barChartIns.resize());
}

// Chart.js折线图
function renderLineChart(data) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  const datasets = data.series.map(s=>({
    label:s.category,
    data:s.counts,
    borderWidth:2,
    fill:false
  }))
  lineChartIns = new Chart(ctx,{
    type:"line",
    data:{labels:data.months, datasets:datasets},
    options:{responsive:true, maintainAspectRatio:false}
  })
}

// 卡片点击高亮（作业第四步）
$('#cards').on('click','.card',function(){
  $(this).toggleClass('border-primary shadow');
})

// 启动
$(function(){
  loadData();
})
