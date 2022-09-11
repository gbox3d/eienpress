import { makeFormBody, comFileUpload, makeFileObj } from "..//comLibs/utils.js";

export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
        <div class="w3-modal" >
            <div class="w3-modal-content">
                <header class="w3-container w3-teal">
                    <div class="w3-center">
                        <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                        <h2>select file</h2>
                    </div>
                </header>
                <form class="w3-container">
                    
                    <table class="w3-table-all file-list">

                    </table>

                    <input class='w3-input' disable />
                    <button class="w3-button w3-block w3-green w3-section w3-padding" type="submit"> 열기 </button>
                </form>
            </div>
        </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    const _inputFile = _rootElm.querySelector('input');
    const _fileList = _rootElm.querySelector('table.file-list');


    _fileList.style.height = '300px';
    _fileList.style.overflowY = 'scroll';

    // let currentDir = _Context.root_path;

    _Context.modalContainer.appendChild(_rootElm);

    let onCallback = null;
    let select_item = null;

    _rootElm.querySelector('form').addEventListener('submit', (evt) => {

        evt.preventDefault();
        
        _rootElm.style.display = 'none';
        onCallback ? onCallback( select_item ? select_item.dataset : null ) : null;

    })

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', async (evt) => {
        _rootElm.style.display = 'none';
        onCallback ? onCallback('') : null;
    })

    function _onSelectFile() {
        // _inputFile.value = this.dataset.id;

        let list = _fileList.children;
        for (let i = 0; i < list.length; i++) {
            list[i].classList.remove('w3-indigo');
        }
        this.classList.add('w3-indigo');
        select_item = this;
    }

    async function updateList() {

        let _result = await (await (fetch(`${_Context.host_url}/com/file/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'authorization': localStorage.getItem('jwt_token')
            },
            body: makeFormBody({
                fileType: '',
                skip: 0,
                limit: 100
            })
        }))).json();

        console.log(_result)

        let _ul = _fileList;
        _ul.innerHTML = '';


        _.each(_result.data, (item) => {

            let _tr = document.createElement('tr');

            _tr.dataset.id = item._id;
            _tr.dataset.type = item.fileType;
            _tr.dataset.size = item.size;

            _tr.innerHTML = `
                            <td>${item.title}</td>
                            <td>${item.srcName}</td>
                            <td>${item.fileType}</td>
                            <td>${item.size}</td>
                            <td>${item.date}</td>
                            `;
            _tr.addEventListener('click', _onSelectFile.bind(_tr));
            
            _ul.appendChild(_tr);

        });

    }

    return {
        element: _rootElm,
        show: async function (_callback, _rootDir) {

            select_item = null;

            // if (_rootDir !== '' && _rootDir !== undefined) {
                
            //     currentDir = `${_Context.root_path}/${_rootDir}`
            // }
            // else {
            //     currentDir = _Context.root_path
            // }

            updateList();

            onCallback = _callback;
            // _rootElm.classList.remove('hide');
            _rootElm.style.display = 'block';
        },
        close: function () {
            // _rootElm.classList.add('hide');
            _rootElm.style.display = 'none';
        },
        setCallback: function (_callback) {
            onCallback = _callback;
        }
    }


}