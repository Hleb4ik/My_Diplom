import {initializeApp} from 'firebase/app'
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage"
import {Notification} from './modal.js'
import { getToken } from './disciplines.js'
import { uploadAchiev } from './info_links_achievements.js'

const firebaseConfig = {
    apiKey: "AIzaSyBTbdSfjlxDQtExcDU7_ApMEkhzlBKKnz4",
    authDomain: "edupor-web-app.firebaseapp.com",
    databaseURL: "https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "edupor-web-app",
    storageBucket: "edupor-web-app.appspot.com",
    messagingSenderId: "355745258624",
    appId: "1:355745258624:web:47c082fa5e7720a45d1a65"
}
const app = initializeApp(firebaseConfig)
const storage = getStorage()

export function uploadInFirebase(file, blocks, index){
    const select = document.querySelector('.list')
    const option = select.querySelector(`option[value="${select.value}"]`)
    const type = document.querySelector('.type-list').querySelector(`option[value="${document.querySelector('.type-list').value}"]`).value

    const storageRef = ref(storage, `${option.textContent}/${type}/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', snapshot => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        const block = blocks[index].querySelector('.preview-info-progress')
        block.style.width = percentage + '%'
    }, error => {
        console.log(error)
    }, () => {
        getDownloadURL(storageRef).then(url => {
            return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/disciplines/${option.value}/files.json?auth=${getToken()}`, {
                method: 'POST',
                body: JSON.stringify({
                  type,
                  name: file.name,
                  url
                }),
                headers: {
                  'Content-Type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then(response => {
                if(response){
                  Notification('Загрузка прошла успешно!')
                }
                else{
                  Notification('Неизвестная ошибка!')
                }
            })
        })
    })
}

export function uploadAchievInFirebase(file, blocks, index){
    const storageRef = ref(storage, `achievements/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', snapshot => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        const block = blocks[index].querySelector('.preview-info-progress')
        block.style.width = percentage + '%'
    }, error => {
        console.log(error)
    }, () => {
        getDownloadURL(storageRef).then(url => {
            return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/achievements.json?auth=${getToken()}`, {
                method: 'POST',
                body: JSON.stringify({
                  name: file.name,
                  imgLink: url
                }),
                headers: {
                  'Content-Type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then(response => {
                if(response){
                  uploadAchiev(null)
                  Notification('Загрузка прошла успешно!')
                }
                else{
                  Notification('Неизвестная ошибка!')
                }
            })
        })
    })
}

document.querySelector('.menu-upload-btn').addEventListener('click', clear)
document.querySelector('.menu-achiev-btn').addEventListener('click', clear)
function clear(){
    document.querySelector('.preview').innerHTML = `` //Очистка загруженных файлов?????????
    document.querySelector('.primary').hidden = true //Скрывать?
    document.querySelector('.add-achiev').querySelector('.preview').innerHTML = ``
    document.querySelector('.add-achiev').querySelector('.primary').hidden = true
}