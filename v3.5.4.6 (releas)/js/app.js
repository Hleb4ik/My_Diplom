// import
import {AutValid} from './auth.js'
import {RegValid} from './reg.js'
import {Menu} from './modal.js'
import {upload} from './upload.js'
import {uploadInFirebase, uploadAchievInFirebase} from './uploadInFirebase.js'
import {getDisciplines, addDisciplineInDB} from './disciplines.js'
import { delHidden } from './info_links_achievements.js'
import './tests.js'
import './report.js'
import './account.js'
import './preloader.js'
import '../css/animate.css'
import '../css/mainMenu.css'
import '../css/preloader.css'
import '../css/style.css'

//Upload files in DB
upload('#file', {
  multi: true,
  accept: ['.pdf','.doc','.docx'],
  onUpload(files, blocks) {
    files.forEach((file, index) => {
      uploadInFirebase(file, blocks, index)
    })
  }
})
//Upload achive files in DB
upload('#achive-file', {
  multi: true,
  accept: ['.jpg', '.png'],
  onUpload(files, blocks) {
    files.forEach((file, index) => {
      uploadAchievInFirebase(file, blocks, index)
    })
  }
})

//Write discipline in DB
document.querySelector('#addDiscipline').addEventListener('click', function(){
  if (document.querySelector('#dispName').value){
    addDisciplineInDB(document.querySelector('#dispName').value)
    document.querySelector('#dispName').value = null
  }
})

document.querySelector('#EntranceBtn').addEventListener('click', resetModalAut)
document.querySelector('#RegisterBtn').addEventListener('click', resetModalReg)
document.querySelector('#exit').addEventListener('click', Exit)
document.querySelector('#btnReg').addEventListener('click', RegValid)
document.querySelector('#bthAut').addEventListener('click', AutValid)
document.addEventListener('DOMContentLoaded', Load)

//Ввод в лейбл только цифр
$(".inp-questions-number").keypress(function(event){
  event = event || window.event;
  if (event.charCode && event.charCode!=0 && (event.charCode < 48 || event.charCode > 57) )
    return false;
});
//Отступ для section---------
document.querySelector('.section').style = `padding-top: ${document.querySelector('.header').offsetHeight}px`
//Read disciplines in DB
getDisciplines()
// Functions ------------------------------------------------------------------------
// Load page
function Load(){
  delHidden()
  document.querySelector('#admin-panel').hidden = true
  document.querySelector('.test-list-settings').hidden = true
  if(sessionStorage.getItem('UserName') && sessionStorage.getItem('UserSurname')){
    return fetch (`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users.json?auth=${sessionStorage.getItem('RP_XB1ON_11')}`)
    .then(response => response.json())
    .then(response => {
      var flag = false
      Object.keys(response).some(key => {
        if(response[key].name == sessionStorage.getItem('UserName') && response[key].surname == sessionStorage.getItem('UserSurname')){
          Menu(sessionStorage.getItem('UserName'), sessionStorage.getItem('UserSurname'))
          sessionStorage.setItem('RP_HCRAM_03', key)
          if(response[key].admin){
            document.querySelector('#admin-panel').hidden = false
            document.querySelector('.test-list-settings').hidden = false
          }
          console.log(true)
          flag = true
          return flag
        }
      })
      if(flag != true){
        Exit()
      }
    })
  }
}

function Exit(){
  sessionStorage.clear()
  location.reload()
}

function resetModalAut(){
  document.querySelector('#login').value = null
  document.querySelector('#pass').value = null
  document.querySelector('#errorAut').innerHTML = null
}

function resetModalReg(){
  document.querySelector('#name').value = null
  document.querySelector('#surname').value = null
  document.querySelector('#regLogin').value = null
  document.querySelector('#regPass').value = null
  document.querySelector('#errorReg').innerHTML = null
}
// Functions ------------------------------------------------------------------------

// Modal form validation
(function (){
    var forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
          form.classList.add('was-validated')
        }, false)
      })
})()

// Auth in admin panel
function runOnKeys(func, ...codes) {
  let pressed = new Set()

  document.addEventListener('keydown', function(event) {
    pressed.add(event.code)

    for (let code of codes) { // все ли клавиши из набора нажаты?
      if (!pressed.has(code)) {
        return;
      }
    }

    pressed.clear()
    document.querySelector('#login').value = null
    document.querySelector('#pass').value = null
    func()
  });

  document.addEventListener('keyup', function(event) {
    pressed.delete(event.code)
  });
}

runOnKeys(
  () => alert("Поздравляю, ты нашёл главную посхалку! Отпиши мне плз, чтобы я знал, что её разгадали (inst: @__gleb4ik)"),
  "KeyA",
  "KeyD",
  "KeyM"
);