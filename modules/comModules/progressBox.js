export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="w3-modal">
        <div class="w3-modal-content">

            <header class="w3-container w3-teal">
                <div class="w3-center">
                    <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                    <h2>Progress...</h2>
                </div>
            </header>
            <div class="w3-container">
                <h3 name="msg" >Please wait...</h3>
                <div class="w3-light-grey">
                    <div name="progressBar" class="w3-container w3-green w3-center" style="width:0%">0%</div>
                </div>
                <br>
            </div>
            
        </div>

    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    // const _msgText = _rootElm.querySelector('.modal-content h2');
    _Context.modalContainer.appendChild(_rootElm);
    // let _onCallback = null;

    const _progressBar = _rootElm.querySelector('[name="progressBar"]');
    const _msg = _rootElm.querySelector('[name="msg"]');

    function closeModal() {
        // _rootElm.querySelector('form').reset();
        _msg.innerText = ''
        _rootElm.style.display = 'none';
        console.log('close wait Modal');
    }
    //close btn
    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', closeModal);

    return {
        element: _rootElm,
        show: function () {
            // _progressMsg.innerText = 'ready'
            _progressBar.style.width = `0%`;
            _progressBar.innerText = `0%`;

            _msg.innerText = 'Please wait...'
            _rootElm.style.display = 'block';
        },
        update : function(progress){
            // _progressMsg.innerText = `name : ${progress.name} , progress : ${ _.round(progress.progress,1) }%`;
            _progressBar.style.width = `${progress.progress}%`;
            _progressBar.innerText = `${ _.round(progress.progress,2)}%`;
            _msg.innerText = `${progress.name}`;
        },
        close: closeModal,
        closeDelay: async (delay) => {
            _progressBar.style.width = `100%`;
            _progressBar.innerText = `100%`;

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    closeModal();
                    resolve();
                }, delay);
            })

            
            // delay? setTimeout(closeModal, delay) : closeModal();
            // closeModal()
        }
    }
}