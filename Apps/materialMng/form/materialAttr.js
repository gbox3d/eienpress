// import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import * as THREE from 'three';
import 'md5';


export default async function (_Context, container) {

    const _htmlText = `
    <div class="ui-view">
        <form class='w3-container file-info'>
            <label>id</label>
            <input class="w3-input" type="text" name='id' disabled >
            
            <label>creator</label>
            <input class="w3-input" type="text" name='creator' disabled >
            
            <label>title</label>
            <input class="w3-input" type="text" name='title'>

            <label>description</label>
            <input class="w3-input" type="text" name='description'>

            <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='isPublic'> public <br><br>
            <hr/>

            <label>type</label>
            <input class="w3-input" type="text" name='type' disabled >
            <div>
                <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='wire-frame'> wire frame  
            </div>

            <label>color</label>
            <input type="color" name='color'>

            <div>
                <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='transparent'> transparent 
                <br>
                <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='fog'> fog 
            </div>
            
            <div class="w3-row">
                <label>opacity</label>
                <input name="opacity"  type="range" value='1' min='0' max='1' step='0.01'>
                <span class='opacity-value'></span>
            </div>

            <div class="w3-row">
                <label>roughness</label>
                <input  type="range" name='roughness' value='0.5' min='0' max='1' step='0.01'>
                <span class='roughness-value'></span>
            </div>

            <div class="w3-row">
                <label>metalness</label>
                <input  type="range" name='metalness' value='0.5' min='0' max='1' step='0.01'>
                <span class='metalness-value'></span>
            </div>
            <hr/>

            <div class='w3-section w3-border' >
                <label>Diffuse map</label>
                <input class="w3-input" type="text" name='diffuseMap' disabled>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-diffuseMap" >change</button>
            </div>

            <div class='w3-section w3-border' >
                <label>Alpha map (opacity 속성켜고사용)</label>
                <input class="w3-input" type="text" name='alphaMap' disabled>
                
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-alphaMap" >change</button>
            </div>

            <div class='w3-section w3-border' >
                <label>Normal map</label>
                <input class="w3-input" type="text" name='normalMap' disabled>
                <select class="w3-select" name="normalMapType">
                    <option value="0" selected>TangentSpace</option>
                    <option value="1">ObjectSpace</option>
                </select>
                <input class="w3-input" type="text" name="normalMapScale">
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-normalMap" >change</button>
            </div>

            <div class='w3-section w3-border' >
                <label>Bump map</label>
                <input class="w3-input" type="text" name='bumpMap' disabled>
                <div class="w3-row">
                    <input type="range" name="bumpMapScale" value='1' min='0' max='1' step='0.01' >
                    <span class='bumpMapScale-value'></span>
                </div>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-bumpMap" >change</button>
            </div>



            <div class='w3-section w3-border' >
                <label>ao map</label>
                <input class="w3-input" type="text" name='aoMap' disabled>
                <div class="w3-row">
                    <input type="range" name='aoMapIntensity' value='1' min='0' max='1' step='0.01'>
                    <span class="aoMapIntensity-value" >1</span>
                </div>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-aoMap" >change</button>
            </div>

            <div class='w3-section w3-border' >
                <label> -Displacement map</label>
                <input class="w3-input" type="text" name='displacementMap' disabled>
                <div class="w3-row">
                    <label>displacementMapScale</label>
                    <input  type="range" name='displacementMapScale' min='-10' max='10' step='0.01'>
                    <span class='displacementMapScale-value'></span>
                </div>
                <div class="w3-row">
                    <label>displacementMapBais</label>
                    <input  type="range" name='displacementMapBais' min='-1' max='1' step='0.01'>
                    <span class='displacementMapBais-value'></span>
                </div>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-displacementMap" >change</button>
            </div>

            <div class='w3-section w3-border' >

                <label>emissive map</label>
                <input class="w3-input" type="text" name='emissiveMap' disabled>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-emissiveMap" >change</button>
                
                <div class="w3-row">
                    <label>emissive intensity</label>
                    <input name='emissiveMapIntensity' value='1.0'>
                </div>
                
                <label>emissive color</label>
                <input type="color" name='emissiveColor'>
            </div>

            <div class='w3-section w3-border' >
                <label>env map</label>
                <input class="w3-input" type="text" name='envMap' disabled>
                <div class="w3-row">
                    <label>envmap intensity (hdr expose effect)</label>
                    <input  type="range" name='envMapIntensity' value='0.5' min='0' max='2' step='0.01'>
                    <span class='envMapIntensity-value'></span>
                </div>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-envMap" >change</button>
            </div>

            <div class='w3-section w3-border' >
                <label>Light map</label>
                <input class="w3-input" type="text" name='lightMap' disabled>
                <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-lightMap" >change</button>

                <div class="w3-row">
                    <label>light map intensity</label>
                    <input name='lightMapIntensity'>
                </div>
            </div>

            <label>metalness map</label>
            <input class="w3-input" type="text" name='metalnessMap' disabled>
            <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-metalnessMap" >change</button>

            <label>roughness map</label>
            <input class="w3-input" type="text" name='roughnessMap' disabled>
            <button class="w3-button w3-block w3-green w3-margin-bottom" type='button' name="change-roughnessMap" >change</button>
        </form>
    </div>
    `;

    let currentData;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const attr_form = _rootElm.querySelector('.file-info');
    const host_url = _Context.host_url;

    container.appendChild(_rootElm);

    // _rootElm.style.width ='512px';
    _rootElm.style.height = '768px';
    _rootElm.style.width = '400px';
    _rootElm.style.overflow = 'auto';

    console.log('complete setup uiMain');

    attr_form.addEventListener('submit', async (e) => {
        e.preventDefault();
    });

    attr_form.querySelector('[name="color"]').addEventListener('input', async (e) => {
        const material = _Context.gameObject.entity.material;
        material.color.set(e.target.value);
    });

    attr_form.querySelector('[name="transparent"]').addEventListener('change', async (e) => {
        const material = _Context.gameObject.entity.material;
        material.transparent = e.target.checked;
        material.needsUpdate = true;
    });

    attr_form.querySelector('[name="opacity"]').addEventListener('input', (e) => {
        let _val = e.target.value;
        attr_form.querySelector('.opacity-value').innerText = _val;
        _Context.gameObject.entity.material.opacity = parseFloat(_val);
    });

    attr_form.querySelector('[name="roughness"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        attr_form.querySelector('.roughness-value').innerText = _val;
        material.roughness = parseFloat(_val);
        material.needsUpdate = true;
    });

    attr_form.querySelector('[name="metalness"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        attr_form.querySelector('.metalness-value').innerText = _val;
        material.metalness = parseFloat(_val);
        material.needsUpdate = true;
    });


    attr_form.querySelector('[name="wire-frame"]').addEventListener('change', (e) => {
        const material = _Context.gameObject.entity.material;
        material.wireframe = e.target.checked;
        material.needsUpdate = true;
    });

    //diffuse map
    attr_form.querySelector('[name="change-diffuseMap"]').addEventListener('click', async (e) => {

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {
            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            attr_form.elements['diffuseMap'].value = selectFile.id;

            const material = _Context.gameObject.entity.material

            material.map = _tex;
            material.userData.texture = selectFile
            // material.userData.texture_type = selectFile.type

            material.needsUpdate = true;

            _Context.progressBox.closeDelay(250);
        }

    });

    //alpha map
    attr_form.querySelector('[name="change-alphaMap"]').addEventListener('click', async (e) => {
        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {
            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            attr_form.elements['alphaMap'].value = selectFile.id;

            const material = _Context.gameObject.entity.material

            material.alphaMap = _tex;
            material.userData.texture = selectFile
            material.needsUpdate = true;

            _Context.progressBox.closeDelay(250);
        }
    });



    //normal map
    attr_form.querySelector('[name="change-normalMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {

            attr_form.elements['normalMap'].value = selectFile.id;

            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            material.normalMap = _tex;
            material.needsUpdate = true;

            material.userData.normalMap = selectFile;

            _Context.progressBox.closeDelay(250);
        }

    });

    attr_form.querySelector('[name="normalMapScale"]').addEventListener('change', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        console.log(_val)
        let __val = _val.split(',');

        let _x = parseFloat(__val[0]);
        let _y = parseFloat(__val[1]);

        if (isNaN(_x) || isNaN(_y)
            || _x < 0 || _y < 0
            || _x > 1 || _y > 1
        ) {
            // _Context.('invalid value');
            e.target.value = material.normalScale.x + ',' + material.normalScale.y;
            return;
        }
        material.normalScale.set(__val[0], __val[1]);
    });

    attr_form.querySelector('[name="normalMapType"]').addEventListener('change', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        material.normalMapType = parseInt(_val);
        material.needsUpdate = true;
    });

    //bump map
    attr_form.querySelector('[name="change-bumpMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {

            attr_form.elements['bumpMap'].value = selectFile.id;

            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);  
                },
                type: selectFile.type
            });

            material.bumpMap = _tex;
            material.needsUpdate = true;

            material.userData.bumpMap = selectFile;

            _Context.progressBox.closeDelay(250);
        }

    });

    attr_form.querySelector('[name="bumpMapScale"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;

        material.bumpScale = parseFloat(e.target.value);
        material.needsUpdate = true;

        attr_form.querySelector('.bumpMapScale-value').innerText = material.bumpScale;

    });

    //ao map
    attr_form.querySelector('[name="change-aoMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        attr_form.elements['aoMap'].value = selectFile.id;

        _Context.progressBox.show();

        let _tex = await _Context.objViewer.objMng.loadTexture({
            textureFile: selectFile.id,
            repo_ip: selectFile.repo_ip,
            type: selectFile.type,
            onProgress: (progress) => {
                console.log(progress)
                _Context.progressBox.update(progress);
            },
            type: selectFile.type
        });

        material.aoMap = _tex;
        material.needsUpdate = true;

        material.userData.aoMap = selectFile;

        _Context.progressBox.closeDelay(250);

    });

    attr_form.querySelector('[name="aoMapIntensity"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        attr_form.querySelector('.aoMapIntensity-value').innerText = _val;
        material.aoMapIntensity = parseFloat(_val);
        material.needsUpdate = true;
    });


    //displacement map
    attr_form.querySelector('[name="change-displacementMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        attr_form.elements['displacementMap'].value = selectFile.id;

        _Context.progressBox.show();

        let _tex = await _Context.objViewer.objMng.loadTexture({
            textureFile: selectFile.id,
            repo_ip: selectFile.repo_ip,
            type: selectFile.type,
            onProgress: (progress) => {
                console.log(progress)
                _Context.progressBox.update(progress);
            },
            type: selectFile.type
        });

        material.displacementMap = _tex;
        material.needsUpdate = true;

        material.userData.displacementMap = selectFile;

        _Context.progressBox.closeDelay(250);

    });

    attr_form.querySelector('[name="displacementMapScale"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        material.displacementScale = parseFloat(_val);
        material.needsUpdate = true;
        attr_form.querySelector('.displacementMapScale-value').innerText = _val;
    });
    attr_form.querySelector('[name="displacementMapBais"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        material.displacementBias = parseFloat(_val);
        material.needsUpdate = true;
        attr_form.querySelector('.displacementMapBais-value').innerText = _val;

    });

    //emissive map
    attr_form.querySelector('[name="change-emissiveMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        attr_form.elements['emissiveMap'].value = selectFile.id;

        _Context.progressBox.show();

        let _tex = await _Context.objViewer.objMng.loadTexture({
            textureFile: selectFile.id,
            repo_ip: selectFile.repo_ip,
            type: selectFile.type,
            onProgress: (progress) => {
                console.log(progress)
                _Context.progressBox.update(progress);
            },
            type: selectFile.type
        });

        material.emissiveMap = _tex;
        material.needsUpdate = true;

        material.userData.emissiveMap = selectFile;

        _Context.progressBox.closeDelay(250);
    });

    attr_form.querySelector('[name="emissiveMapIntensity"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        // attr_form.querySelector('.emissiveMapIntensity-value').innerText = _val;
        material.emissiveIntensity = parseFloat(_val);
        material.needsUpdate = true;
    });
    attr_form.querySelector('[name="emissiveColor"]').addEventListener('input', async (e) => {
        const material = _Context.gameObject.entity.material;
        material.emissive.set(e.target.value);
    });



    //env map
    attr_form.querySelector('[name="change-envMap"]').addEventListener('click', async (e) => {
        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    resolve(evt);
                },
                'envmap'
            )
        });

        attr_form.elements['envMap'].value = selectFile.id;

        _Context.progressBox.show();

        let _tex = await _Context.objViewer.objMng.loadTexture({
            textureFile: selectFile.id,
            repo_ip: selectFile.repo_ip,
            type: selectFile.type,
            onProgress: (progress) => {
                console.log(progress)
                _Context.progressBox.update(progress);
            },
            type: selectFile.type
        });

        _tex.mapping = THREE.EquirectangularReflectionMapping;
        _tex.encoding = THREE.sRGBEncoding;

        material.envMap = _tex;
        material.needsUpdate = true;
        material.userData.envMap = selectFile;

        _Context.progressBox.closeDelay(250);


    });
    attr_form.querySelector('[name="envMapIntensity"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        attr_form.querySelector('.envMapIntensity-value').innerText = _val;
        material.envMapIntensity = parseFloat(_val);
        material.needsUpdate = true;
    });


    //light map
    attr_form.querySelector('[name="change-lightMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {

            attr_form.elements['lightMap'].value = selectFile.id;

            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            material.lightMap  = _tex;
            material.needsUpdate = true;

            material.userData.roughnessMap = selectFile;

            _Context.progressBox.closeDelay(250);
        }

    });
    attr_form.querySelector('[name="lightMapIntensity"]').addEventListener('input', (e) => {
        const material = _Context.gameObject.entity.material;
        let _val = e.target.value;
        // attr_form.querySelector('.lightMapIntensity-value').innerText = _val;
        material.lightMapIntensity = parseFloat(_val);
        material.needsUpdate = true;
    });

    //roughness map
    attr_form.querySelector('[name="change-roughnessMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {

            attr_form.elements['roughnessMap'].value = selectFile.id;

            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            material.roughnessMap = _tex;
            material.needsUpdate = true;

            material.userData.roughnessMap = selectFile;

            _Context.progressBox.closeDelay(250);
        }

    });

    //metalness map
    attr_form.querySelector('[name="change-metalnessMap"]').addEventListener('click', async (e) => {

        const material = _Context.gameObject.entity.material;

        let selectFile = await new Promise((resolve, reject) => {
            _Context.fileSelectBox.show(
                (evt) => {
                    // console.log(evt);
                    resolve(evt);
                },
                'texture'
            )
        });

        console.log(selectFile)

        if (selectFile) {

            attr_form.elements['metalnessMap'].value = selectFile.id;

            _Context.progressBox.show();

            let _tex = await _Context.objViewer.objMng.loadTexture({
                textureFile: selectFile.id,
                repo_ip: selectFile.repo_ip,
                type: selectFile.type,
                onProgress: (progress) => {
                    console.log(progress)
                    _Context.progressBox.update(progress);
                },
                type: selectFile.type
            });

            material.metalnessMap = _tex;
            material.needsUpdate = true;

            material.userData.metalnessMap = selectFile;

            _Context.progressBox.closeDelay(250);
        }
    });


    return {
        element: _rootElm,
        form: attr_form,
        getData() {

            const data = currentData.fileInfo
            const mtrl = currentData.mtrlInfo

            data._id = this.form.elements['id'].value;
            data.creator = this.form.elements['creator'].value;
            data.title = this.form.elements['title'].value;
            data.description = this.form.elements['description'].value;
            data.isPublic = this.form.elements['isPublic'].checked;

            mtrl.userData.texture = {
                id: this.form.elements['diffuseMap'].value,
            }

            if (this.form.elements['normalMap'].value !== '') {
                mtrl.userData.normalMap = {
                    id: this.form.elements['normalMap'].value,
                }
            }


            return currentData;
        },
        setData: async function (info) {
            // console.log(data);

            currentData = info;

            const data = info.fileInfo
            const mtrl = info.mtrlInfo

            console.log(mtrl)

            const form = _rootElm.querySelector('.file-info');

            form.elements.id.value = data._id ? data._id : '';
            
            form.elements.creator.value = data.creator ? data.creator : '';
            form.elements.title.value = data.title ? data.title : '';
            form.elements.description.value = data.description ? data.description : '';
            // form.elements.directory.value = data.directory;
            form.elements.isPublic.checked = data.isPublic ? data.isPublic : false;

            form.elements.type.value = mtrl.type;

            //diffuseMap
            form.elements.diffuseMap.value = mtrl.userData?.texture?.id ? mtrl.userData.texture.id : '';

            form.elements.color.value = `#${mtrl.color.getHexString()}`;

            form.elements.transparent.checked = mtrl.transparent;
            form.elements.fog.checked = mtrl.fog;

            form.elements.opacity.value = mtrl.opacity;
            form.querySelector('.opacity-value').innerText = mtrl.opacity;

            form.elements.roughness.value = mtrl.roughness;
            form.querySelector('.roughness-value').innerText = mtrl.roughness;

            form.elements.metalness.value = mtrl.metalness;
            form.querySelector('.metalness-value').innerText = mtrl.metalness;

            //emissive map
            form.elements.emissiveMap.value = mtrl.userData?.emissiveMap?.id ? mtrl.userData?.emissiveMap?.id : '';
            form.elements.emissiveMapIntensity.value = mtrl.emissiveIntensity
            form.elements.emissiveColor.value = `#${mtrl.emissive.getHexString()}`;

            //envMap
            form.elements.envMapIntensity.value = mtrl.envMapIntensity;
            form.querySelector('.envMapIntensity-value').innerText = mtrl.envMapIntensity;
            form.elements.envMap.value = mtrl.userData?.envMap?.id ? mtrl.userData.envMap.id : '';

            form.elements['wire-frame'].checked = mtrl.wireframe;

            //alphaMap
            form.elements.alphaMap.value = mtrl.userData?.alphaMap?.id ? mtrl.userData.alphaMap.id : '';

            //normalMap
            form.elements.normalMap.value = mtrl.userData?.normalMap?.id ? mtrl.userData.normalMap.id : '';
            form.elements.normalMapScale.value = `${mtrl.normalScale.x},${mtrl.normalScale.y}`;
            form.elements.normalMapType.value = mtrl.normalMapType;

            //bumMap
            form.elements.bumpMap.value = mtrl.userData?.bumpMap?.id ? mtrl.userData.bumpMap.id : '';
            form.elements.bumpMapScale.value = mtrl.bumpScale;
            form.querySelector('.bumpMapScale-value').innerText = mtrl.bumpScale;

            //ao map
            form.elements.aoMap.value = mtrl.userData?.aoMap?.id ? mtrl.userData.aoMap.id : '';
            form.elements.aoMapIntensity.value = mtrl.aoMapIntensity;

            //displacementMap
            form.elements.displacementMap.value = mtrl.userData?.displacementMap?.id ? mtrl.userData.displacementMap.id : '';

            form.elements['displacementMapScale'].value =
                form.querySelector('.displacementMapScale-value').innerText = mtrl.displacementScale;

            form.elements['displacementMapBais'].value =
                form.querySelector('.displacementMapBais-value').innerText = mtrl.displacementBias;

            //roughnessMap
            form.elements.roughnessMap.value = mtrl.userData?.roughnessMap?.id ? mtrl.userData.roughnessMap.id : '';

            //metalnessMap
            form.elements.metalnessMap.value = mtrl.userData?.metalnessMap?.id ? mtrl.userData.metalnessMap.id : '';

            //lightMap
            form.elements.lightMap.value = mtrl.userData?.lightMap?.id ? mtrl.userData.lightMap.id : '';
            form.elements.lightMapIntensity.value = mtrl.lightMapIntensity;

        }

    }

}