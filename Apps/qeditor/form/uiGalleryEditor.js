import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import * as THREE from 'three';
import { Euler, MathUtils, Vector3 } from "three";

export default function (_Context) {

    const _htmlText = `
    <div class="form-root">

    <div name="navbody" >
        <div name='Gallery' class="w3-container w3-panel w3-hide">
            <h2>Gallery Property editor</h2>
            <form class="w3-container w3-light-grey" >
                <label>id</label>
                <input type="text" name="id" disabled class="w3-input w3-border-0" />
                
                <label>title</label>
                <input type="text" name="title" class="w3-input w3-border-0"/>
                <label>description</label>
                <textarea name="description" class="w3-input w3-border-0"></textarea>
                <label>startup space</label>
                <select class="w3-select" name="spaceSel"></select>
                
                <label>공간 목록</label>
                <ul name="spaceList" class="w3-ul w3-border-0">
                </ul>
                <div name='spaceMenu' >
                    <button name='add' class='w3-button w3-teal'>Add space</button> 
                </div>

                <label> 전시관 바로가기 </label>
                <input type="text" name="galleryLink" class="w3-input w3-border-0"/>
                <button name='goGallery' class='w3-button w3-teal'>Go gallery</button>

                <button class="w3-button w3-block w3-green w3-section w3-padding">Save</button>
            </form>

        </div>

        <div name='Space' class="w3-container w3-panel w3-hide">
            <h2>Space Property editor</h2>
            <form class="w3-container w3-light-grey" >
                <label>id</label>
                <input type="text" name="id" disabled class="w3-input w3-border-0" />

                <label>title</label>
                <input type="text" name="title" class="w3-input w3-border-0"/>
                <label>description</label>
                <textarea name="description" class="w3-input w3-border-0"></textarea>
            </form>
        </div>

        <div name='Object' class="w3-container w3-panel w3-hide">
            <h2>Object Property editor</h2>
            <form class="w3-container w3-light-grey" >

                <div class="w3-row-padding" name="objectId">
                    <div class="w3-half">
                        <label>id</label>
                        <input type="text" name="id" disabled class="w3-input w3-border-0" />
                    </div>

                    <div class="w3-half">
                        <label>uuid</label>
                        <input type="text" name="uuid" disabled class="w3-input w3-border-0" />
                        
                    </div>
                </div>

                <div name='transformProp' >
                    <label>position</label>
                    <div class="w3-row-padding" name="positon" >
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">X:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="xpos" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Y:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="ypos" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Z:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="zpos" type="text">
                                </div>
                            </div>
                        </div>
                    </div>

                    <label>rotation</label>
                    <div class="w3-row-padding" name="rotation" >
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">X:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="xrot" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Y:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="yrot" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Z:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="zrot" type="text">
                                </div>
                            </div>
                        </div>
                    </div>
                    <label>scale</label>
                    <div class="w3-row-padding" name="scale" >
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">X:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="xscale" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Y:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="yscale" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="w3-third">  
                            <div class="w3-row w3-section">
                                <div class="w3-col" style="width:20px">Z:</div>
                                <div class="w3-rest">
                                    <input class="w3-input w3-border" name="zscale" type="text">
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                
                

                <label>userData</label>
                <textarea name="userData" class="w3-input w3-border-0"></textarea>
            </form>
            <hr/>
            <div name='ObjectMenu' >
                <button name='remove' class='w3-button w3-teal'>Remove</button>
                <button name='update' class='w3-button w3-teal'>Update</button>
                <button name='clone' class='w3-button w3-teal'>Clone</button>
            </div>
        </div>
        
    </div>
    `;

    const host_url = _Context.host_url;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    const _rootElm = document.querySelector('.bottom-continer .gallery-editor')
    _rootElm.appendChild(htmlDoc.querySelector('.form-root'));

    function setupGalleryProperty() {
        const _tabRoot = _rootElm.querySelector('[name=Gallery]');
        const _formElm = _tabRoot.querySelector('form');
        const _spaceListElm = _formElm.querySelector('ul[name=spaceList]');
        const _spaceSelElm = _formElm.querySelector('select[name=spaceSel]');
        const _galleryLink = _formElm.querySelector('input[name=galleryLink]');
        
        _spaceListElm.style.height = '200px';

        _formElm.querySelector('[name=spaceMenu] [name=add]').addEventListener('click', async function (e) {
            e.preventDefault();

            let _path = await new Promise(resolve => {
                _Context.fileSelectBox.show(
                    async (data) => {
                        resolve(data);
                    },
                    'space'
                );
            });

            let _findResult = _.find(_spaceListElm.children, elm => elm.dataset.filePath === _path);

            console.log(_findResult);

            if (_findResult === undefined) {
                let _li = document.createElement('li');
                _li.innerHTML = _path.split('/').pop();;
                _li.dataset.filePath = _path;
                _spaceListElm.appendChild(_li);
            }
            else {
                alert(`${_path} is already exist`);
            }
        });

        _formElm.addEventListener('submit', async function (e) {
            e.preventDefault();

            let _pathes = _.map(_spaceListElm.children, (elm) => {
                return {
                    filePath: elm.dataset.filePath
                }
            });

            console.log(_pathes);

            console.log(_spaceSelElm.value)

            try {
                //call com/gallery/space/update
                let _result = await (await fetch(`${host_url}/com/gallery/update`, {
                    method: 'POST',
                    body: makeFormBody({
                        id: _formElm.id.value,
                        title: _formElm.title.value,
                        description: _formElm.description.value,
                        space: JSON.stringify(_pathes),
                        startUpSpace: _spaceSelElm.value

                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': _Context.jwt_token
                    }

                })).json();

                console.log(_result);

                alert(`Gallery ${_formElm.title.value} is updated ${_result.info}`);

            }
            catch (e) {
                alert(e);
            }

        });

        _formElm.querySelector('[name=goGallery]').addEventListener('click', async function (e) {
            e.preventDefault();

            console.log(_spaceSelElm.value);

            if(_spaceSelElm.value === '' || _spaceSelElm.value === undefined) {
                alert('Please select start up space');
                return;
            }

            //open new tab 
            window.open(_galleryLink.value);
            

        });


        return {
            element: _rootElm,
            updateForm: async function ({ id }) {

                let result = await (await fetch(`${host_url}/com/gallery/detail`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'authorization': _Context.jwt_token
                    },
                    body: makeFormBody({
                        id: id
                    })
                })).json();

                console.log(result);

                if (result.r === 'ok') {
                    const _formData = result.data;

                    _formElm.querySelector('[name="id"]').value = _formData._id;
                    _formElm.querySelector('[name="title"]').value = _formData.title;
                    _formElm.querySelector('[name="description"]').value = _formData.description;

                    console.log(_formData.space);

                    _spaceSelElm.innerHTML = '';
                    _spaceListElm.innerHTML = '';

                    if (_formData.space) {
                        
                        for (let i = 0; i < _formData.space.length; i++) {

                            let option = document.createElement('option');
                            option.value = _formData.space[i].filePath;
                            //extract file name
                            option.innerHTML = _formData.space[i].filePath.split('/').pop();
                            _spaceSelElm.appendChild(option);
                        }

                        _spaceSelElm.value = _formData.startUpSpace;
                        
                        for (let i = 0; i < _formData.space.length; i++) {
                            let _li = document.createElement('li');
                            _li.dataset.filePath = _formData.space[i].filePath;
                            _li.innerHTML = _formData.space[i].filePath.split('/').pop();
                            _spaceListElm.appendChild(_li);

                        }
                    }
                    //https://cam2us.ubiqos.co.kr:24030/Apps/gWalker/?gid=628a00bf6fdf6bbe514dfe50
                    _galleryLink.value = `${host_url}/Apps/gWalker/?gid=${_formData._id}`;

                }
                else {
                    return result
                }


            }
        }
    }

    function setupSpaceProperty() {
        const _tabRoot = _rootElm.querySelector('[name=Space]');
        const _formElm = _rootElm.querySelector('[name=Space] form');

    }

    function setupObjectProperty() {
        const _tabRoot = _rootElm.querySelector('[name=Object]');
        const _formElm = _rootElm.querySelector('[name=Object] form');
        const _menu = _rootElm.querySelector('[name=Object] [name=ObjectMenu]');

        _formElm.style.height = '300px';
        _formElm.style.overflowY = 'scroll';

        //menu event 
        _menu.querySelector('[name=remove]').addEventListener('click', function (e) {
            e.preventDefault();
            let id = parseInt(_formElm.querySelector('[name="id"]').value)

            _Context.editor.removeObject(id);
        });

        _menu.querySelector('[name=update]').addEventListener('click', function (e) {
            e.preventDefault();

            let id = parseInt(_formElm.querySelector('[name="id"]').value)

            _Context.editor.updateTranform({
                objId: id,
                position: new Vector3(
                    parseFloat(_formElm.querySelector('[name="xpos"]').value),
                    parseFloat(_formElm.querySelector('[name="ypos"]').value),
                    parseFloat(_formElm.querySelector('[name="zpos"]').value)
                ),
                rotation: new Euler(
                    THREE.MathUtils.degToRad(parseFloat(_formElm.querySelector('[name="xrot"]').value) ),
                    THREE.MathUtils.degToRad(parseFloat(_formElm.querySelector('[name="yrot"]').value) ),
                    THREE.MathUtils.degToRad(parseFloat(_formElm.querySelector('[name="zrot"]').value) )
                    
                ),
                scale: new Vector3(
                    parseFloat(_formElm.querySelector('[name="xscale"]').value),
                    parseFloat(_formElm.querySelector('[name="yscale"]').value),
                    parseFloat(_formElm.querySelector('[name="zscale"]').value)
                )
            });

            _Context.editor.updateUserData({
                objId: id,
                userData: JSON.parse(_formElm.querySelector('[name="userData"]').value)
            });
        });

        _menu.querySelector('[name=clone]').addEventListener('click', function (e) {
            e.preventDefault();
            _Context.editor.cloneSelectedObject();
        });

        return {
            element: _rootElm,
            updateForm: async function ({ object }) {
                _formElm.querySelector('[name="id"]').value = object.id;
                _formElm.querySelector('[name="uuid"]').value = object.uuid;

                console.log( 'update form', object);

                if(object.userData.type === 2) {
                    _formElm.querySelector('[name="transformProp"]').classList.add('w3-hide');
                }
                else {
                    _formElm.querySelector('[name="transformProp"]').classList.remove('w3-hide');
                }

                _formElm.querySelector('[name="xpos"]').value = _.round(object.position.x, 3);
                _formElm.querySelector('[name="ypos"]').value = _.round(object.position.y, 3);
                _formElm.querySelector('[name="zpos"]').value = _.round(object.position.z, 3);

                _formElm.querySelector('[name="xrot"]').value = _.round(THREE.MathUtils.radToDeg(object.rotation.x), 3);
                _formElm.querySelector('[name="yrot"]').value = _.round(THREE.MathUtils.radToDeg(object.rotation.y), 3);
                _formElm.querySelector('[name="zrot"]').value = _.round(THREE.MathUtils.radToDeg(object.rotation.z), 3);

                _formElm.querySelector('[name="xscale"]').value = _.round(object.scale.x, 3);
                _formElm.querySelector('[name="yscale"]').value = _.round(object.scale.y, 3);
                _formElm.querySelector('[name="zscale"]').value = _.round(object.scale.z, 3);

                _formElm.querySelector('[name="userData"]').value =  JSON.stringify(object.userData);


            }
        }
    }

    function activateTab(view) {
        //hide all
        const navBody = _rootElm.querySelector('[name=navbody]')
        const _viewElm = _rootElm.querySelector(`[name=${view}]`);

        const views = navBody.children;

        for (let i = 0; i < views.length; i++) {
            views[i].classList.add('w3-hide');
        }
        _viewElm.classList.remove('w3-hide');
    }



    const _galleryProperty = setupGalleryProperty();
    const _spaceProperty = setupSpaceProperty();
    const _objectProperty = setupObjectProperty();

    return {
        element: _rootElm,
        activateTab: activateTab,
        async updateGallery({ id }) {
            _Context.waitModal.show({
                msg: 'connecting...'
            });

            let result = await _galleryProperty.updateForm({ id });

            if (result === undefined) {
                activateTab('Gallery');
                _Context.waitModal.close();
            }
            else {
                _Context.waitModal.updated(`result : ${result.r}`);
                _Context.waitModal.close(3000);

            }
        },
        async updateObjectProperty({ object }) {
            _objectProperty.updateForm({ object });
            activateTab('Object');
        }
    }

}