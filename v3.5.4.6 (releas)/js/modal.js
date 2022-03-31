export function Notification(message){
    document.querySelector('.toast-body').innerHTML = message
    var toastLiveExample = document.getElementById('liveToast')
    var toast = new bootstrap.Toast(toastLiveExample)
    toast.show()
}

export function Menu(Name, Surname){
    document.querySelector('#btnAuthORMenu').innerHTML = `
        <button class="btn-open-menu" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        <span></span>
        </button>`
    document.querySelector('.offcanvas-title').innerHTML = `${Name} ${Surname}`
}