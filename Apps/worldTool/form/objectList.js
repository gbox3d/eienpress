import * as THREE from 'three';

export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="property-view" >
        <p>objects</p>
			<ul></ul>
			<div class="property">
				<form>
					<label>name</label>
					<input type="text" name="name" value="">
					<br />
					<label>type</label>
					<input type="text" name="type" value="" disabled>
					<br />
					<label>uuid</label>
					<input type="text" name="uuid" value="" disabled>
					
                    <hr/>
                    <h3>position</h3>
                    <label>x</label>
					<input type="text" name="xpos" value="" >
					<br />
                    <label>y</label>
					<input type="text" name="ypos" value="" >
					<br />
                    <label>z</label>
					<input type="text" name="zpos" value="" >
					<hr/>

                    <hr/>
                    <h3>rotation</h3>
                    <label>x</label>
					<input type="text" name="rotx" value="" >
					<br />
                    <label>y</label>
					<input type="text" name="roty" value="" >
					<br />
                    <label>z</label>
					<input type="text" name="rotz" value="" >
					<hr/>

                    <hr/>
                    <h3>scale</h3>
                    <label>x</label>
					<input type="text" name="scalex" value="" >
					<br />
                    <label>y</label>
					<input type="text" name="scaley" value="" >
					<br />
                    <label>z</label>
					<input type="text" name="scalez" value="" >
					<hr/>

                    <label>visible</label>
                    <input type="checkbox" name="visible" value="" >
                    <br />
                    <label>castShadow</label>
                    <input type="checkbox" name="castShadow" value="" >
                    <br />
                    <label>receiveShadow</label>
                    <input type="checkbox" name="receiveShadow" value="" >
                    <br />
                    <label>frustumCulled</label>
                    <input type="checkbox" name="frustumCulled" value="" >
                    <br />
                    
                    <div class='light-attribute'>
                        <p>light attribute</p>
                        <label>intensity</label>
                        <input type="number" name="intensity" value=".0" step="0.01"  >
                        <br />
                        <label>color</label>
                        <input type="color" name="baseColor" value="#ffffff" >
                        <br />
                        <label>groundColor</label>
                        <input type="color" name="groundColor" value="#ffffff" >
                        <br />
                        
                        <label>shadow camera top</label>
                        <input type="number" name="shadowCameraTop" value=""   >
                        <br/>
                        <label>shadow camera bottom</label>
                        <input type="number" name="shadowCameraBottom" value=""   >
                        <br/>
                        <label>shadow camera left</label>
                        <input type="number" name="shadowCameraLeft" value=""   >
                        <br/>
                        <label>shadow camera right</label>
                        <input type="number" name="shadowCameraRight" value=""   >
                        <br/>
                        <label>shadow camera near</label>
                        <input type="number" name="shadowCameraNear" value=""   >
                        <br/>
                        <label>shadow camera far</label>
                        <input type="number" name="shadowCameraFar" value=""   >
                        <br/>

                        <label>shadow map width</label>
                        <input type="number" name="shadowMapWidth" value=""   >
                        <br/>
                        <label>shadow map height</label>
                        <input type="number" name="shadowMapHeight" value=""   >
                        <br/>
                        <label>shadow map bias</label>
                        <input type="number" name="shadowBias" value=""   >
                        <br/>
                        <button type="button" name="shadowUpdate">update</button>
                    </div>

                    <hr/>
                    <div>
                        <label>user data</label>
                        <textarea name="userData"></textarea>
                    </div>
                    <br />
				</form>
			</div>
    <div>
