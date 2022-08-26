export default function (_Context) {

    // const _html = 


    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div id="file-select-box" class="modal hide">

        <!-- Modal content -->
        <div class="modal-content">
            <span class="close">&times;</span>
            <ul></ul>
            <input/>
            <button>ok</button>
        </div>

    </div>`

        , 'text/html');

    // console.log(htmlDoc)

    const _rootElm = htmlDoc.querySelector('#file-select-box');
    const _inputFile = _rootElm.querySelector('input');

    let currentDir = _Context.resourceMng.root_path;

    _Context.modalContainer.appendChild(_rootElm);

    let onCallback = null;

    _rootElm.querySelector('.modal-content button').addEventListener('click', (evt) => {

        _rootElm.classList.add('hide');
        onCallback ? onCallback(_inputFile.value) : null;

    })

    _rootElm.querySelector('.modal-content .close').addEventListener('click', async (evt) => {
        _rootElm.classList.add('hide');
        onCallback ? onCallback('') : null;
    })

    _rootElm.querySelector('.modal-content ul').addEventListener('click', async (evt) => {
            
            let li = evt.target;
    
            if (li.tagName === 'LI') {
                // onCallback ? onCallback(li.dataset) : null;
                _inputFile.value = `${currentDir}/${li.dataset.name}`;

            }
    
            // _rootElm.classList.add('hide');
    
    })

    return {
        element: _rootElm,
        show: async function (_callback,_rootDir) {

            if(_rootDir !== '' && _rootDir !== undefined) {
                // currentDir = _rootDir
                currentDir =`${_Context.resourceMng.root_path}/${_rootDir}`
            }
            else {
                currentDir = _Context.resourceMng.root_path
            }

            let _result = await (await (fetch(`${_Context.resourceMng.host_url}/api/v2/webdisk/ls`, {
                method: 'POST',
                body: currentDir,
                headers: {
                    'Content-Type': 'application/text',
                    'auth-token': _Context.resourceMng.authToken
                }
            }))).json();

            console.log(_result)

            let _ul = _rootElm.querySelector('.modal-content ul');
            _ul.innerHTML = '';

            _.each(_result.list, (item) => {
                let _li = document.createElement('li');

                if (item.type === 1) {
                    _li.innerHTML = item.name;
                } else if (item.type === 2) {
                    _li.innerHTML = `[${item.name}]`;
                }
                _li.dataset.name = item.name
                _li.dataset.type = item.type
                _ul.appendChild(_li);

            });

            onCallback = _callback;
            _rootElm.classList.remove('hide');
        },
        close: function () {
            _rootElm.classList.add('hide');
        },
        setCallback: function (_callback) {
            onCallback = _callback;
        }
    }


}