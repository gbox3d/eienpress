import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import 'md5';
import * as THREE from 'three';

export default async function (_Context, container) {

    const _htmlText = `
    <div class="ui-view w3-container">
            <form class='w3-container' >

                <div class='w3-row'>
                    <div class='w3-col s12'>
                        <label>ID</label>
                        <input class='w3-input' type='text' name='id' disabled />
                    </div>
                </div>

                <div class='w3-row'>
                    <div class='w3-col s12 m12 l12'>
                        <label>name</label>
                        <input class='w3-input' type='text' name='name' />
                    </div>
                </div>
                <div class='w3-row'>
                    <div class='w3-col s12 m12 l12'>
                        <label>uuid</label>
                        <input class='w3-input' type='text' name='uuid' />
                    </div>
                </div>
                <div class='w3-row'>
                    <div class='w3-col s12 m12 l12'>
                        <label>type</label>
                        <input class='w3-input' type='text' name='type' />
                    </div>
                </div>
                <div class='w3-row'>
                    <label>position</label>
                    <div class='w3-row'>
                        <div class='w3-col s4'>
                            <label>X</label>
                            <input class='w3-input w3-border' type='text' name='positionX' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Y</label>
                            <input class='w3-input w3-border' type='text' name='positionY' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Z</label>
                            <input class='w3-input w3-border' type='text' name='positionZ' />
                        </div>
                    </div>
                </div>

                <div class='w3-row'>
                    <label>rotation</label>
                    <div class='w3-row'>
                        <div class='w3-col s4'>
                            <label>X</label>
                            <input class='w3-input w3-border' type='text' name='rotationX' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Y</label>
                            <input class='w3-input w3-border' type='text' name='rotationY' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Z</label>
                            <input class='w3-input w3-border' type='text' name='rotationZ' />
                        </div>
                    </div>
                </div>

                <div class='w3-row'>
                    <label>scale</label>
                    <div class='w3-row'>
                        <div class='w3-col s4'>
                            <label>X</label>
                            <input class='w3-input w3-border' type='text' name='scaleX' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Y</label>
                            <input class='w3-input w3-border' type='text' name='scaleY' />
                        </div>
                        <div class='w3-col s4'>
                            <label>Z</label>
                            <input class='w3-input w3-border' type='text' name='scaleZ' />
                        </div>
                    </div>
                </div>

                <div class='w3-panel w3-padding-16 w3-border'>
                    <label>shadow</label>
                    <div class='w3-row'>
                        <div class='w3-col s6'>
                            <label>cast</label>
                            <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='castShadow'>
                        </div>
                        <div class='w3-col s6'>
                            <label>receive</label>
                            <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='receiveShadow'>
                        </div>
                    </div>
                </div>

                <div class='w3-row'>
                    <label>frustumCulled</label>
                    <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='frustumCulled'>
                </div>

                <div class='w3-row'>
                    <label>visible</label>
                    <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='visible'>
                </div>

                <div class='w3-row'>
                    <div class='w3-col s6'>
                    <p>renderOrder</p>
                    </div>
                    <div class='w3-col s6'>
                    <input class='w3-input w3-border w3-margin-top' type='number' name='renderOrder' />
                    </div>
                </div>

            </form>
    </div>
    `;

    const host_url = _Context.host_url;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _form = _rootElm.querySelector('form');




    container.appendChild(_rootElm);

    _rootElm.style.width = '320px';
    _rootElm.style.height = '512px';
    _rootElm.style.overflow = 'auto';
    _rootElm.style.border = '1px solid #ccc';

    function _set(entity) {
        // const _form = _rootElm.querySelector('form');
        if (entity) {

            _form.style.display = 'block';

            _form.elements.id.value = entity.id;
            _form.elements.name.value = entity.name;

            _form.uuid.value = entity.uuid;
            _form.type.value = entity.type;
            _form.positionX.value = entity.position.x;
            _form.positionY.value = entity.position.y;
            _form.positionZ.value = entity.position.z;

            _form.rotationX.value = THREE.MathUtils.radToDeg(entity.rotation.x);
            _form.rotationY.value = THREE.MathUtils.radToDeg(entity.rotation.y);
            _form.rotationZ.value = THREE.MathUtils.radToDeg(entity.rotation.z);

            //scale
            _form.scaleX.value = entity.scale.x;
            _form.scaleY.value = entity.scale.y;
            _form.scaleZ.value = entity.scale.z;

            //shadow
            _form.castShadow.checked = entity.castShadow;
            _form.receiveShadow.checked = entity.receiveShadow;

            //frustumCulled
            _form.frustumCulled.checked = entity.frustumCulled;

            //visible
            _form.visible.checked = entity.visible;

            //renderOrder
            _form.renderOrder.value = entity.renderOrder;

            //material
            // _form.material.value = entity.materialFile?.id ? entity.materialFile.id : '';

            // _form.resolved.checked = entity.resolved ? entity.resolved : false;

            console.log('set', entity);
        }
        else {
            _form.style.display = 'none';
        }

    }

    function _get() {
        // const _form = _rootElm.querySelector('form');

        return {
            id: _form.elements.id.value,
            name: _form.elements.name.value,
            uuid: _form.uuid.value,
            type: _form.type.value,
            position: {
                x: parseFloat(_form.positionX.value),
                y: parseFloat(_form.positionY.value),
                z: parseFloat(_form.positionZ.value),
            },
            rotation: {
                x: THREE.MathUtils.degToRad(parseFloat(_form.rotationX.value)),
                y: THREE.MathUtils.degToRad(parseFloat(_form.rotationY.value)),
                z: THREE.MathUtils.degToRad(parseFloat(_form.rotationZ.value)),
            },
            scale: {
                x: parseFloat(_form.scaleX.value),
                y: parseFloat(_form.scaleY.value),
                z: parseFloat(_form.scaleZ.value),
            },
            castShadow: _form.castShadow.checked,
            receiveShadow: _form.receiveShadow.checked,
            frustumCulled: _form.frustumCulled.checked,
            visible: _form.visible.checked,
            renderOrder: parseInt(_form.renderOrder.value),
            // materialFileID: _form.material.value
        }

    }

    function _update(entity) {
        const data = _get();

        // entity.id = data.id;
        entity.name = data.name;
        entity.uuid = data.uuid;
        entity.type = data.type;
        entity.position.x = data.position.x;
        entity.position.y = data.position.y;
        entity.position.z = data.position.z;

        entity.rotation.x = data.rotation.x;
        entity.rotation.y = data.rotation.y;
        entity.rotation.z = data.rotation.z;

        entity.scale.x = data.scale.x;
        entity.scale.y = data.scale.y;
        entity.scale.z = data.scale.z;

        entity.castShadow = data.castShadow;
        entity.receiveShadow = data.receiveShadow;
        entity.frustumCulled = data.frustumCulled;
        entity.visible = data.visible;
        entity.renderOrder = data.renderOrder;



    }

    let _onChangedCallback;
    _form.addEventListener('change', (evt) => {
        evt.preventDefault();
        //uuid to entity
        const uuid = _form.uuid.value;
        const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);
        _update(entity);

        _onChangedCallback && _onChangedCallback(entity);

    });

    // _form.querySelector('button[name=materialBtn]').addEventListener('click', async (evt) => {
    //     evt.preventDefault();
    //     const uuid = _form.uuid.value;
    //     const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);

    //     if (entity.isMesh || entity.isElvisObject3D) {

    //         let selectFile = await new Promise((resolve, reject) => {
    //             _Context.fileSelectBox.show(
    //                 (evt) => {
    //                     // console.log(evt);
    //                     resolve(evt);
    //                 },
    //                 'material'
    //             )
    //         });

    //         if (selectFile) {
    //             console.log(selectFile);

    //             _Context.progressBox.show();
    //             const material = await _Context.objViewer.objMng.loadMaterial({
    //                 fileID: selectFile.id,
    //                 repo_ip: selectFile.repo_ip,
    //                 onProgress: (progress) => {
    //                     _Context.progressBox.update(progress);
    //                 }
    //             });
    //             _Context.progressBox.closeDelay(100);

    //             if (entity.isMesh) {
    //                 entity.material = material;
    //             }
    //             else if(entity.isElvisObject3D) {
    //                 entity.traverse((child) => {
    //                     if (child.isMesh) {
    //                         child.material = material;
    //                     }
    //                 });

    //                 entity.materialFile = {
    //                     id: selectFile.id,
    //                     repo_ip: selectFile.repo_ip
    //                 }
    //             }



    //             _form.material.value = selectFile.id;
    //         }
    //         else {
    //             console.log('cancel');
    //             _Context.messageModal.show({
    //                 msg: 'cancel',
    //             });
    //         }
    //     }
    //     else {
    //         _Context.messageModal.show({
    //             msg: `not support material ${entity.type}`
    //         });
    //     }


    // });

    console.log('complete setup tree view');

    return {
        element: _rootElm,
        set: _set,
        get: _get,
        setOnChanged: (callback) => {

            _onChangedCallback = callback;

            // _form.addEventListener('change', (evt) => {
            //     evt.preventDefault();
            //     callback();
            // });
        }
    }

}