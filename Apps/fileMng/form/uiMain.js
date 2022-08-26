import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';


export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='w3-container file-list' >
            <div class='menu' >
                <button class='upload w3-button w3-teal'>upload</button>
                <button class="download w3-button w3-red">download</button>
                <button class="del w3-button w3-blue">del</button>
            </div>
            <hr />
            <div class='list-frame'>
                <ul class='list w3-ul w3-hoverable' ></ul>
            </div>
        </div>


        <form class='w3-container file-info'>
            <label>id</label>
            <input class="w3-input" type="text" name='id'>
            <label>creator</label>
            <input class="w3-input" type="text" name='creator'>
            <label>title</label>
            <input class="w3-input" type="text" name='title'>
            <label>description</label>
            <input class="w3-input" type="text" name='description'>
            <label>directory</label>
            <input class="w3-input" type="text" name='directory'>
            <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='isPublic'> public <br><br>
            <label>created</label>
            <input class="w3-input" type="text" name='created'>
            <label>file type</label>
            <input class="w3-input" type="text" name='file_type'>
            <label>file size</label>
            <input class="w3-input" type="text" name='file_size'>
            <label>source name</label>
            <input class="w3-input" type="text" name='src_name'>
            <label>file path</label>
            <input class="w3-input" type="text" name='file_path'>
            <label>file md5</label>
            <input class="w3-input" type="text" name='file_md5'>
                
        </form>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _fileListElm = _rootElm.querySelector('.file-list');
    const _fileInfoElm = _rootElm.querySelector('.file-info');

    _rootElm.style.display = 'flex';
    

    _fileListElm.style.width = '512px';
    _fileInfoElm.style.width = '512px';
    _fileInfoElm.style.height = '512px';

    _fileInfoElm.style.overflow = 'auto';
    

    const host_url = _Context.host_url;
    let select_Item = null;

    const _uploadBtn = _rootElm.querySelector('.upload');
    const _downloadBtn = _rootElm.querySelector('.download');
    const _delBtn = _rootElm.querySelector('.del');

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
                // isPublic: true,
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
                    <span> ${item.size} </span>,
                    <span> ${item.isPublic} </span>,
                    <span> ${item.date} </span><br>
                    <span> ${item.md5} </span>

                </div>
                `

                li.dataset._id = item._id;
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

            try {

                _Context.waitModal.show({
                    msg : 'loading...'
                })


                let res = await (await (fetch(`${host_url}/com/file/findOne/${_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/text',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))).json();
                console.log(res)

                if (res.r === 'ok') {

                    _fileInfoElm.querySelector('input[name=id]').value = res.data._id;
                    _fileInfoElm.querySelector('input[name=creator]').value = res.data.creator;
                    _fileInfoElm.querySelector('input[name=title]').value = res.data.title;
                    _fileInfoElm.querySelector('input[name=description]').value = res.data.description;
                    _fileInfoElm.querySelector('input[name=directory]').value = res.data.directory;
                    _fileInfoElm.querySelector('input[name=isPublic]').checked = res.data.isPublic;
                    _fileInfoElm.querySelector('input[name=created]').value = res.data.date;
                    _fileInfoElm.querySelector('input[name=file_type]').value = res.data.fileType;
                    _fileInfoElm.querySelector('input[name=file_size]').value = res.data.size;
                    _fileInfoElm.querySelector('input[name=src_name]').value = res.data.srcName;
                    _fileInfoElm.querySelector('input[name=file_path]').value = res.data.filepath;
                    _fileInfoElm.querySelector('input[name=file_md5]').value = res.data.md5;

                    let _type = res.data.fileType.split('/')

                    if(_type[0] === 'image') {
                        let _tex = await _Context.objViewer.loadTexture({
                            textureFile : res.data._id
                        });

                        _Context.objViewer.addPlane({
                            map : _tex,
                            color : 0xffffff,
                        });


                        console.log(_tex);

                    }



                }

                // document.querySelector('#updateForm input[name=title]').value = res.data.title
                // document.querySelector('#updateForm input[name=description]').value = res.data.description
                // document.querySelector('#updateForm input[name=isPublic]').checked = res.data.isPublic


            }
            catch (err) {
                console.log(err)
            }

            _Context.waitModal.close();


        }
    });

    //upload
    _uploadBtn.addEventListener('click', async function () {

        let form_data = await new Promise(async (resolve, reject) => {


            _Context.fileUploadForm.show({
                onCallback: async function (data) {
                    // console.log(file);
                    resolve(data);
                }
            });
        });

        if (form_data) {

            const fileObj = await makeFileObj(form_data.file);

            // console.log(fileObj);

            let hash = md5(fileObj.data)
            console.log(hash);

            console.log(form_data);

            const _res = await comFileUpload({
                fileObj: fileObj,
                title: form_data.title,
                description: form_data.description,
                directory: form_data.directory,
                isPublic : form_data.isPublic,
                md5: hash
            });

            console.log(_res)

            if (_res.r === 'ok') {
                await _updateList();
            }
        }
        else {
            _Context.messageModal.show({
                msg : 'cancel'
            });
        }



        // await makeFileObj(regData.fbxFile);
        // const _file = await comFileUpload();
    });

    //delete
    _delBtn.addEventListener('click', async function () {
        if (select_Item) {
            const _id = select_Item.dataset._id;
            console.log(_id);
            try {
                let res = await (await (fetch(`${host_url}/com/file/delete/${_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/text',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))).json();

                console.log(res)
                if (res.r === 'ok') {
                    await _updateList();
                }
            }
            catch (err) {
                console.log(err)
            }
        }
    });



    _Context.ui_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        getSelection: function () {
            return select_Item;
        }
    }

}