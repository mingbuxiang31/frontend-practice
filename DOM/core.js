let movieList = load();

function load() {
    try {
        const data = JSON.parse(localStorage.getItem("movieData"));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

const saveStorage = () => {
    localStorage.setItem("movieData", JSON.stringify(movieList));
};

const setErr = (text) => {
    document.querySelector(".errMsg").innerText = text;
};
const clearErr = () => {
    document.querySelector(".errMsg").innerText = "";
};

const render = () => {
    const tbody = document.querySelector(".tableBody");
    tbody.innerHTML = "";
    movieList.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.director}</td>
            <td>${item.score}</td>
            <td>
                <button class="btnEdit" data-index="${index}">修改</button>
                <button class="btnDel" data-index="${index}">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    bindTableBtn();
};

const bindTableBtn = () => {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.onclick = () => openEdit(Number(btn.dataset.index));
    });
    document.querySelectorAll(".btnDel").forEach(btn => {
        btn.onclick = () => delMovie(Number(btn.dataset.index));
    });
};

const openEdit = (idx) => {
    document.querySelector(".editPanel").style.display = "block";
    const obj = movieList[idx];
    document.querySelector(".editIdx").value = idx;
    document.querySelector(".eName").value = obj.name;
    document.querySelector(".eDirector").value = obj.director;
    document.querySelector(".eScore").value = obj.score;
};

const closeEdit = () => {
    document.querySelector(".editPanel").style.display = "none";
};

const addMovie = () => {
    clearErr();
    const name = document.querySelector(".mName").value.trim();
    const director = document.querySelector(".mDirector").value.trim();
    const score = Number(document.querySelector(".mScore").value.trim());

    if (!name) { setErr("电影名称不能为空"); return; }
    if (!director) { setErr("导演不能为空"); return; }
    if (isNaN(score) || score < 0 || score > 10) { setErr("评分必须0‑10数字"); return; }

    movieList.push({ name, director, score });
    saveStorage();
    render();

    document.querySelector(".mName").value = "";
    document.querySelector(".mDirector").value = "";
    document.querySelector(".mScore").value = "";
};

const delMovie = (idx) => {
    movieList.splice(idx, 1);
    saveStorage();
    render();
};

const saveEdit = () => {
    clearErr();
    const idx = Number(document.querySelector(".editIdx").value);
    const name = document.querySelector(".eName").value.trim();
    const director = document.querySelector(".eDirector").value.trim();
    const score = Number(document.querySelector(".eScore").value.trim());

    if (!name) { setErr("电影名称不能为空"); return; }
    if (!director) { setErr("导演不能为空"); return; }
    if (isNaN(score) || score < 0 || score > 10) { setErr("评分必须0‑10数字"); return; }

    movieList[idx] = { name, director, score };
    saveStorage();
    render();
    closeEdit();
};

document.querySelector(".btnAdd").addEventListener("click", addMovie);
document.querySelector(".btnSaveEdit").addEventListener("click", saveEdit);
document.querySelector(".btnCancel").addEventListener("click", closeEdit);

render();