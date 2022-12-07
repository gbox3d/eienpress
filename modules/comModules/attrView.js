import 'md5';
import * as THREE from 'three';

export default async function (_Context, container,onChange) {

    const _htmlText = `
    <div class="ui-view w3-container">
            <form class='w3-container' >

                <div class='w3-row' id='trigger-attr'>
                    <div class='w3-col s12 m12 l12'>
                        <label>radius</label>
                        <input class='w3-input' type='text' name='radius' />
                    </div>
                    <div class='w3-col s12 m12 l12'>
                        <label>link</label>
                        <input class='w3-input' type='text' name='link' />
                    </div>
                </div>

                <div class='w3-row' id='startpoint-attr'>
                    <label>base player shape</label>
                    <div class='w3-row'>
                        <div class='w3-col s4'>
                            <label>height</label>
                            <input class='w3-input w3-border' type='text' name='height' value= />
                        </div>
                        <div class='w3-col s4'>
                            <label>Radius</label>
                            <input class='w3-input w3-border' type='text' name='radius' />
                        </div>
                    </div>
                </div>

                

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
    
    const _form_triger_attr = _rootElm.querySelector('#trigger-attr');
    _form_triger_attr.style.display = 'none';

    const _form_startpoint_attr = _rootElm.querySelector('#startpoint-attr');
    _form_startpoint_attr.style.display = 'none';


    container.appendChild(_rootElm);

    _rootElm.style.width = '320px';
    _rootElm.style.height = '512px';
    _rootElm.style.overflow = 'auto';
    _rootElm.style.border = '1px solid #ccc';

    

    function _set(entity) {
        
        if(!entity) return;

        //속성에따른 뷰보여주기 
        _form_triger_attr.style.display = 'none';
        _form_startpoint_attr.style.display = 'none';

        if(entity.type === 'elvisTrigerObject') {
            _form_triger_attr.style.display = 'block';

            _form_triger_attr.querySelector('input[name="radius"]').value = entity.radius;
            _form_triger_attr.querySelector('input[name="link"]').value = entity.link;
        }
        else if(entity.type === 'elvisStartPoint') {
            _form_startpoint_attr.style.display = 'block';

            _form_startpoint_attr.querySelector('input[name="height"]').value = entity.height;
            _form_startpoint_attr.querySelector('input[name="radius"]').value = entity.radius;
        }


        _form.elements.id.value = entity.id;
        _form.elements.name.value = entity.name;

        _form.uuid.value = entity.uuid;
        _form.type.value = entity.type;
        _form.positionX.value = _.round(entity.position.x,3);
        _form.positionY.value = _.round(entity.position.y,2);
        _form.positionZ.value = _.round(entity.position.z,2);

        _form.rotationX.value = _.round(THREE.MathUtils.radToDeg(entity.rotation.x),2);
        _form.rotationY.value = _.round(THREE.MathUtils.radToDeg(entity.rotation.y),2);
        _form.rotationZ.value = _.round(THREE.MathUtils.radToDeg(entity.rotation.z),2);

        //scale
        _form.scaleX.value = _.round(entity.scale.x,2);
        _form.scaleY.value = _.round(entity.scale.y,2);
        _form.scaleZ.value = _.round(entity.scale.z,2);

        //shadow
        _form.castShadow.checked = entity.castShadow;
        _form.receiveShadow.checked = entity.receiveShadow;

        //frustumCulled
        _form.frustumCulled.checked = entity.frustumCulled;

        //visible
        _form.visible.checked = entity.visible;

        //renderOrder
        _form.renderOrder.value = entity.renderOrder;
        console.log('set attribute view', entity);

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

        if(entity.type === 'elvisStartPoint') {
            entity.height = parseFloat(_form_startpoint_attr.querySelector('input[name="height"]').value);
            entity.radius = parseFloat(_form_startpoint_attr.querySelector('input[name="radius"]').value);
        }
        else if(entity.type === 'elvisTrigerObject') {
            entity.radius = parseFloat(_form_triger_attr.querySelector('input[name="radius"]').value);
            entity.link = _form_triger_attr.querySelector('input[name="link"]').value;
        }

        

    }

    _form.addEventListener('change', (evt) => {
        evt.preventDefault();
        //uuid to entity
        const uuid = _form.uuid.value;
        const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);
        _update(entity);
        onChange?.(entity);
    });


    console.log('complete setup tree view');

    return {
        element: _rootElm,
        set: _set,
        get: _get
    }

}