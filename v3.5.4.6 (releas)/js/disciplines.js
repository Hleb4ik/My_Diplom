import { Notification } from "./modal.js"

var dl = null, dm = null

export function getDisciplines(){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines.json`)
    .then(response => response.json())
    .then(response => {
        dl = ``
        dm = ``
        Object.keys(response).map(key => {
            dl += `
            <div class="dis-list">
                <div class="dis-remove" data-name="${key}">&times;</div> 
                <p>${response[key].name}</p>
                <div class="dis-edit" data-dis-name="${response[key].name}" data-link="${key}" data-bs-toggle="modal" data-bs-target="#exampleModalEdtDis">&seArr;</div> 
            </div>
            `
            //Лист выбора дисциплины при загрузке файлов
            document.querySelector('.list').innerHTML += `
            <option value="${key}">${response[key].name}</option>
            `
            //------------------------------------------------
            addDiscipline(response[key].name, key)
        })
        document.querySelector('.disciplines-list').innerHTML = dl
        document.querySelector('.mainMenu-content').innerHTML = dm
        document.querySelector('.animate-menu-div').classList.add('animate__fadeInDown')//Добавление анимации появления блоку
  })
}

export function getToken(){
    return sessionStorage.getItem('RP_XB1ON_11')
}

function addDiscipline(name, key){
    dm += `<div class="div-btn-mainMenu"><button class="btn-mainMenu" data-name="${name}" data-dis-key="${key}" data-bs-toggle="modal" data-bs-target="#exampleModalDisInfo">${name}</button></div>`
}

export function addDisciplineInDB(name){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines.json?auth=${getToken()}`, {
        method: 'POST',
        body: JSON.stringify({
            name
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (response.name) {
            reloadDisLists()
            Notification('Дисциплина успешно добавлена!')
        }
    })
}

const disList = document.querySelector('.disciplines-list')
disList.addEventListener('click', removeHandler)

function removeHandler(event) {
    if (!event.target.dataset.name && !event.target.dataset.link) {
        return
    }
    if (event.target.dataset.name){
        const {name} = event.target.dataset
        const block = disList.querySelector(`[data-name="${name}"]`).closest('.dis-list')
        
        removingDiscipline(name, block)
    }
    if (event.target.dataset.link){
        const {link} = event.target.dataset
        document.querySelector('#dispNameE').value = event.target.dataset.disName
        document.querySelector('.edit-btn').innerHTML = `
        <button class="btn" data-bs-dismiss="modal" id="${link}">Редактировать</button>  
        `//Это фикс, он же костыль))
        document.querySelector(`#${link}`).addEventListener('click', function(){
            changeDisName(link, document.querySelector('#dispNameE').value)
        }) //Баг, изменяется как хочет||НЕ АКТУАЛЬНО!!! ПОФИКШЕНО!!!
    }
}

function removingDiscipline(name, block){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines/${name}.json?auth=${getToken()}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(response => {
        if (!response) {
            setTimeout(() => block.remove(), 300)
            reloadDisLists()
            Notification('Дисциплина удалена!')
        }
        else {
            console.log(response)
            Notification('Ошибка при удалении!')
        }
    })
}

function reloadDisLists(){
    document.querySelector('.list').innerHTML = `<option selected>Выберите дисциплину</option>`
    getDisciplines()
}

function changeDisName(name, disName){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines/${name}.json?auth=${getToken()}`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: disName
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (response.name) {
            reloadDisLists()
            Notification('Название дисциплины изменено!')
        }
        else {
            console.log(response)
            Notification('Ошибка!')
        }
    })
}

const disMenu = document.querySelector('.mainMenu-content')
disMenu.addEventListener('click', disMenuHandler)

var ev = null

function disMenuHandler(event){
    ev = event
    if (!event.target.dataset.name) {
        return
    }
    const {disKey} = event.target.dataset
    const {name} = event.target.dataset
    document.querySelector('.dis-modal').innerHTML = `${name}`
    var leftBody = ``, rightBody = ``
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines/${disKey}/files.json`)
    .then(response => response.json())
    .then(response => {
        if (response){
            Object.keys(response).map(key => {
                if (response[key].type == 'lit'){
                    leftBody += `
                    <div class="dis-file">
                        <a href="${response[key].url}" class="href">${response[key].name}</a>
                        <div class="remove-file" data-dis-key="${disKey}" data-file-key="${key}" hidden="true">&times;</div>
                    </div>`
                }
                if (response[key].type == 'lab'){
                    rightBody += `
                    <div class="dis-file lab-list" data-id="${(response[key].name).replace(/[^-\d]/g, '')}">
                        <a href="${response[key].url}" class="href">${response[key].name}</a>
                        <div class="remove-file" data-dis-key="${disKey}" data-file-key="${key}" hidden="true">&times;</div>
                    </div>`
                }
            })
        }
        document.querySelector('.dis-modal-content-body-left').innerHTML = leftBody
        document.querySelector('.dis-modal-content-body-right').innerHTML = rightBody
        sort()
        delHidden()
    })
}

function delHidden(){
    if(!sessionStorage.getItem('RP_HCRAM_03')){
        return
    }
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users/${sessionStorage.getItem('RP_HCRAM_03')}.json?auth=${getToken()}`)
    .then(response => response.json())
    .then(response => {
        var nodeListLit = document.querySelector('.dis-modal-content-body-left').querySelectorAll('.remove-file')
        var nodeListLab = document.querySelector('.dis-modal-content-body-right').querySelectorAll('.remove-file')
        if (!response.admin){
            for (var i = 0; i < nodeListLit.length; i++){
                nodeListLit[i].hidden = true
            }
            for (var i = 0; i < nodeListLab.length; i++){
                nodeListLab[i].hidden = true
            }
            return
        }
        if (response.admin){
            for (var i = 0; i < nodeListLit.length; i++){
                nodeListLit[i].hidden = false
            }
            for (var i = 0; i < nodeListLab.length; i++){
                nodeListLab[i].hidden = false
            }
            return
        }
    })
}

function sort() {
    var nodeList = document.querySelector('.dis-modal-content-body-right').querySelectorAll('.lab-list');
    if(nodeList.length === 0){
        return
    }
    var itemsArray = [];
    var parent = nodeList[0].parentNode;
    for (var i = 0; i < nodeList.length; i++) {    
      itemsArray.push(parent.removeChild(nodeList[i]));
    }
    itemsArray.sort(function(nodeA, nodeB) {
        var textA = nodeA.dataset.id
        var textB = nodeB.dataset.id
        var numberA = parseInt(textA);
        var numberB = parseInt(textB);
        if (numberA < numberB) return -1;
        if (numberA > numberB) return 1;
        return 0;
    })
    .forEach(function(node) {
        parent.appendChild(node)
    });
}

const disMenuFiles = document.querySelector('.dis-modal-body')
disMenuFiles.addEventListener('click', removeFile)

function removeFile(event){
    if(!event.target.dataset.fileKey){
        return
    }
    const {fileKey} = event.target.dataset
    const {disKey} = event.target.dataset
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines/${disKey}/files/${fileKey}.json?auth=${getToken()}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(response => {
        if (!response) {
            disMenuHandler(ev)
            Notification('Файл удалён!')
        }
        else {
            console.log(response)
            Notification('Ошибка при удалении!')
        }
    })
}