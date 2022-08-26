export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="modal hide">
        <!-- Modal content -->
        <div class="modal-content small">
            <h2>Progress</h2>
            <h3 class='msg' >진행상황</h3>
            
        </div>

    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.modal');
    // const _msgText = _rootElm.querySelector('.modal-content h2');
    _Context.modalContainer.appendChild(_rootElm);
    // let _onCallback = null;

    const _progressMsg = _rootElm.querySelector('.modal-content .msg');

    return {
        element: _rootElm,
        show: function () {
            _progressMsg.innerText = 'ready'
            _rootElm.classList.remove('hide');
            // _onCallback = onCallback;
        },
        update : function(progress){
            _progressMsg.innerText = `name : ${progress.name} , progress : ${ _.round(progress.progress,1) }%`;
        },
        close: function () {
            _progressMsg.innerText = ''
            _rootElm.classList.add('hide');
            console.log('close box')
        }
    }
}