
import { makeFormBody, get_file_list, remove_file } from "../../../modules/comLibs/utils.js";

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">

        <div class="w3-bar w3-black" name="navibar">
            <button class="w3-bar-item w3-button" for="Gallery" > Gallery</button>
            <button class="w3-bar-item w3-button" for="Space" > Space </button>
            <button class="w3-bar-item w3-button" for="Object" > Object</button>
            <button class="w3-bar-item w3-button" for="Trigers" > Trigers</button>
        </div>

        <div name="navbody" >
            <div name='Gallery' class="w3-container w3-panel w3-hide" >
                <div name='menu' >
                    <button name='new' class='w3-button w3-teal'>New</button>
                </div>
                <ul class='w3-ul'>
                </ul>
            </div>
            <div name='Space' class="w3-container w3-hide w3-panel" >
                <div name='menu'>
                    <button name='new' class='w3-button w3-teal'>New space</button>
                    
                </div>
                <ul class='w3-ul' >
                </ul>
            </div>
            <div name='Object' class="w3-container w3-hide w3-panel" >
                <div name='menu'>
                    <button name='find' class='w3-button w3-teal'>find</button>
                    <button name='Object' class='w3-button w3-teal'>Object</button>
                    <button name='Entity' class='w3-button w3-teal'>Entity</button>
                </div>
                
                <ul class='w3-ul' >
                </ul>
            </div>
            <div name='Trigers' class="w3-container w3-hide w3-panel" >
                <div name='menu'>
                    <button name='find' class='w3-button w3-teal'>find</button>
                </div>
                <ul class='w3-ul' >
                </ul>
            </div>

        </div>

        
    </div>
    `;

    let selectGallery = null;
    let selectObject = null;
    const typeTable = ['전시물', '인태리어', '건물', 'trigger', 'entity'];

    const host_url = _Context.host_url;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    const _rootElm = document.querySelector('.ui-container')
    _rootElm.appendChild(htmlDoc.querySelector('.ui-view'));

    const _navibar = _rootElm.querySelector('[name=navibar]');
    const _navbody = _rootElm.querySelector('[name=navbody]');

    _rootElm.querySelector('[name=navibar]').addEventListener('click', async (e) => {
        const target = e.target;
        const name = target.getAttribute('for');
        const view = _rootElm.querySelector('[name=' + name + ']');

        //hide all
        const views = _rootElm.querySelector('[name=navbody]').children;

        for (let i = 0; i < views.length; i++) {
            views[i].classList.add('w3-hide');
            // views[i].classList.remove('w3-red');
        }
        view.classList.remove('w3-hide');

        //change navbar
        const navbars = _rootElm.querySelector('[name=navibar]').children;
        for (let i = 0; i < navbars.length; i++) {
            navbars[i].classList.remove('w3-red');
        }
        target.classList.add('w3-red');

        //change navbody
        switch (name) {
            case 'Gallery':
                // updateGalleryList();
                break;
            case 'Object':
                break;
        }

    });

    async function loadSpaceFromJson(filepath) {

        if (filepath !== undefined && filepath !== null && filepath !== '') {

            // async function loadScene(filepath) {
            console.log('load scene');

            _Context.progressBox.show();
            let sceneObj = await _Context.editor.fromJsonByUrl(
                {
                    url: `${_Context.host_url}/com/file/download?path=${filepath}`,
                    onProgress: (data) => {
                        _Context.progressBox.update(data);
                    }
                }
            );

            _Context.progressBox.close(500);

            console.log(sceneObj);

            //space object 추출 
            const space_dummy = sceneObj.getObjectByName("space_dummy")
            // console.log(space_dummy);

            return space_dummy;
        }
    }

    async function saveSpaceToGlb() {
        try {

            _Context.waitModal.show({
                msg: 'connecting...save space'
            });

            let _spaceDec = await new Promise((resolve, reject) => {
                _Context.spaceRegModal.show({
                    onCallback: function (data) {
                        resolve(data);
                    }
                })
            });

            let gltfData = await _Context.editor.toGltf(_spaceDec);

            console.log(gltfData);

            let _blob = new Blob([gltfData], {
                type: 'application/octet-stream'
            });

            let formData = new FormData();
            formData.append('file', _blob, `${_spaceDec.title}.glb`);
            let _url = `${_Context.host_url}/api/v2/webdisk/writeFile`;

            let result = await (await (fetch(_url, {
                method: 'POST',
                body: formData,
                // 이 부분은 따로 설정하고싶은 header가 있다면 넣으세요, 헤더이름은 대소 문자를 구분하지않음 무조건 소문자 취급
                headers: new Headers({
                    // 'Content-Type': 'multipart/form-data',
                    // 'upload-name': `${_spaceDec.title}.json`,
                    'write-directory': `${_Context.root_path}/space`,
                    'authorization': localStorage.getItem('jwt_token')
                })
            }))).json();

            console.log(result);


            // console.log(_spaceDec);
            // let sceneObj = _Context.editor.toJSON({
            //     title: _spaceDec.title,
            //     description: _spaceDec.description,
            // });

            // // console.log(sceneObj);

            // const result = await (await (fetch(`/api/v2/webdisk/writeTextFile`, {
            //     method: 'POST',
            //     body: JSON.stringify(sceneObj),
            //     headers: {
            //         'Content-Type': 'text/plain',
            //         'write-name': encodeURIComponent(`${sceneObj.object.userData.title}.json`),
            //         'write-directory': `${_Context.root_path}/space`,
            //         'authorization': _Context.jwt_token
            //     }
            // }))).json();

            // console.log(result);

            _Context.waitModal.close();
        }
        catch (e) {
            console.log(e);
        }
    }

    async function saveSpaceToJson() {

        try {

            console.log(_spaceDec);

            if (_spaceDec !== undefined) {
                _Context.waitModal.show({
                    msg: 'connecting...save space'
                });

                let sceneObj = _Context.editor.toJSON({
                    title: _spaceDec.title,
                    description: _spaceDec.description,
                });

                // console.log(sceneObj);

                const result = await (await (fetch(`/api/v2/webdisk/writeTextFile`, {
                    method: 'POST',
                    body: JSON.stringify(sceneObj),
                    headers: {
                        'Content-Type': 'text/plain',
                        'write-name': encodeURIComponent(`${_spaceDec.title}.json`),
                        'write-directory': `${_Context.root_path}/space`,
                        'authorization': _Context.jwt_token
                    }
                }))).json();

                console.log(result);
                _Context.waitModal.update(
                    `${_spaceDec.title} saved , filesize : ${result.size / 1024 / 1024} MB`
                );
                _Context.waitModal.close(3000);
            }
            else {
                _Context.waitModal.update('canceled');
                _Context.waitModal.close(1500);
            }
        }
        catch (e) {
            console.log(e);
        }

    }
    async function loadSpaceFromGlb() {

        let filepath = await new Promise((resolve, reject) => {

            _Context.fileSelectBox.show(
                async (data) => {
                    // console.log(data);
                    resolve(data);
                },
                'space'
            );
        });

        if (filepath) {

            // async function loadScene(filepath) {
            console.log('load scene');

            // console.log('save scene');
            // let data = this.root_dummy.toJSON()
            let _path = filepath.split('/').slice(0, -1).join('/')
            let _file = filepath.split('/').slice(-1).join('/')


            // let data = await (await (fetch(`${_Context.host_url}/api/v2/webdisk/readFile`, {
            //     method: 'POST',
            //     body: `${_path}\n${_file}`,
            //     headers: {
            //         'Content-Type': 'text/plain',
            //         'authorization': localStorage.getItem('jwt_token')
            //     }
            // }))).blob();

            // console.log(data);

            _Context.editor.fromGlb(`${_Context.host_url}/com/file/download?path=${filepath}`);

            // const loader = new THREE.ObjectLoader();
            // const object = await loader.parseAsync(data);

            // object.traverse(function (child) {
            //     console.log(child)
            //     if (child.isMesh) {
            //         scope.geometryList[child.geometry.uuid] = child.geometry;
            //         scope.materialList[child.material.uuid] = child.material;
            //     }
            // });

            // // console.log(object);
            // this.scene.remove(this.root_dummy);
            // this.root_dummy = object;
            // this.scene.add(this.root_dummy);

            // scene.add(object);

            // }
        }

    }

    ////////////////////////////////////////////////////////////////////////////////
    //gallery
    function _setupGalleryTab() {
        const _galleryRoot = _navbody.querySelector('[name=Gallery]');
        //style
        _galleryRoot.querySelector('ul').style.height = '416px';
        _galleryRoot.querySelector('ul').style.overflow = 'auto';

        async function getGalleryList({
            page = 1,
            unit = 999,
            host_url = '',
        }) {

            return await (await (fetch(`${host_url}/com/gallery/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': _Context.jwt_token
                },
                body: makeFormBody({
                    page: page,
                    unit: unit
                })
            }))).json();
        }

        function onSelectGallery(e) {

            if (selectGallery !== this.dataset.id) {
                selectGallery = this.dataset.id;
                console.log(`select gallery : ${this.dataset.id}`);

                //clear color
                const list = _galleryRoot.querySelector('ul').children;
                for (let i = 0; i < list.length; i++) {
                    list[i].classList.remove('w3-indigo');
                }
                this.classList.add('w3-indigo');

                _Context.uiGalleryEditor.updateGallery({
                    id: this.dataset.id,
                });
            }
        }

        async function onDeleteGallery(e) {
            e.stopPropagation();
            console.log(`delete ${this.dataset.id}`);

            if (confirm('정말 삭제하시겠습니까?')) {

                try {
                    const result = await (await (fetch(`${host_url}/com/gallery/delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                            'authorization': _Context.jwt_token
                        },
                        body: makeFormBody({
                            id: this.dataset.id
                        })
                    }))).json();

                    console.log(result);

                    alert(result.r);

                    updateGalleryList();
                }
                catch (e) {
                    alert(e.message);
                }
            }
        }
        async function updateGalleryList() {

            _Context.waitModal.show({
                msg: 'connecting...'
            });

            let result = await getGalleryList({});

            console.log(result);

            _Context.waitModal.close();

            if (result.r == 'ok') {
                const listData = result.list;

                let list = _galleryRoot.querySelector('ul');
                list.innerHTML = '';

                // console.log()

                for (let i = 0; i < listData.length; i++) {
                    let item = listData[i];
                    // let li = document.createElement('li');
                    // li.className = 'w3-hover-indigo w3-bar';

                    const li = parser.parseFromString(
                        `
                    <li class="w3-bar" data-id=${item._id} >

                        <span class="w3-bar-item w3-button w3-xlarge w3-right" title="delete" >&times;</span>

                        <div class="w3-bar-item">
                            <span class="w3-large">${item.title}</span>
                            
                            <br>
                            <span>${item.rdate}</span>
                        </div>
                    </li>
                    `
                        , 'text/html').querySelector('li');
                    // li.dataset.id = item._id;
                    li.addEventListener('click', onSelectGallery.bind(li));
                    li.querySelector('span[title=delete]').addEventListener('click', onDeleteGallery.bind(li));
                    // li.querySelector('button[name=edit]').addEventListener('click', onEditGallery.bind(li));
                    // li.appendChild(_content);

                    list.appendChild(li);
                }
            }
        }

        //new btn
        _galleryRoot.querySelector('[name=new].w3-button').addEventListener('click', async (e) => {

            _Context.galleryReg.show({
                onCallback: async (data) => {
                    console.log(data);
                    try {
                        const result = await (await fetch(host_url + '/com/gallery/insert', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'authorization': _Context.jwt_token
                            },
                            body: makeFormBody(data)
                        })
                        ).json();

                        console.log(result);
                        alert(result.r);
                        updateGalleryList();
                    }
                    catch (e) {
                        console.log(e);
                        alert(e.message);
                    }


                }
            });
        });

        return {
            updateGalleryList: updateGalleryList,
            root: _galleryRoot
        }

    }
    ////////////////////////////////////////////////////////////////////////////////
    //space
    function _setupSpaceTab() {
        const _tabRoot = _navbody.querySelector('[name=Space]');
        const _listElm = _tabRoot.querySelector('ul');

        //new space
        _tabRoot.querySelector('[name=new].w3-button').addEventListener('click', async (e) => {
            try {

                let _spaceDec = await new Promise((resolve, reject) => {
                    _Context.spaceRegModal.show({
                        onCallback: function (data) {
                            resolve(data);
                        }
                    })
                });

                console.log(_spaceDec);

                if (_spaceDec !== undefined) {

                    //remove  space_dummy
                    _Context.editor.clearScene();

                    //init space
                    _Context.editor.initSpace({
                        title: _spaceDec.title,
                        description: _spaceDec.description
                    });


                    const filename = `${_spaceDec.title}.json`;
                    let _scenedata = JSON.stringify(_Context.editor.toJSON());

                    _Context.waitModal.show({
                        msg: `save space ${filename}`
                    });

                    const result = await (await (fetch(`/api/v2/webdisk/writeTextFile`, {
                        method: 'POST',
                        body: _scenedata,
                        headers: {
                            'Content-Type': 'text/plain',
                            'write-name': encodeURIComponent(filename),
                            'write-directory': `${_Context.root_path}/space`,
                            'authorization': _Context.jwt_token
                        }
                    }))).json();
                    console.log(result);

                    if (result.r == 'ok') {
                        _Context.waitModal.update(
                            `${filename} saved , filesize : ${result.size / 1024 / 1024} MB`
                        );
                        _Context.waitModal.close(500);
                    }
                    else {

                        _Context.waitModal.update(
                            result.message
                        );
                        _Context.waitModal.close(1500);
                    }

                    updateSpaceList();

                }
                else {
                    alert('취소됨');
                }
            }
            catch (e) {
                console.log(e);
                alert(e.message);
            }
        });


        async function onSaveSpace(e) {

            e.stopPropagation();

            let filename = this.dataset.filename

            if (filename !== undefined && filename !== '') {

                try {

                    let root_dummy = _Context.editor.root_dummy;

                    _Context.waitModal.show({
                        msg: 'archiving scene data'
                    });

                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 500);
                    });

                    const _outputDummy = root_dummy.clone();

                    _outputDummy.userData.title = filename

                    _outputDummy.traverse(function (child) {
                        if (child.userData.isDummy) {
                            child.children = [];
                        }
                    });

                    console.log('_outputDummy', _outputDummy);

                    let _json = await _outputDummy.toJSON();

                    await _Context.waitModal.close();

                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 100);
                    });

                    console.log(_json)

                    const _scenedata = JSON.stringify(_json);

                    if (confirm(`save ${filename} ? (size : ${_.round(_scenedata.length /1000, 2)} kb)`)) {

                        _Context.waitModal.show({
                            msg: `save space : ${filename}`
                        });

                        const result = await (await (fetch(`/api/v2/webdisk/writeTextFile`, {
                            method: 'POST',
                            body: _scenedata,
                            headers: {
                                'Content-Type': 'text/plain',
                                'write-name': encodeURIComponent(filename),
                                'write-directory': `${_Context.root_path}/space`,
                                'authorization': _Context.jwt_token
                            }
                        }))).json();
                        console.log(result);

                        if (result.r == 'ok') {
                            
                            let _size = result.size / 1000000;
                            if(_size > 0) {
                                _Context.waitModal.update(
                                    `${filename} saved , filesize : ${ _.round(_size,3) } MB`
                                );
                            }
                            else {
                                _Context.waitModal.update(
                                    `${filename} saved , filesize : ${ _.round(result.size/1000,1)} Kbyte`
                                );
                            }

                            // _Context.waitModal.update(
                            //     `${filename} saved , filesize : ${result.size / 1024 / 1024} MB`
                            // );
                            await _Context.waitModal.close(1000);
                        }
                        else {
                            _Context.waitModal.update(
                                result.message
                            );
                            await _Context.waitModal.close(1000);
                        }
                    }
                    else {
                        alert('canceled');
                    }

                }
                catch (e) {
                    console.log(e);
                    alert(e.message);
                }
            }
            else {
                alert('취소 되었습니다.');
            }

        }

        async function onLoadSpace(e) {
            e.stopPropagation();
            try {

                const filename = this.dataset.filename;

                if (confirm(`load ${filename}`)) {

                    let space_dummy = await loadSpaceFromJson(`${_Context.root_path}/space/${filename}`);

                    if (space_dummy) {

                        console.log('setup space');
                        _Context.progressBox.show();
                        //setup space dummy,프리펩 정리 
                        await _Context.editor.setupSpaceDummy(
                            space_dummy,
                            (data) => {
                                _Context.progressBox.update(data);
                            }
                        );
                        console.log('setup space done',space_dummy);
                        _Context.progressBox.close();
                    }
                    else {
                        alert('잘못된 파일입니다.');
                    }
                }
                else {
                    alert('취소 되었습니다.');
                }
            }
            catch (e) {
                alert(e.message);
                console.log(e);
            }
        }

        async function onSelectSpace(e) {

            e.stopPropagation();
            console.log('select ', this);

            // let filename = this.dataset.filename
            //clear color
            // const list = _galleryRoot.querySelector('ul').children;
            const list = _listElm.children;
            for (let i = 0; i < list.length; i++) {
                list[i].classList.remove('w3-indigo');
            }
            this.classList.add('w3-indigo');

        };

        async function onDeleteSpce(e) {
            e.stopPropagation();
            console.log('delete', this);

            if (confirm(`remove ${this.dataset.filename}`)) {

                try {
                    _Context.waitModal.show({
                        msg: 'connecting...delete space'
                    });
                    let result = await remove_file({
                        path: `${_Context.root_path}/space/`,
                        file: this.dataset.filename
                    })

                    _Context.waitModal.close(1500);
                    updateSpaceList();
                }
                catch (e) {
                    console.log(e);
                    alert(e.message);
                }
            }

        };

        async function updateSpaceList() {

            let result = await get_file_list({
                path: `${_Context.root_path}/space`
            })

            if (result.r === 'ok') {
                const _spaceList = result.list;
                console.log(_spaceList);

                _listElm.innerHTML = '';

                for (let i = 0; i < _spaceList.length; i++) {
                    let _file = _spaceList[i];

                    const li = parser.parseFromString(
                        `
                    <li class="w3-bar" data-filename=${_file.name} >

                        
                        <span class="w3-bar-item w3-button w3-xlarge w3-right" title="delete" >&times;</span>
                        <button name='load' class='w3-button w3-teal w3-right'>Load</button>
                        <button name='save' class='w3-button w3-red w3-right'>Save</button>

                        <div class="w3-bar-item">
                            <span class="w3-large">${_file.name}</span>

                        </div>
                    </li>
                    `
                        , 'text/html').querySelector('li');

                    li.addEventListener('click', onSelectSpace.bind(li));
                    li.querySelector('span[title=delete]').addEventListener('click', onDeleteSpce.bind(li));
                    li.querySelector('button[name=load]').addEventListener('click', onLoadSpace.bind(li));
                    li.querySelector('button[name=save]').addEventListener('click', onSaveSpace.bind(li));
                    _listElm.appendChild(li);
                }
            }
        }

        return {
            root: _tabRoot,
            updateSpaceList: updateSpaceList
        }


    }
    ////////////////////////////////////////////////////////////////////////////////
    //object
    function _setupObjectTab() {
        const _tabRoot = _navbody.querySelector('[name=Object]');
        const _menu = _tabRoot.querySelector('[name=menu]');

        _tabRoot.querySelector('ul').style.height = '408px';
        _tabRoot.querySelector('ul').style.overflow = 'auto';

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

        function onSelectObject(e) {

            if (selectObject !== this.dataset.id) {
                selectObject = this.dataset.id;
                console.log(`select object : ${this.dataset.id}`);

                //clear color
                const list = _tabRoot.querySelector('ul').children;
                for (let i = 0; i < list.length; i++) {
                    list[i].classList.remove('w3-indigo');
                }
                this.classList.add('w3-indigo');
            }
        }

        async function onInstObject(e) {
            e.stopPropagation();
            console.log(`inst ${this.dataset.id}`);

            const objType = parseInt(this.dataset.type);
            switch (objType) {
                case 0:
                    {
                        //유물 
                        //프리펩에 등록되어 있는지 확인
                        // let object = _.find(_Context.editor.prefabList, { userData: { fileId: this.dataset.id } });
                        let object = _Context.editor.prefabDic[this.dataset.id];

                        if (object === undefined) {
                            
                            _Context.progressBox.show();

                            object = await _Context.editor.loadObject({
                                _id: this.dataset.id,
                                onProgress: (data) => {
                                    // console.log(data);
                                    _Context.progressBox.update(data);
                                }
                            })

                            // object.userData.fileId = this.dataset.id;
                            // object.userData.type = objType
                            
                            _Context.editor.prefabDic[object.userData.id] = object;

                            _Context.progressBox.close();

                            // _Context.editor.prefabList.push(object);
                        }
                        else {
                            //이미등록되어있으면 그냥 선택
                            console.log('already loaded and clone : ', this.dataset.id);
                        }

                        _Context.editor.setCursor(object);
                    }
                    break;
                case 1:
                    {
                        //인테리어
                        //프리펩에 등록되어 있는지 확인
                        let object = _Context.editor.prefabDic[this.dataset.id];
                        // let object = _.find(_Context.editor.prefabList, { userData: { fileId: this.dataset.id } });

                        if (object === undefined) {
                            _Context.progressBox.show();
                            object = await _Context.editor.loadObject({
                                _id: this.dataset.id,
                                onProgress: (data) => {
                                    // console.log(data);
                                    _Context.progressBox.update(data);
                                }
                            })

                            _Context.editor.prefabDic[object.userData.id] = object;
                            _Context.progressBox.close();
                            
                        }
                        else {
                            //이미등록되어있으면 그냥 선택
                            console.log('already loaded and clone : ', this.dataset.id);
                        }

                        if (_Context.editor.addSpace(object)) {
                            // alert('ok')
                        }
                        else {
                            alert('space를 먼저 생성해주세요.')
                        }
                    }
                    break;
                case 2:
                    {
                        //건물 
                        //프리펩에 등록되어 있는지 확인
                        // let object = _.find(_Context.editor.prefabList, { userData: { fileId: this.dataset.id } });
                        let object = _Context.editor.prefabDic[this.dataset.id];

                        if (object === undefined) {

                            _Context.progressBox.show()

                            let object = await _Context.editor.loadObject({
                                _id: this.dataset.id,
                                onProgress: (data) => {
                                    _Context.progressBox.update(data);
                                }
                            })
                            _Context.editor.prefabDic[this.dataset.id] = object;

                            _Context.progressBox.close();


                            if (_Context.editor.addSpace(object)) {
                                // alert('ok')
                            }
                            else {
                                alert('space를 먼저 생성해주세요.')
                            }
                        }
                        else {
                            //이미등록되어있으면 그냥 선택
                            console.log('already loaded and clone : ', this.dataset.id);
                            alert('이미 등록된 건물입니다.');
                        }

                    }
                    break;
                default:
                    break;
            }
        }
        async function updateObjectList() {

            _Context.waitModal.show({
                msg: 'connecting...Object list'
            });

            const result = await getComObjectList({
                host_url: host_url
            });

            _Context.waitModal.close();

            console.log(result);

            if (result.r === 'ok') {
                const _listElm = _tabRoot.querySelector('ul');
                _listElm.innerHTML = '';


                for (let i = 0; i < result.list.length; i++) {
                    const item = result.list[i];
                    const li = parser.parseFromString(
                        `
                    <li class="w3-bar" data-id=${item._id} data-type=${item.type} >
                        <button name='inst' class='w3-button w3-teal w3-right'>설치</button>
                        <div class="w3-bar-item">
                            <span class="w3-large">${item.title}</span>
                            <br>
                            <span>${item.rdate}</span>
                            <span>${typeTable[item.type]}</span>
                        </div>
                    </li>
                    `
                        , 'text/html').querySelector('li');

                    li.addEventListener('click', onSelectObject.bind(li));
                    li.querySelector('button[name=inst]').addEventListener('click', onInstObject.bind(li));


                    _listElm.appendChild(li);
                }
            }
        }

        async function updateEntityList() {
            const _listElm = _tabRoot.querySelector('ul');
            _listElm.innerHTML = '';

            {
                const entityName = 'BoxMesh'
                const type = 4;
                const li = parser.parseFromString(
                    `
                <li class="w3-bar" data-name=${entityName} data-type=3 >
                    <button name='inst' class='w3-button w3-teal w3-right'>설치</button>
                    <div class="w3-bar-item">
                        <span class="w3-large">Box</span><br>
                        <span>${typeTable[type]}</span>
                    </div>
                </li>
                `
                    , 'text/html').querySelector('li');

                li.addEventListener('click', onSelectObject.bind(li));
                li.querySelector('button[name=inst]').addEventListener('click', (e) => {
                    e.stopPropagation();

                    const object = _Context.editor.makeBoxMeshDummy();

                    if (_Context.editor.addSpace(object)) {
                        alert(`${entityName} 생성 완료`)
                    }
                    else {
                        alert('space를 먼저 생성해주세요.')
                    }

                });

                _listElm.appendChild(li);
            }

        }

        _menu.querySelector('[name=Entity]').addEventListener('click', () => {
            updateEntityList();
        });

        _menu.querySelector('[name=Object]').addEventListener('click', () => {
            updateObjectList();
        });

        return {
            updateObjectList: updateObjectList,
            root: _tabRoot
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    //triger
    function _setupTrigersTab() {
        const _tabRoot = _navbody.querySelector('[name=Trigers]');
        // const _listElm = _tabRoot.querySelector('[name=list]');

        async function updateList() {

            const _listElm = _tabRoot.querySelector('ul');
            _listElm.innerHTML = '';

            {
                const li = parser.parseFromString(
                    `
                    <li class="w3-bar" data-type=3 >
                        <button name='inst' class='w3-button w3-teal w3-right'>설치</button>
                        <div class="w3-bar-item">
                            <span class="w3-large">startPoint</span>
                            <br>
                            <span>trigger</span>
                        </div>
                    </li>
                    `, 'text/html').querySelector('li');

                li.addEventListener('click', () => {
                    console.log('Install start point trigger');

                    let _triger = _Context.editor.makeTrigerNode({
                        type: 3,
                        isDummy : true,
                        name: 'trigger',
                        code: 'startPoint',
                        fileId : 'TriggerObject.StartPoint'
                    })

                    _Context.editor.setCursor(_triger);
                });


                _listElm.appendChild(li);

            }

            {
                const li = parser.parseFromString(
                    `
                    <li class="w3-bar" data-type=3 >
                        <button name='inst' class='w3-button w3-teal w3-right'>설치</button>
                        <div class="w3-bar-item">
                            <span class="w3-large">Gate</span>
                            <br>
                            <span>trigger</span>
                        </div>
                    </li>
                    `, 'text/html').querySelector('li');

                li.addEventListener('click', () => {
                    console.log('install Gate trigger');
                    let _triger = _Context.editor.makeTrigerNode({
                        type: 3,
                        fileId : 'TriggerObject.Gate',
                        name: 'trigger',
                        isDummy : true,
                        code: 'Gate',
                        target: 'space0'
                    })

                    _Context.editor.setCursor(_triger);
                });

                _listElm.appendChild(li);

            }
        }



        return {
            root: _tabRoot,
            updateList: updateList
        }
    }


    const GalleryTab = _setupGalleryTab();
    const ObjectTab = _setupObjectTab();
    const SpaceTab = _setupSpaceTab();
    const TrigersTab = _setupTrigersTab();

    await GalleryTab.updateGalleryList();
    await ObjectTab.updateObjectList();
    await SpaceTab.updateSpaceList();
    await TrigersTab.updateList();


    return {
        element: _rootElm,
        TrigersTab: TrigersTab,
        GalleryTab: GalleryTab,
        SpaceTab: SpaceTab,
        ObjectTab: ObjectTab,
        getSelectGallery: () => {
            return selectGallery;
        }
    }
}