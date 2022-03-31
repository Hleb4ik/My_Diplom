import {Notification} from './modal.js'

export function RegValid(){
    var form = document.getElementById('formReg')
      var isValid = form.reportValidity()
  
      if (isValid) {
            form.addEventListener('submit', RegFormHandler, {once: true})
      }
}

var name = null, surname = null, login = null, pass = null

function RegFormHandler(event){
    event.preventDefault()

    name = document.querySelector('#name').value,
    surname = document.querySelector("#surname").value,
    login = document.querySelector('#regLogin').value,
    pass = document.querySelector('#regPass').value

    if (name && surname && login && pass !=0){
        reghWithEmailAndPassword(login, pass)
    }
}

function reghWithEmailAndPassword(email, password){
    const apiKey = 'AIzaSyBTbdSfjlxDQtExcDU7_ApMEkhzlBKKnz4'
    return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,{
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
    .then(Token)
}

function Token(token){
    if(token){
        document.querySelector('#CloseR').click()
        writeInDB()
        Notification('Вы успешно зарегистрировались!')
    }
    else{
        document.querySelector('#errorReg').innerHTML = '<p class="error">Ошибка(или майл занят, или пароль > 6 символов)</p>'
    }
}

function writeInDB(){
    return fetch('https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
        method: 'POST',
        body: JSON.stringify({
            login, name, surname
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
}