const list = [
    { title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', available: true,stars:100},
    { title: '你不知道的JavaScript', author: 'Kyle Simpson', available: false,stars:77},
    { title: 'JavaScript权威指南', author: 'David Flanagan', available: true,stars:60 },
    { title: 'ES6标准入门', author: '阮一峰', available: false,stars:48 }
];
const availableBooks = (books)=>{
if (books.length===0){
   return `无可借阅书籍！`;}
return books.filter(book=>book.available);

}
const unavailableBooks=(books)=>books.filter(book=>!book.available);
const toGrade=(stars)=>{
    if(stars>=90) return`很受欢迎`;
    if(stars>=70) return`较受欢迎`;
    if(stars>=60) return`受欢迎`;
    return `默默无闻`;
}
const gradeCount=(books)=>{
const result = { 很受欢迎: 0, 较受欢迎: 0, 受欢迎: 0, 默默无闻: 0 };
    books.forEach(t => {
        result[toGrade(t.stars)]++;
       
    });
 return result;}
const highest=(books)=>books.reduce((max,s)=>(s.stars>max.stars?s:max),books[0]);
console.log(`可借阅书籍：`, availableBooks(list));
console.log(`不可借阅书籍:`, unavailableBooks(list));
console.log("各等级统计：", gradeCount(list));
console.log("星星最高书籍：", highest(list));