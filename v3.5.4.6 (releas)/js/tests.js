import {Notification} from './modal.js'
import {getToken} from './disciplines.js'

document.querySelector('#CreateQuestion').addEventListener('click', createQuestionList)
document.querySelector('#clear-btn').addEventListener('click', clear)
document.querySelector('.menu-test-btn').addEventListener('click', getTestList)
document.querySelector('.menu-test-settings-btn').addEventListener('click', settingsTestList)
document.querySelector('.test-modal-footer').hidden = true
document.querySelector('.create-test-footer').hidden = true

var num = null

function createQuestionList(){
    num = document.querySelector('#NumOfQuest').value
    if (num) {
        document.querySelector('.create-test-body').hidden = true
        document.querySelector('#NumOfQuest').value = null
        document.querySelector('.test-modal-footer').hidden = false
        document.querySelector('.create-test-footer').innerHTML += `
            <div>
                <p>Название теста</p>
                <input type="text" id="testName" class="form-control">
            </div>`
        for (var i = 1; i <= num; i++){
            document.querySelector('.create-test-footer').innerHTML += `
            <div>
                <p>Вопрос №${i}</p>
                <input type="text" id="quest${i}" class="form-control">
                <p>Ответ</p>
                <input type="text" id="answer${i}" class="form-control">
            </div>`
        }
        document.querySelector('.create-test-footer').hidden = false
    }
    document.querySelector('#addTestInDB-btn').addEventListener('click', collectTest)
}

function collectTest(){
    const testp = document.querySelector('.create-test-footer')
    var codeParse = ``
    var answers = ``
    for (var i = 1; i <= num; i++){
        codeParse += `
        <div>
            <p>Вопрос №${i}</p>
            <p>${testp.querySelector(`#quest${i}`).value}</p>
            <p>Ответ</p>
            <input type="text" class="form-control my-answer${i}">
        </div>`
        answers += `
            <p class="answer${i}">${testp.querySelector(`#answer${i}`).value}</p>
        `
    }
    addTestInDB(testp.querySelector('#testName').value, codeParse, answers)
}

function addTestInDB(name, codeParse, answers){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests.json?auth=${getToken()}`, {
        method: 'POST',
        body: JSON.stringify({
            name, codeParse, answers, access: 'closed', num
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        if (response.name) {
            Notification('Тест успешно добавлен!')
            clear()
        }
        if (response.error){
            Notification('Неизвестная ошибка!')
        }
    })
}

const testList = document.querySelector('.modal-test-list')
const testListSettings = document.querySelector('.test-list-settings')

function getTestList(){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests.json?auth=${getToken()}`)
    .then(response => response.json())
    .then(response => {
        testList.innerHTML = ``
        testListSettings.innerHTML = ``
        Object.keys(response).map(key => {
            if (response[key].access == 'open'){
                testList.innerHTML += `<div class="animate__animated animate__fadeInUp">
                    <button type="button" id="test-qw" data-name="${response[key].name}" data-link="${key}" class="btn-test" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#exampleModalPassingTest">
                        ${response[key].name}
                    </button>
                </div>`
            }
        })
    })
}

function settingsTestList(){
    return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests.json?auth=${getToken()}`)
    .then(response => response.json())
    .then(response => {
        testList.innerHTML = ``
        testListSettings.innerHTML = `<div class="meaning-btn"></div><div class="del-btn"></div>`
        Object.keys(response).map(key => {
            testList.innerHTML += `<div>
            <button type="button" id="test-qw" data-name="${response[key].name}" data-link="${key}" class="btn-test" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#exampleModalPassingTest">
                ${response[key].name}
            </button>
        </div>`
        testListSettings.querySelector('.del-btn').innerHTML += `<div><button class="btn-test" data-link-del="${key}">&times;</button></div>`
        if (response[key].access == 'closed') {
            testListSettings.querySelector('.meaning-btn').innerHTML += `<div><button data-link="${key}" class="btn-test test-open" data-meaning="open">Открыть</button></div>`
        }
        if (response[key].access == 'open') {
            testListSettings.querySelector('.meaning-btn').innerHTML += `<div><button data-link="${key}" class="btn-test test-closed" data-meaning="closed">Закрыть</button></div>`
        }
        })
    })
}

testList.addEventListener('click', addTest)
testListSettings.addEventListener('click', deleteTest)

var testAnswers = ``;

function addTest(event){
    if (event.target.dataset.name && event.target.dataset.link){
        const {link} = event.target.dataset
        const {name} = event.target.dataset

        document.querySelector('#exampleModalTestName').textContent = name
        return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests/${link}.json?auth=${getToken()}`)
        .then(response => response.json())
        .then(response => {
            document.querySelector('.test-body').innerHTML = `${response.codeParse}`
            document.querySelector('.test-footer').hidden = false
            testAnswers = `${response.answers}`
            num = response.num
        })
    }
}

document.querySelector('.btn-test-verify').addEventListener('click', testVerify)

function testVerify(){
    var myAnswer = ``,
    answer = ``,
    res = 0
    document.querySelector('.test-answers').innerHTML = testAnswers
    for (var i = 1; i <= num; i++){
        myAnswer = document.querySelector('.test-body').querySelector(`.my-answer${i}`).value
        answer = document.querySelector('.test-answers').querySelector(`.answer${i}`).innerHTML
        if (myAnswer === answer){
            res += 1
        }
    }
    document.querySelector('.test-body').innerHTML = `<h3>Результат: ${res + '/' + num}</h3>`
    document.querySelector('.test-footer').hidden = true
    document.querySelector('.test-answers').innerHTML = ``
}

function deleteTest(event){
    if (event.target.dataset.linkDel){
        const {linkDel} = event.target.dataset
        return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests/${linkDel}.json?auth=${getToken()}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(response => {
            if (!response){
                settingsTestList()
                Notification('Успешно удален!')
            }
            else{
                Notification('Неизвестная ошибка')
                console.log(response.error)
            }
        })
    }
    if (event.target.dataset.link && event.target.dataset.meaning){
        const {link} = event.target.dataset
        const {meaning} = event.target.dataset
        return fetch(`https://edupor-web-app-default-rtdb.europe-west1.firebasedatabase.app/tests/${link}.json?auth=${getToken()}`, {
            method: 'PATCH',
            body: JSON.stringify({
                access: meaning
            }),
            headers: {
                'Content-Type' : 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            if (response){
                settingsTestList()
                Notification('Состояние теста изменено!')
            }
            else{
                Notification('Неизвестная ошибка')
                console.log(response.error)
            }
        })
    }
}

function clear(){
    document.querySelector('.test-modal-footer').hidden = true
    document.querySelector('.create-test-footer').innerHTML = ``
    document.querySelector('.create-test-body').hidden = false
}