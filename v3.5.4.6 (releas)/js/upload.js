function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (!bytes) {
      return '0 Byte'
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)

    if (classes.length) {
        node.classList.add(...classes)
    }
    if (content) {
        node.textContent = content
    }

    return node
}

function noop() {}

export function upload(selector, options = {}) {
    let files = []
    const onUpload = options.onUpload ?? noop
    const input = document.querySelector(selector)
    const preview = element('div', ['preview'])
    const open = element('button', ['open-btn'], 'Открыть')
    const upload = element('button', ['upload-btn', 'primary'], 'Загрузить')
    upload.hidden = true //Скрыть?
    upload.disabled = true //Или блокировать нажатие?

    if (options.multi) {
        input.setAttribute('multiple', true)
    }
    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }

    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', open)

    const triggerInput = () => input.click()
    
    const changeHandler = event => {
        if (!event.target.files.length) {
            return
        }

        files = Array.from(event.target.files)
        preview.innerHTML = ''
        upload.hidden = false //Скрыть?
        upload.disabled = false //Или блокировать нажатие?

        files.forEach(file => {
            if (file.type.match('application')) {
                const reader = new FileReader()
                reader.onload = ev => {
                    preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-file">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <p>${file.name}</p>
                        <div class="preview-info">${bytesToSize(file.size)}</div>
                    </div>
                    `)
                }
    
                reader.readAsDataURL(file)
                return
            }
            if (file.type.match('image')){
                const reader = new FileReader()
                reader.onload = ev => {
                    preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-file">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img class="preview-img" src="${ev.target.result}"/>
                        <p>${file.name}</p>
                        <div class="preview-info">${bytesToSize(file.size)}</div>
                    </div>
                    `)
                    document.querySelector('.add-achiev').querySelector('.primary').addEventListener('click', hide)
                }
    
                reader.readAsDataURL(file)
                return
            }
            return
        })
    }

    const removeHandler = event => {
        if (!event.target.dataset.name) {
            return
        }

        const {name} = event.target.dataset
        const block = preview.querySelector(`[data-name="${name}"]`).closest('.preview-file')

        block.classList.add('removing')

        files = files.filter(file => file.name !== name)
        setTimeout(() => block.remove(), 300)

        if (!files.length) {
            upload.hidden = true //Скрыть?
            upload.disabled = true //Или блокировать нажатие?
        }
    }

    const clearPreview = el => {
        el.innerHTML = '<div class="preview-info-progress"></div>'
    }

    const uploadHandlers = () => {
        preview.querySelectorAll('.preview-remove').forEach(e => e.remove())
        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(clearPreview)
        onUpload(files, previewInfo)
        document.querySelector('.primary').disabled = true
    }

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandlers)
}

function hide(){
  document.querySelector('.add-achiev').querySelector('.primary').disabled = true
}