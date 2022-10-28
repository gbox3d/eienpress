export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="w3-modal">
        <div class="w3-modal-content">
            <header class="w3-container w3-teal">
                <div class="w3-center">
                <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                <h2>Message Box</h2>
                </div>
            </header>
            <div class="w3-container w3-padding">
                <div class="w3-section" >
                    <p class='msg' ></p>
                    <button class="w3-button w3-teal w3-right close">Close</button>
                </div>
            </div>
        </div>
  </div>

    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    _Context.modalContainer.appendChild(_rootElm);
    const _Msg = _rootElm.querySelector('.w3-container .msg');
    const _CloseBtn = _rootElm.querySelector('.w3-container button.close');
    
    function closeModal() {

        _Msg.innerText = ''
        _rootElm.style.display = 'none';

        // resolve && resolve();
    }

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', closeModal);

    console.log(_rootElm.querySelector('[title="Close Modal"]'))

    _CloseBtn.addEventListener('click', closeModal);

    

    return {
        element: _rootElm,
        show: function ({ msg }) {
            _Msg.innerText = msg
            _rootElm.style.display = 'block';

            // return new Promise(closeModal);
        },
        showWait: function ({ msg }) {
            _Msg.innerText = msg
            _rootElm.style.display = 'block';

            return new Promise(resolve => {
                _CloseBtn.removeEventListener('click', closeModal);
                _CloseBtn.addEventListener('click', () => {
                    closeModal();
                    resolve();
                });
            } );
        },
        update: function (msg) {
            _Msg.innerText = msg;
        },
        close(delay) {
            delay = delay || 0;
            setTimeout(closeModal, delay);
        },
        closeWait: function (delay) {
            return new Promise(resolve => {
                delay = delay || 0;
                setTimeout(()=> {
                    closeModal();
                    resolve();
                }, delay);
                
            })
        }
    }
}