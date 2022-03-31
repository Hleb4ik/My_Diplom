import {Notification} from './modal.js'

document.querySelector('#add-report-btn').addEventListener('click', report)

function report(){
    const report = document.querySelector('#report-label').value
    const contactInfo = document.querySelector('#contact-info-label').value
    if (!report || !contactInfo){
        return Notification('Заполните все поля!')
    }
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/reports.json`, {
        method: 'POST',
        body: JSON.stringify({
            contactInfo, report, userName: sessionStorage.getItem('UserName'), userSurname: sessionStorage.getItem('UserSurname')
        }),
        headers: {
            'Content-type':'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (!response.error) {
            document.querySelector('#report-label').value = ''
            document.querySelector('#contact-info-label').value = ''
            Notification('Репорт успешно отправлен!')
        }
        else{
            Notification('Ошибка!')
        }
    })
}