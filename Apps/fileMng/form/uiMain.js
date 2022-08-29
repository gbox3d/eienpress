import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';

import uiFileListSetup from "./uiFileList.js";
import uiFileInfoSetup from "./uiFileInfo.js";


export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class="filelist-container" ></div>
		<div class="fileinfo-container" ></div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    const _fileListView = await uiFileListSetup(_Context);
    _rootElm.querySelector('.filelist-container').appendChild(_fileListView.element);

    const _fileInfoView = await uiFileInfoSetup(_Context);
    _rootElm.querySelector('.fileinfo-container').appendChild(_fileInfoView.element);

    const host_url = _Context.host_url;

    _Context.uiMenuBar.initCallBack(async (menuName) => {

        console.log(menuName);

        switch (menuName) {
            case 'Upload':
                {
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
                            fileType: form_data.fileType,
                            title: form_data.title,
                            description: form_data.description,
                            directory: form_data.directory,
                            isPublic: form_data.isPublic,
                            md5: hash
                        });

                        console.log(_res)

                        if (_res.r === 'ok') {
                            await _updateList();
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
                }
                break;
            case 'Delete':
                {
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

                }
                break;
        }

    })

    _fileListView.setOnSelect(async ({item,_id}) => {
        console.log(item)

        try {

            let res = await (await (fetch(`${host_url}/com/file/findOne/${_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/text',
                    'authorization': localStorage.getItem('jwt_token')
                }
            }))).json();
            console.log(res)

            if (res.r === 'ok') {

                _fileInfoView.setData(res.data);

                let _type = res.data.fileType.split('/')

                if (_type[0] === 'image') {
                    let _tex = await _Context.objViewer.loadTexture({
                        textureFile: res.data._id
                    });

                    console.log(_tex.source.data.width)

                    _Context.objViewer.addPlane({
                        width: _tex.source.data.width,
                        height: _tex.source.data.height,
                        map: _tex,
                        color: 0xffffff,
                    });
                    console.log(_tex);
                }
                else if (_type[0] === 'application') {
                    if (_type[1] === 'fbx') {
                        _Context.objViewer.addObject_fbx({
                            file_id: res.data._id
                        });
                    }
                }
            }
        }
        catch (err) {
            console.log(err)
        }

    });

    _Context.ui_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm
        // getSelection: function () {
        //     return select_Item;
        // }
    }

}