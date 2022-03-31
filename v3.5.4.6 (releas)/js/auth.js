import {Notification, Menu} from './modal.js'
import { delHidden } from './info_links_achievements.js'

export function AutValid(){
  var form = document.getElementById('formAut')
  var isValid = form.reportValidity()

  if (isValid) {
      form.addEventListener('submit', AuthFormHandler, {once: true})
  }
}

var login = null, pass = null

function AuthFormHandler(event){
  event.preventDefault()

  login = document.querySelector('#login').value
  pass = document.querySelector('#pass').value

  if (login != null && pass != null){
      authWithEmailAndPassword(login, pass)
      .then(IsToken)
  }
}

function authWithEmailAndPassword(email, password){
    const apiKey = 'AIzaSyBTbdSfjlxDQtExcDU7_ApMEkhzlBKKnz4'
    return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,{
        method: 'POST',
        body: JSON.stringify({
            email, password,
            returnSecureToken: true
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => data.idToken)
}
//-----------------Проверка на получение токена (удачный вход)
function IsToken(token){
    if(token){
      GetName(token)
      document.querySelector('#Close').click()
    }
    else{
      document.querySelector('#errorAut').innerHTML = '<p class="error">Неверный логин или пароль</p>'
    }
}

function GetName(token){
  return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users.json?auth=${token}`)
  .then(response => response.json())
  .then(response => {
    if (response){
      Object.keys(response).map(key => {
        if(response[key].login == login){
          Menu(response[key].name, response[key].surname)
          sessionStorage.setItem('UserName', response[key].name)
          sessionStorage.setItem('UserSurname', response[key].surname)
          sessionStorage.setItem('RP_HCRAM_03', key)
          sessionStorage.setItem('RP_XB1ON_11', token)
          if (response[key].admin){
            document.querySelector('#admin-panel').hidden = false
            document.querySelector('.test-list-settings').hidden = false
            delHidden()
          }
          else{
            document.querySelector('#admin-panel').hidden = true
          }
          Notification('Вход выполнен успешно!')
        }
      })
    }
  })
}