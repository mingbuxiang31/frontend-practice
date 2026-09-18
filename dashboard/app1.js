const state = { data: null };
let barChart = null;
let lineChart = null;

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const res = await fetch('consume.json');
    if (!res.ok) throw new Error("请求错误");
    const data = await res.json();

    if(data.series.length === 0){
      $('#status').text("暂无数据").show();
      return;
    }

    state.data = data;
    $('#sub-title').text(data.title + " · 数据来源：本地模拟数据集");
    $('#status').hide();

    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);

  } catch (err) {
    $('#status').text("加载失败："+err.message).show();
  }
};

const renderCards = (data) => {
  data.series.forEach(s=>{
    let total = s.counts.reduce((a,b)=>a+b,0);
    $('#cards').append(`
      <div class="col-6 col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>${s.category}</h5>
            <p>总消费：${total}</p>
          </div>
        </div>
      </div>
    `);
  });
};

const renderBarChart = (data) => {
  if(!barChart) barChart = echarts.init(document.querySelector("#bar-chart"));
  barChart.setOption({
    title:{text:"月度消费柱状图",left:"center"},
    tooltip:{trigger:"axis"},
    xAxis:{data:data.months},
    yAxis:{name:"金额"},
    series:data.series.map(s=>({
      name:s.category,
      type:"bar",
      data:s.counts
    }))
  });
};

const renderLineChart = (data) => {
  if(lineChart) lineChart.destroy();
  let ctx = document.querySelector("#line-chart");
  lineChart = new Chart(ctx,{
    type:"line",
    data:{
      labels:data.months,
      datasets:data.series.map(s=>({
        label:s.category,
        data:s.counts,
        borderWidth:1
      }))
    },
    options:{
      responsive:true,
      maintainAspectRatio:false
    }
  });
};

window.onresize = ()=>{
  if(barChart) barChart.resize();
};

$('#cards').on('click','.card',function(){
  $(this).toggleClass('shadow border-primary');
});

loadData();
