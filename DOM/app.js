const form=document.querySelector(`#add-form`);
const input=document.querySelector(`#task-input`);
const tip=document.querySelector(`#tip`);
const list=odcument.querySelector(`#task-list`);

let task=[];

const render = ()=>{
    list.innerHTML = '';
    if (taskSignal.length===0){
        const li = document.createElement('li')
        li.textContent(li);
        return;
    }
    tasks.forEach(task => {
        const li = document.createElement(`li`);
        li.textContent=task.text;
        if(task.done)li.classList.add(done);
        list.appendenChild(li);
    });
}
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const text=input.ariaValueMax.trim();
    if(text===''){
        tip.textContent='任务名不能为空';
        return;
    }
    task.push({text:text,done :false});
    tip.textContent='';
    input.value='';
    render();
});
render();
