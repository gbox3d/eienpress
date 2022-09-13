import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import 'md5';

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='w3-container file-list' >
            <div class='list-frame'>
                <ul class='list w3-ul w3-hoverable' ></ul>
            </div>
        </div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _fileListElm = _rootElm.querySelector('.file-list');
    
    _fileListElm.style.height = '512px';
    _fileListElm.style.overflow = 'auto';
    
    const host_url = _Context.host_url;
    let select_Item = null;
    let onSelect = null;

    const _listElm = _rootElm.querySelector('.list');
    _listElm.style.height = '400px';
    _listElm.style.overflow = 'auto';

    async function _updateList() {
        _listElm.innerHTML = '';

        let res = await (await (fetch(`${host_url}/com/file/list`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'authorization': localStorage.getItem('jwt_token')
            },
            body: makeFormBody({
                fileType: '',
                skip: 0,
                limit: 100
            })
        }))).json();

        if (res.r === 'ok') {
            const _listElm = _rootElm.querySelector('.list');
            _listElm.innerHTML = '';
            let _list = res.data;

            _list.forEach(item => {

                const li = document.createElement('li');
                li.classList.add('item');
                li.classList.add('w3-bar');
                li.innerHTML = `
                <div class="w3-bar-item">
                    <span class="w3-large" > ${item.title} </span><br>
                    <span> ${item.fileType} </span>,
                    <span> ${item.size} </span>
                </div>
                `

                li.dataset._id = item._id;
                li.dataset.fileName = item.srcName;
                // li.dataset.modelFile = item.modelFile;
                // li.dataset.textureFile = item.textureFile;
                // li.dataset.type = item.type;


                _listElm.appendChild(li);
            });
        }
        console.log(res);
    }

    await _updateList();

    //selection
    _listElm.addEventListener('click', async function (e) {
        console.log(e.target);

        _Context.objViewer.objMng.clearObject();

        let item = e.target;

        while (item.tagName !== 'LI' && item.parentElement) {
            item = item.parentElement;
        }

        if (item.classList.contains('item')) {
            // let item = e.target;
            const _id = item.dataset._id;
            console.log(_id);

            select_Item ? select_Item.classList.remove('w3-blue') : null;
            item.classList.add('w3-blue');
            select_Item = item;

            // _Context.waitModal.show({
            //     msg: 'loading...'
            // })

            onSelect ? onSelect({
                _id: _id,
                item : item
            }) : null;

            

        }
    });

    // _Context.ui_container.appendChild(_rootElm);
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        getSelection: function () {
            return select_Item;
        },
        setOnSelect: function (cb) {
            onSelect = cb;
        },
        updateList: _updateList
    }

}