import {Notification} from './modal.js'



document.querySelector('.menu-edit-profile').addEventListener('click', function(){
    var uName = sessionStorage.getItem('UserName'),
    uSurname = sessionStorage.getItem('UserSurname')
    document.querySelector('#uName').value = uName
    document.querySelector('#uSurname').value = uSurname
})
document.querySelector('.btn-edit-profile').addEventListener('click', editProfile)

function editProfile(){
    uName = document.querySelector('#uName').value.split(' ').join('')
    uSurname = document.querySelector('#uSurname').value.split(' ').join('')
    if (!uName || !uSurname){
        Notification('Заполните поля!')
        return
    }
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/users/${sessionStorage.getItem('RP_HCRAM_03')}.json`, {//?auth=${123}`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: uName, surname: uSurname
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (response) {
            sessionStorage.setItem('UserName', response.name)
            sessionStorage.setItem('UserSurname', response.surname)
            document.querySelector('.offcanvas-title').innerHTML = `${response.name} ${response.surname}`
            Notification('Ваши данные изменены!')
        }
        else {
            console.log(response)
            Notification('Ошибка!')
        }
    })
}