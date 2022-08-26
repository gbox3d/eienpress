import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div>
            <div class='object'>
                <button class='add w3-button w3-teal'>add</button>
                <button class="del w3-button w3-red">del</button>
                <button class="clear w3-button w3-blue">clear unused file</button>
            </div>
            <hr />
            <ul class='list' ></ul>
            
        </div>
    </div>
    `;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    const _rootElm = htmlDoc.querySelector('.ui-view')
    // _rootElm.appendChild(htmlDoc.querySelector('.ui-view'));
    // const sceneEditor = _Context.sceneEditor;
    const objectViewer = _Context.objViewer;
    const attrEditor = _Context.attrEditor;

    const host_url = _Context.host_url;
    let CurrentSelectObject = null;

    const progressBox = _Context.progressBox;
    const waitModal = _Context.waitModal;

    const typeTable = ['전시물', '인태리어', '건물'];

    const _addBtn = _rootElm.querySelector('.object .add');
    const _delBtn = _rootElm.querySelector('.object .del');
    const _clearBtn = _rootElm.querySelector('.object .clear');

    _Context.ui_container.appendChild(_rootElm);

    //object add
    _addBtn.addEventListener('click', (evt) => {
        console.log('add object');

        _Context.objectReg.show({
            onCallback: async (regData) => {
                console.log(regData);

                if (!regData) {
                    _Context.messageModal.show({
                        msg: '취소됨.'
                    });
                    return
                }

                try {
                    const fbxFileObj = await makeFileObj(regData.fbxFile);
                    const textureFileObj = await makeFileObj(regData.textureFile);

                    console.log(fbxFileObj);
                    console.log(textureFileObj);

                    //upload fbx file
                    const fbxFileRes = await comFileUpload({
                        fileObj: fbxFileObj,
                        title: `${fbxFileObj.file.name}`,
                        description: `set : ${fbxFileObj.file.name},${textureFileObj.file.name}`,
                        directory: 'object'
                    });

                    //upload texture file
                    const textureFileRes = await comFileUpload({
                        fileObj: textureFileObj,
                        title: `${textureFileObj.file.name}`,
                        description: `set : ${fbxFileObj.file.name},${textureFileObj.file.name}`,
                        directory: 'object'
                    });


                    //upload object
                    {
                        // let params = {

                        // };
                        // console.log(params)

                        // let query = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');

                        let insert_result = await (await (fetch(`${host_url}/com/object/insert`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                                'authorization': localStorage.getItem('jwt_token')
                            },
                            body: makeFormBody({
                                title: regData.objectName,
                                description: regData.objectDesc,
                                type: regData.objectType,
                                modelFile: fbxFileRes.data.insertedId,
                                textureFile: textureFileRes.data.insertedId
                            })
                        }))).json();

                        console.log(insert_result);

                        alert('저장 완료');
                        updateList();

                    }

                }
                catch (e) {
                    console.log(e);
                    alert('저장 실패');
                }



            }
        })

    });

    //object del
    _delBtn.addEventListener('click', async (evt) => {
        console.log('del object');

        if (!CurrentSelectObject) {
            alert('선택된 오브젝트가 없습니다.');
            return;
        }

        try {

            waitModal.show({
                msg: '삭제 중입니다.'
            })

            let result = await (await fetch(`${host_url}/com/object/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    sid: CurrentSelectObject
                })
            })).json();

            waitModal.close();

            console.log(result);
            if (result.r === 'ok') {
                alert('삭제 완료');

                updateList();
            }
            else {
                alert('삭제 실패');
            }
        }
        catch (e) {
            console.log(e);
            alert('삭제 실패');
        }

    });

    // clear unused file
    _clearBtn.addEventListener('click', async (evt) => {
        console.log('clear file');
        waitModal.show({
            msg: '정리 중입니다.'
        })

        let used_list = []

        //object list
        {
            let _res = await getComObjectList({
                host_url: host_url
            });

            let _list = _res.list;
            // console.log(_list);

            for (let i = 0; i < _list.length; i++) {
                let item = _list[i];
                if (item.modelFile) {
                    used_list.push(item.modelFile);
                }
                if (item.textureFile) {
                    used_list.push(item.textureFile);
                }
            }

        }


        console.log(used_list);
        
        //file list
        {
            let _res = await (await (fetch(`${host_url}/com/file/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    fileType: '',
                    skip: -1
                    // limit: 999999
                })
            }))).json();



            // console.log(_res.data);

            //delete unused file
            for (let i = 0; i < _res.data.length; i++) {
                let item = _res.data[i];
                if (used_list.indexOf(item._id) === -1) {
                    console.log(item._id)
                    let res = await (await (fetch(`${host_url}/com/file/delete/${item._id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/text',
                            'authorization': localStorage.getItem('jwt_token')
                        }
                    }))).json();
                    console.log(res);
                }
            }
        }

        waitModal.close();
        console.log('clear complete');



    });


    async function getComObjectList({
        page = 1,
        unit = 999,
        host_url = '',
    }) {

        return await (await (fetch(`${host_url}/com/object/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'authorization': localStorage.getItem('jwt_token')
            },
            body: makeFormBody({
                page: page,
                unit: unit
            })
        }))).json();
    }

    async function updateList() {

        const result = await getComObjectList({
            host_url: host_url
        });

        console.log(result);

        if (result.r === 'ok') {
            const _listElm = _rootElm.querySelector('.list');
            _listElm.innerHTML = '';

            result.list.forEach(item => {

                const li = document.createElement('li');
                li.classList.add('item');
                li.innerHTML = `
                <div> title: ${item.title}  </div>
                <div> type: ${typeTable[item.type]}  </div>
                <div> 등록일: ${item.rdate}  </div>
                `

                li.dataset._id = item._id;
                li.dataset.modelFile = item.modelFile;
                li.dataset.textureFile = item.textureFile;
                li.dataset.type = item.type;


                _listElm.appendChild(li);
            });
        }
    }

    //오브젝트 선택
    _rootElm.querySelector('.list').addEventListener('click', async (evt) => {
        console.log(evt.target);

        let _li = evt.target.parentElement;

        //check li
        if (_li.tagName === 'LI') {

            const _id = _li.dataset._id;
            const _modelFile = _li.dataset.modelFile;
            const _textureFile = _li.dataset.textureFile;
            const _type = _li.dataset.type;

            //clear select
            _rootElm.querySelectorAll('.list .item').forEach(item => {
                item.classList.remove('selected');
            });

            _li.classList.add('selected');

            console.log(_id, _modelFile, _textureFile, _type);

            CurrentSelectObject = _id;

            // objectViewer.removeAllChild();
            objectViewer.clearObject();

            try {
                progressBox.show()

                let object = await objectViewer.addObject({
                    modelFile: _modelFile,
                    textureFile: _textureFile,
                    diffuseColor: '#ffffff',
                    onProgress: (progress) => {
                        console.log(progress);
                        progressBox.update(progress);
                    }
                })

                await attrEditor.updateForm({
                    _id: _id,
                });
                console.log(object);

                progressBox.close()

            }
            catch (e) {
                console.log(e);
                progressBox.close()
                alert('오브젝트 로드 실패');
            }
        }
    });

    _Context.waitModal.show({
        msg : '리스트를 불러오는 중입니다.'
    })

    await updateList();

    _Context.waitModal.close();

    return {
        element: _rootElm,
        updateList: updateList
    }

}