import { Notification } from "./modal.js";
import { getToken } from "./disciplines.js"

document.querySelector('.menu-useful-info-btn').addEventListener('click', function(){
    document.querySelector('#Useful-Info-label').value = ''
})
document.querySelector('.menu-useful-links-btn').addEventListener('click', function(){
    document.querySelector('#Useful-Link-name').value = ''
    document.querySelector('#Useful-Link').value = ''
})

document.querySelector('#add-Useful-Info-btn').addEventListener('click', addInfo)
document.querySelector('#add-Useful-Link-btn').addEventListener('click', addLink)

var infoList = null, linksList = null

uploadInfo()
uploadLinks()
uploadAchiev(null)
delHidden()

function uploadInfo(){
    infoList = ''
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/useful_Info.json`)
    .then(response => response.json())
    .then(response => {
        if (!response){
            return document.querySelector('.div-info').innerHTML = 'Информация отсутствут'
        }
        if (response){
            Object.keys(response).map(key => {
                infoList += `
                <div class="content">
                    <div>
                        <p>${response[key].info}</p>
                    </div>
                     <div class="remove-file" data-type="useful_Info" data-key="${key}" hidden="true">&times;</div>
                </div>`
            })
            document.querySelector('.div-info').innerHTML = infoList
            delHidden()
        }
    })
}
function uploadLinks(){
    linksList = ''
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/useful_Links.json`)
    .then(response => response.json())
    .then(response => {
        if (!response){
            return document.querySelector('.div-links').innerHTML = 'Список ссылок пуст'
        }
        if (response){
            Object.keys(response).map(key => {
                linksList += `<div class="content">
                    <div>
                        <a class="href" href="${response[key].link}">${response[key].name}</a>
                    </div>
                    <div class="remove-file" data-type="useful_Links" data-key="${key}" hidden="true">&times;</div>
                </div>`
            })
            document.querySelector('.div-links').innerHTML = linksList
            delHidden()
        }
    })
}
export function uploadAchiev(achievList){
    achievList = ''
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/achievements.json`)
    .then(response => response.json())
    .then(response => {
        if(!response){
            return document.querySelector('.div-achiev').innerHTML = 'Достижений пока нет'
        }
        Object.keys(response).map(key => {
            achievList += `
            <div class="content">
                <img class="achiev-img" src="${response[key].imgLink}" alt="${response[key].name}">
                <div class="remove-file" data-type="achievements" data-key="${key}" hidden="true">&times;</div>
            </div>`
        })
        document.querySelector('.div-achiev').innerHTML = achievList
        delHidden()
    })
}

function addInfo(){
    var info = document.querySelector('#Useful-Info-label').value
    if (!info){
        return Notification('Заполните поля!')
    }
    info = info.split('\n').join('</p><p>')
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/useful_Info.json?auth=${getToken()}`, {
        method: 'POST',
        body: JSON.stringify({
            info
        }),
        headers: {
            'Content-type':'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (!response.error) {
            document.querySelector('#Useful-Info-label').value = ''
            uploadInfo()
            Notification('Успешно добавлено!')
        }
        else{
            Notification('Ошибка!')
        }
    })
}

function addLink(){
    const name = document.querySelector('#Useful-Link-name').value
    const link = document.querySelector('#Useful-Link').value.split(' ').join('')
    if (!name || !link){
        return Notification('Заполните поля!')
    }
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/useful_Links.json?auth=${getToken()}`, {
        method: 'POST',
        body: JSON.stringify({
            name, link
        }),
        headers: {
            'Content-type':'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (!response.error) {
            document.querySelector('#Useful-Link-name').value = ''
            document.querySelector('#Useful-Link').value = ''
            uploadLinks()
            Notification('Успешно добавлено!')
        }
        else{
            Notification('Ошибка!')
        }
    })
}

function addAchiev(imgLink){
    // the code is in upload.js and uploadInFirebase.js
}

export function delHidden(){
    if(!sessionStorage.getItem('RP_HCRAM_03')){
        return
    }
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users/${sessionStorage.getItem('RP_HCRAM_03')}.json?auth=${getToken()}`)
    .then(response => response.json())
    .then(response => {
        var nodeListLit = document.querySelector('.content-divs').querySelectorAll('.remove-file')
        if (!response.admin){
            for (var i = 0; i < nodeListLit.length; i++){
                nodeListLit[i].hidden = true
            }
            return
        }
        if (response.admin){
            for (var i = 0; i < nodeListLit.length; i++){
                nodeListLit[i].hidden = false
            }
            return
        }
    })
}

const links_list = document.querySelector('.content-divs')
links_list.addEventListener('click', remove)

function remove(event){
    if(!event.target.dataset.key){
        return
    }
    const {key} = event.target.dataset
    const {type} = event.target.dataset
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/${type}/${key}.json?auth=${getToken()}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(response => {
        if (!response) {
            if (type == 'useful_Links'){
                uploadLinks()
                Notification('Ссылка удалена!')
                return
            }
            if (type == 'useful_Info'){
                uploadInfo()
                Notification('Информация удалена!')
                return
            }
            if (type == 'achievements'){
                uploadAchiev()
                Notification('Достижение удалено!')
                return
            }
        }
        else {
            console.log(response)
            Notification('Ошибка при удалении!')
        }
    })
}