`
        , 'text/html');

    const _rootElm = document.querySelector('.object-list')
    _rootElm.appendChild(htmlDoc.querySelector('.property-view'));

    const sceneEditor = _Context.sceneEditor;
    let selectItem = null;

    function updateObjectList() {
        const _ul = _rootElm.querySelector('ul');
        const _list = sceneEditor.root_dummy.children;

        console.log(_list)

        //remove child
        while (_ul.firstChild) {
            _ul.removeChild(_ul.firstChild);
        }

        _list.forEach(_item => {
            const li = document.createElement('li');
            li.innerHTML = _item.name ? _item.name : _item.uuid;
            li.dataset.uuid = _item.uuid;
            _ul.appendChild(li);
        });
        
    }

    updateObjectList();

    function clearSelectAll() {
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            li.classList.remove('selected');
        });
    }

    function setSelectItem(uuid) {
        clearSelectAll();
        selectItem = sceneEditor.getObject(uuid)
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            if (li.dataset.uuid == uuid) {
                li.classList.add('selected');
            }
        });
        updateProperty(selectItem);
    }
    const _form = _rootElm.querySelector('form');

    function updateProperty(item) {
        // const _form = _rootElm.querySelector('form');
        _form.uuid.value = item.uuid;
        _form.name.value = item.name;
        _form.type.value = item.type;
        _form.xpos.value = _.round(item.position.x, 3);
        _form.ypos.value = _.round(item.position.y, 3);
        _form.zpos.value = _.round(item.position.z, 3);

        _form.rotx.value = _.round(THREE.MathUtils.radToDeg(item.rotation.x, 3));
        _form.roty.value = _.round(THREE.MathUtils.radToDeg(item.rotation.y, 3));
        _form.rotz.value = _.round(THREE.MathUtils.radToDeg(item.rotation.z, 3));

        _form.scalex.value = _.round(item.scale.x, 3);
        _form.scaley.value = _.round(item.scale.y, 3);
        _form.scalez.value = _.round(item.scale.z, 3);

        _form.visible.checked = item.visible;
        _form.castShadow.checked = item.castShadow;
        _form.receiveShadow.checked = item.receiveShadow;
        _form.frustumCulled.checked = item.frustumCulled;




        if (item.type == 'AmbientLight') {
            _form.querySelector('.light-attribute').hidden = false
            item.intensity ? _form.intensity.value = _.round(item.intensity, 3) : null;
            item.color ? _form.baseColor.value = `#${item.color.getHexString()}` : null;

        } else if (item.type == 'DirectionalLight') {
            _form.querySelector('.light-attribute').hidden = false
            item.intensity ? _form.intensity.value = _.round(item.intensity, 3) : null;
            item.color ? _form.baseColor.value = `#${item.color.getHexString()}` : null;

            item.shadow.camera.bottom ? _form.shadowCameraBottom.value = _.round(item.shadow.camera.bottom, 3) : _form.shadowCameraBottom.value = '';
            item.shadow.camera.left ? _form.shadowCameraLeft.value = _.round(item.shadow.camera.left, 3) : _form.shadowCameraLeft.value = '';
            item.shadow.camera.right ? _form.shadowCameraRight.value = _.round(item.shadow.camera.right, 3) : _form.shadowCameraRight.value = '';
            item.shadow.camera.top ? _form.shadowCameraTop.value = _.round(item.shadow.camera.top, 3) : _form.shadowCameraTop.value = '';
            item.shadow.camera.near ? _form.shadowCameraNear.value = _.round(item.shadow.camera.near, 3) : _form.shadowCameraNear.value = '';
            item.shadow.camera.far ? _form.shadowCameraFar.value = _.round(item.shadow.camera.far, 3) : _form.shadowCameraFar.value = '';
            (item.shadow.bias !== undefined) ? _form.shadowBias.value = _.round(item.shadow.bias, 3) : _form.shadowBias.value = '';
            item.shadow.mapSize.width ? _form.shadowMapWidth.value = _.round(item.shadow.mapSize.width, 3) : _form.shadowMapWidth.value = '';
            item.shadow.mapSize.height ? _form.shadowMapHeight.value = _.round(item.shadow.mapSize.height, 3) : _form.shadowMapHeight.value = '';

        } else if (item.type == 'PointLight') {
        } else if (item.type == 'SpotLight') {
        } else if (item.type == 'HemisphereLight') {
            _form.querySelector('.light-attribute').hidden = false
            item.intensity ? _form.intensity.value = _.round(item.intensity, 3) : null;
            item.color ? _form.baseColor.value = `#${item.color.getHexString()}` : null;
            item.groundColor ? _form.groundColor.value = `#${item.groundColor.getHexString()}` : null;

        } else if (item.type == 'Mesh') {
            _form.querySelector('.light-attribute').hidden = true
        }
        else {
            _form.querySelector('.light-attribute').hidden = true
        }

        // selectItem.type == 'Light' ? _form.lightAttribute.style.display = 'block' : _form.lightAttribute.style.display = 'none';

        _form.userData.value = JSON.stringify(item.userData);
    }

    _form.name.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.name = e.target.value;
            updateObjectList();
        }
    });
    _form.name.addEventListener('blur', function (e) {
        sceneEditor.pauseKeyInput = false;
    });
    _form.name.addEventListener('focus', function (e) {
        sceneEditor.pauseKeyInput = true;
    });

    //change event handler
    _form.xpos.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.position.x = parseFloat(e.target.value);
        }
    });
    _form.ypos.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.position.y = parseFloat(e.target.value);
        }
    });
    _form.zpos.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.position.z = parseFloat(e.target.value);
        }
    });
    _form.rotx.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.rotation.x = THREE.MathUtils.degToRad(parseFloat(e.target.value));
        }
    });
    _form.roty.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.rotation.y = THREE.MathUtils.degToRad(parseFloat(e.target.value));
        }
    });
    _form.rotz.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.rotation.z = THREE.MathUtils.degToRad(parseFloat(e.target.value));
        }
    });
    _form.scalex.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.scale.x = parseFloat(e.target.value);
        }
    });
    _form.scaley.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.scale.y = parseFloat(e.target.value);
        }
    });
    _form.scalez.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.scale.z = parseFloat(e.target.value);
        }
    });

    _form.visible.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.visible = e.target.checked;
        }
    });
    _form.castShadow.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.castShadow = e.target.checked;
        }
    });
    _form.receiveShadow.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.receiveShadow = e.target.checked;
        }
    });
    _form.frustumCulled.addEventListener('change', function (e) {
        if (selectItem) {
            selectItem.frustumCulled = e.target.checked;
        }
    });


    _form.intensity.addEventListener('input', function (e) {
        if (selectItem) {
            selectItem.intensity = parseFloat(e.target.value);
        }
    });
    _form.baseColor.addEventListener('input', function (e) {
        if (selectItem) {
            selectItem.color = new THREE.Color(e.target.value);
        }
    });
    _form.groundColor.addEventListener('input', function (e) {
        if (selectItem) {
            selectItem.groundColor = new THREE.Color(e.target.value);
        }
    });

    // _form.shadowCameraTop.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.camera.top = parseFloat(e.target.value) : null;
    //     }
    // });
    // _form.shadowCameraBottom.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.camera.bottom = parseFloat(e.target.value) : null;
    //     }
    // });
    // _form.shadowCameraLeft.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.camera.left = parseFloat(e.target.value) : null;
    //     }
    // });
    // _form.shadowCameraRight.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.camera.right = parseFloat(e.target.value) : null;
    //     }
    // });

    // _form.shadowMapWidth.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.mapSize.width = parseInt(e.target.value) : null;
    //     }
    // });
    // _form.shadowMapHeight.addEventListener('change', function (e) {
    //     if (selectItem) {
    //         selectItem.shadow ? selectItem.shadow.mapSize.height = parseInt(e.target.value) : null;
    //     }
    // });

    function _updateCameraHelper(node) {
        // if(node.userData.cameraHelper
        sceneEditor.scene.remove(node.userData.cameraHelper);
        const helper = new THREE.CameraHelper(node.shadow.camera);
        sceneEditor.scene.add(helper);
        node.userData.cameraHelper = helper;
    }

    _form.shadowUpdate.addEventListener('click', function (e) {
        if (selectItem) {
            let shadow = selectItem.shadow;
            if (shadow) {
                shadow.mapSize.width = parseInt(_form.shadowMapWidth.value);
                shadow.mapSize.height = parseInt(_form.shadowMapHeight.value);
                shadow.camera.top = parseFloat(_form.shadowCameraTop.value);
                shadow.camera.bottom = parseFloat(_form.shadowCameraBottom.value);
                shadow.camera.left = parseFloat(_form.shadowCameraLeft.value);
                shadow.camera.right = parseFloat(_form.shadowCameraRight.value);
                shadow.camera.near = parseFloat(_form.shadowCameraNear.value);
                shadow.camera.far = parseFloat(_form.shadowCameraFar.value);


                //실제 적용을 위해서 기존 객체를 지우고 새로운 객체를 다시 만든다.
                shadow.map.dispose();
                shadow.map = null;
                _updateCameraHelper(selectItem);
            }
        }
    });

    _rootElm.querySelector('ul').addEventListener('click', function (e) {
        // const _name = e.target.innerText;
        console.log(e.target);
        if (e.target.tagName === 'LI') {

            clearSelectAll();

            e.target.classList.add('selected');
            selectItem = sceneEditor.setSelectObject(e.target.dataset.uuid);
            // selectItem = sceneEditor.getObject(e.target.dataset.uuid);
            updateProperty(selectItem);
        }
    });

    return {
        element: _rootElm,
        update: updateObjectList,
        setSelect: setSelectItem,
        getSelect: function () {
            return selectItem;
        },
        updateProperty: updateProperty
    }


}