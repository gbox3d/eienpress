export default function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class="status">
            <p class="mousePos"></p>
        </div>
        <textarea class="saveData"></textarea>
        <div>
            <button class='load-scene'>load</button>
            <button class="save-scene">save</button>
            <hr />
            <button class="add-fbxObj">add fbx object</button>
            <button class="test2">test2</button>
            <button class="test">test</button>
            <hr/>
            <button class="add-obj">add Object</button>
            <button class="add-obj-aspect">add Object Aspect</button>
            <hr/>
            <button class="add-ambient-light">add ambient light</button>
            <button class="add-point-light">add point light</button>
            <button class="add-directional-light">add directional light</button>
            <button class="add-hemi-light">add hemi light</button>
            <button class="add-spot-light">add spot light</button>
            <hr/>
            <button class="clone">clone</button>
            <button class="del">delete</button>
            <hr />
            <button class="focus-obj">focus Object</button>
        </div>
    </div>
    `;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    const _rootElm = document.querySelector('.ui-container')
    _rootElm.appendChild(htmlDoc.querySelector('.ui-view'));
    const sceneEditor = _Context.sceneEditor;

    // let tempMaterial
    let temp
    let temp2
    _rootElm.querySelector('.test').addEventListener('click', async function () {
        
        await sceneEditor.addGltfObject('../file/wine_bottles_01_1k.gltf', 5)
        _Context.geometryList.update();
        _Context.materialList.update();
        _Context.objectList.update();


    });

    _rootElm.querySelector('.test2').addEventListener('click', async function () {
        // let texture = await theApp.sceneEditor.loadTextureFromWebDisk('/home/ubiqos/work/repository/test2/Meshes/Objects_2/Sofa_2/Base.png');

        temp.traverse(function (child) {
            if (child.isMesh) {
                console.log(child)
                child.material.map = temp2;
                child.material.needsUpdate = true;
            }
        });

    });

    _rootElm.querySelector('.add-obj').addEventListener('click', function () {

        let geometry = _Context.geometryList.getSelect();
        let material = _Context.materialList.getSelect();

        if (geometry === null || material === null) {
            alert('select geometry and material');
            return;
        }

        sceneEditor.addObject(geometry, material, 5);
        _Context.objectList.update();

    });

    _rootElm.querySelector('.add-obj-aspect').addEventListener('click', function () {

        let geometry = _Context.geometryList.getSelect();
        let material = _Context.materialList.getSelect();

        sceneEditor.addObjectByAspect(geometry, material, 5, true);

        _Context.objectList.update();

    });

    _rootElm.querySelector('.add-fbxObj').addEventListener('click', async function () {

        _Context.fileSelectBox.show(
            async (file) => {

                if (file.endsWith('.fbx')) {
                    await _Context.sceneEditor.addFbxObject(
                        file, 0.1
                    );
                    //update ui
                    _Context.geometryList.update();
                    _Context.materialList.update();
                    _Context.objectList.update();
                }
            }
        );

    });

    _rootElm.querySelector('.add-ambient-light').addEventListener('click', function () {
        sceneEditor.addAmbientLight(0x404040);
        _Context.objectList.update();
    });
    _rootElm.querySelector('.add-directional-light').addEventListener('click', function () {
        sceneEditor.addDirectionalLight(0xffffff);
        _Context.objectList.update();
    });

    _rootElm.querySelector('.add-point-light').addEventListener('click', function () {
        // sceneEditor.addPointLight(0xffffff);
        _Context.objectList.update();
    });
    _rootElm.querySelector('.add-spot-light').addEventListener('click', function () {
        // sceneEditor.addSpotLight(0xffffff);
        _Context.objectList.update();
    });
    _rootElm.querySelector('.add-hemi-light').addEventListener('click', function () {
        sceneEditor.addHemiLight(0xffffbb, 0x080820, 1.0);
        _Context.objectList.update();
    });

    _rootElm.querySelector('.clone').addEventListener('click', function () {
        sceneEditor.cloneObject();
        _Context.objectList.update();

    });


    _rootElm.querySelector('.del').addEventListener('click', function () {
        let sel = sceneEditor.getSelectObject()
        console.log(`delete ${sel}`);
        sceneEditor.delObject(sel);
        _Context.objectList.update();
    });

    _rootElm.querySelector('.save-scene').addEventListener('click', async function () {

        _Context.sceneEditor.pauseKeyInput = false; //핫키멈추기
        _Context.fileSelectBox.show(
            async (file) => {

                _Context.msgBox.show('save scene...wait')
                let res = await sceneEditor.saveScene(file);
                _Context.msgBox.close();
                console.log(res);
                _Context.sceneEditor.pauseKeyInput = false; //핫키재시작
            }
        );

    });

    _rootElm.querySelector('.load-scene').addEventListener('click', async function () {

        _Context.sceneEditor.pauseKeyInput = true;
        _Context.fileSelectBox.show(
            async (file) => {

                if (file.endsWith('.json')) {

                    console.log('load scene....');
                    _Context.msgBox.show('load scene....');
                    await sceneEditor.loadScene(file);
                    console.log('load scene....done');
                    _Context.msgBox.close();


                    //update ui
                    _Context.geometryList.update();
                    _Context.materialList.update();
                    _Context.objectList.update();
                    _Context.sceneEditor.pauseKeyInput = false;
                }
            }
        );


        // _Context.geometryList.update();
        // _Context.materialList.update();
        // _Context.objectList.update();

    });

    _rootElm.querySelector('.focus-obj').addEventListener('click', function () {
        sceneEditor.focusObject();
    });

    return {
        element: _rootElm,
    }

}