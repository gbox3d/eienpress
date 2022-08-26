export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div id="msg-box" class="modal hide">
        <!-- Modal content -->
        <div class="modal-content small">
            <h2>Message</h2>
            <button>Close</button>
        </div>

    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('#msg-box');
    const _msgText = _rootElm.querySelector('.modal-content h2');
    _Context.modalContainer.appendChild(_rootElm);

    let onCallback = null;

    _rootElm.querySelector('.modal-content button').addEventListener('click', (evt) => {
            _rootElm.classList.add('hide');
            onCallback ? onCallback() : null;
    });

    return {
        element : _rootElm,
        show: function (msg,_onCallback, _path) {
            _rootElm.classList.remove('hide');
            _msgText.innerText = msg;

            onCallback = _onCallback;

        },
        close : function(){
            _rootElm.classList.add('hide');
            console.log('close msg box')
        }
    }
}