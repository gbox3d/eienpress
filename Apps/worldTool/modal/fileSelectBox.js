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

    const _rootElm = htmlDoc.querySelector('#file-select-box');
    const _inputFile = _rootElm.querySelector('input');

    let currentDir = _Context.root_path;

    _Context.modalContainer.appendChild(_rootElm);

    let onCallback = null;

    _rootElm.querySelector('.modal-content button').addEventListener('click', (evt) => {

        _rootElm.classList.add('hide');
        onCallback ? onCallback(`${currentDir}/${_inputFile.value}`) : null;

    })

    _rootElm.querySelector('.modal-content .close').addEventListener('click', async (evt) => {
        _rootElm.classList.add('hide');
        onCallback ? onCallback('') : null;
    })

    _rootElm.querySelector('.modal-content ul').addEventListener('click', async (evt) => {

        let li = evt.target;

        if (li.tagName === 'LI') {
            // onCallback ? onCallback(li.dataset) : null;

            if (parseInt(li.dataset.type) === 2) {
                if (li.dataset.name === '..') {

                    // if(currentDir === _Context.root_path) return;

                    currentDir = currentDir.split('/').slice(0, -1).join('/');
                    console.log(currentDir);
                    // await _Context.loadDir(currentDir);
                }
                else {
                    currentDir += `/${li.dataset.name}`;
                }
                updateList();

            }
            else {
                _inputFile.value = li.dataset.name;
            }
        }

    })

    async function updateList() {

        let _result = await (await (fetch(`${_Context.host_url}/api/v2/webdisk/ls`, {
            method: 'POST',
            body: currentDir,
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(_result)

        let _ul = _rootElm.querySelector('.modal-content ul');
        _ul.innerHTML = '';

        //up dir
        if (currentDir !== _Context.root_path) {
            let _li = document.createElement('li');
            _li.innerText = '..';
            _li.dataset.type = 2;
            _li.dataset.name = '..';
            _ul.appendChild(_li);
        }

        _.each(_result.list, (item) => {
            let _li = document.createElement('li');

            if (item.type === 1) {
                _li.innerHTML = item.name;
            } else if (item.type === 2) { //directory
                _li.innerHTML = `[${item.name}]`;
            }
            _li.dataset.name = item.name
            _li.dataset.type = item.type
            _ul.appendChild(_li);

        });

    }

    return {
        element: _rootElm,
        show: async function (_callback, _rootDir) {

            if (_rootDir !== '' && _rootDir !== undefined) {
                // currentDir = _rootDir
                currentDir = `${_Context.root_path}/${_rootDir}`
            }
            else {
                currentDir = _Context.root_path
            }

            updateList();

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