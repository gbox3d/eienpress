import { comFileUpdate, comFileDownload, comFileDelete, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';

import uiFileListSetup from "./uiFileList.js";
import uiFileInfoSetup from "./uiFileInfo.js";
// import objMng from "../../../modules/elvisPlugins/objMng.js";

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';
import uiMenuBarSetup from './uiMenuBar.js';



export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='ui-menu-bar'></div>
        <div class="ui-container">
            <div class="left-frame">
                <div class="filelist-container" ></div>
                <div class="fileinfo-container" ></div>
            </div>
            <div class="right-frame">
                <div class="obj-viewer-container"></div>
            </div>
        </div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    const _fileInfoView = await uiFileInfoSetup(_Context, async (data) => {

        _Context.waitModal.show({
            msg: 'connect...'
        })

        let res = await comFileUpdate({
            hostUrl: host_url,
            id: data.id,
            changeData: data.changeData
        });

        console.log(res);

        _Context.waitModal.close();


        _fileListView.updateList();
    });
    _rootElm.querySelector('.fileinfo-container').appendChild(_fileInfoView.element);

    const host_url = _Context.host_url;

    //메뉴바 만들기 
    const _menuBar = await uiMenuBarSetup(_Context);
    //메뉴 이밴트 핸들러 등록
    _menuBar.setCallback(async (menuName, btnName) => {

        console.log(menuName);

        try {
            if (btnName === 'File') {
                switch (menuName) {
                    case 'Refresh':
                        {
                            _fileListView.updateList()

                        }
                        break;
                    case 'Upload':
                        {
                            let form_data = await new Promise(async (resolve, reject) => {

                                _Context.fileUploadForm.show({
                                    onCallback: async function (data) {
                                        // console.log(file);
                                        resolve(data);
                                    },
                                    directory: _fileListView.getSelectedDirectory()
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
                                    fileType: form_data.fileType,
                                    title: form_data.title,
                                    description: form_data.description,
                                    directory: form_data.directory,
                                    isPublic: form_data.isPublic,
                                    md5: hash
                                });

                                console.log(_res)

                                if (_res.r === 'ok') {
                                    await _fileListView.updateList();
                                }
                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'cancel'
                                });
                            }
                        }
                        break;
                    case 'Download':
                        {
                            let items = _fileListView.getSelectedItem();



                            for (let i = 0; i < items.length; i++) {
                                const _id = items[i].dataset._id;
                                const fileName = items[i].dataset.fileName;

                                let resp = await comFileDownload({
                                    fileID: _id
                                });

                                let _blob = await resp.blob()
                                const url = window.URL.createObjectURL(_blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;

                                // the filename you want
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);


                            }




                            /*
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

                                    // console.log(res)
                                    // if (res.r === 'ok') {
                                    //     await _updateList();
                                    // }
                                }
                                catch (err) {
                                    console.log(err)
                                }
                            }
                            */
                        }
                        break;
                    case 'Delete':
                        {
                            let items = _fileListView.getSelectedItem();

                            console.log(items)

                            _Context.progressBox.show({
                                msg: 'delete',
                            });


                            for (let i = 0; i < items.length; i++) {
                                const _id = items[i].dataset._id;

                                await comFileDelete({
                                    id: _id,
                                    host_url: host_url
                                })

                                _Context.progressBox.update({
                                    name: `${i + 1}/${items.length}`,
                                    progress: i / items.length * 100,
                                });
                            }

                            _Context.progressBox.closeDelay(200);
                            await _fileListView.updateList();
                        }
                        break;
                }
            }
            else if (btnName === 'List') {
                switch (menuName) {
                    case 'selectAll':
                        {
                            _fileListView.selectAll();

                        }
                        break;
                    case 'unSelectAll':
                        {
                            _fileListView.unSelectAll();
                        }
                        break;
                }
            }
            else if (btnName === 'Dir') {



                const selDir = menuName;
                if (selDir === 'all') {
                    _fileListView.changeDirectory('');
                }
                else if (selDir === 'selectDir') {
                    // case 'selectDir':
                    // {
                    let selDir = prompt(
                        'Select Directory'
                    )

                    if (selDir !== null) {
                        _fileListView.changeDirectory(selDir);
                        await _fileListView.updateList();
                    }
                    else {
                        _Context.messageModal.show({
                            msg: 'cancel'
                        });
                    }
                    // }
                    // break;
                }
                else {
                    _fileListView.changeDirectory(selDir);
                }
                await _fileListView.updateList();
            }
        }
        catch (e) {
            console.log(e);
            _Context.uiMessage.show(e.message);
        }

    });
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);

    ////////////////////////////////////////////

    //file list view setup
    const _fileListView = await uiFileListSetup(_Context);
    _rootElm.querySelector('.filelist-container').appendChild(_fileListView.element);
    _fileListView.setOnSelect(async ({ item, _id }) => {

        const objMng = _Context.objViewer.objMng;
        
        objMng.clearObject();

        console.log(item)
        _Context.waitModal.show({
            msg: 'loading...'
        })

        try {

            let res = await (await (fetch(`${host_url}/com/file/findOne/${_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/text',
                    'authorization': localStorage.getItem('jwt_token')
                }
            }))).json();
            // console.log(res)
            if (res.r === 'ok') {

                _Context.waitModal.close();
                _Context.progressBox.show();

                _fileInfoView.setData(res.data);

                let _type = res.data.fileType.split('/')
                

                if (_type[0] === 'image') {
                    let _tex = await objMng.loadTexture({
                        textureFile: res.data._id,
                        repo_ip: res.data.repo_ip,
                        type : res.data.fileType,
                        onProgress: (progress) => {
                            console.log(progress)
                            _Context.progressBox.update(progress);
                        }
                    });

                    // console.log(_tex.source.data.width)

                    objMng.addPlane({
                        width: _tex.source.data.width,
                        height: _tex.source.data.height,
                        map: _tex,
                        color: 0xffffff,
                    });
                    // console.log(_tex);
                    await _Context.progressBox.closeDelay(300);
                }
                else if (_type[0] === 'application') {
                    switch (_type[1]) {
                        case 'fbx':
                            {

                                let _obj = await objMng.addObject_fbx({
                                    file_id: res.data._id,
                                    repo_ip: res.data.repo_ip,
                                    onProgress: (progress) => {
                                        console.log(progress)
                                        _Context.progressBox.update(progress);
                                    }
                                });
                                if (!_obj) {
                                    _Context.messageModal.show({
                                        msg: 'file load error : ' + res.data._id
                                    });
                                }
                            }
                            break;
                        case 'hdr':
                        case 'exr':
                            {
                                objMng.setEnvMap({
                                    file_id: res.data._id,
                                    repo_ip: res.data.repo_ip,
                                    type: res.data.fileType,
                                    onProgress: (progress) => {
                                        console.log(progress)
                                        _Context.progressBox.update(progress);
                                    }
                                });
                            }
                            break;
                        case 'text':
                            {
                                if(res.data.directory === 'prefab') {
                                    
                                    const entity = await objMng.loadPrefab({
                                        fileID: res.data._id,
                                        repo_ip: res.data.repo_ip
                                    });

                                    objMng.addEntity({
                                        entity: entity
                                    });

                                    await objMng.resolveChildPrefab({
                                        entity: entity,
                                        onProgress: (progress) => {
                                            _Context.progressBox.setProgress(progress);
                                        }
                                    });
    
                                    console.log('end resolve')

                                }
                            }
                            break;
                    }
                    await _Context.progressBox.closeDelay(300);
                    // _Context.progressBox.close()
                }
            }
        }
        catch (err) {
            console.log(err)
            _Context.messageModal.show({
                msg: 'file load error : ' + _id
            });
        }

        _Context.waitModal.close();
        _Context.progressBox.close();
    });
    

    ////////////////////////////////////////////
    const _elmObjViewer = _rootElm.querySelector('.obj-viewer-container');

    _Context.objViewer = await objectViewerSetup({
        Context: theApp,
        container: _elmObjViewer,
        window_size : {
            width : 512,
            height : 512
        }
    });

    _Context.objViewer.elvis.startRender();

    _Context.body_container.appendChild(_rootElm);
    console.log('complete setup uiMain');

    return {
        element: _rootElm
    }

}