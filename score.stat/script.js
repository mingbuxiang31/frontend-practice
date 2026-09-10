const scores=[
    {name:'李四',score:92},
    { name: '王五', score: 45 },
     { name: '赵六', score: 77 }, 
     { name: '孙七', score: 59 },
      { name: '周八', score: 88 },
       { name: '吴九', score: 105 },
       { name: '郑十', score: -5 }
]
const cleanScores=(list)=>list.filter(s=>s.score>=0&&s.score<=100);
const averageScore=(list)=>{
    if (list.length===0) return 0;
    const total=list.reduce((sum,s)=>sum+s.score,0);
    return (total/list.length).toFixed(2);
}
const highest=(list)=>list.reduce((max,s)=>s.score>max.score?s:max ,list[0]);
const failed=(list)=>list.filter(s=>s.score<60).map(s=>s.name);
console.log('有效成绩:',cleanScores(scores));
console.log('平均成绩:',averageScore(cleanScores(scores)));
console.log('最高成绩:',highest(cleanScores(scores)));
console.log('不及格学生:',failed(cleanScores(scores)));

const toGrade=(score)=>{
    if (score>=90) return 'A';
    if (score>=80) return 'B';
    if (score>=70) return 'C';
    if(score>60)return 'D';
    return "F";
}
const gradecount=(list)=>{
    const result={A:0,B:0,C:0,D:0,F:0};
    list.forEach(s=>{result[toGrade(s.score)]++});
    return result;
}
const report=(list)=>{
    const valid=cleanScores(list);
    if(valid.length===0){
        console.log('没有有效的成绩记录。');
    }
    const dist=gradecount(valid);
    return `有效人数: ${valid.length},平均${averageScore(valid)}分,最高${highest(valid)}分,${highest(valid).name},等级分布:a${dist.A}人,b${dist.B}人,c${dist.C}人,d${dist.D}人,f${dist.F}人,
        不及格名单: ${failed(valid).join(',')}`;

    }
    try{
        console.log(report(scores));
    }catch(error){
        console.error('发生错误:',error.message);
    }
