import * as THREE from 'three';
import uiMenuBarSetup from './uiMenuBar.js';
import { comFileFindFile, comFileUpload, comFileDelete } from "../../../modules/comLibs/utils.js";

import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';
import materialListSetup from './materialList.js';
import materialAttrSetup from './materialAttr.js';

import 'md5';

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='ui-menu-bar'></div>
        <div class='up-frame' >
            <div class='material-list' > </div>
            <div class='gl-container'></div>
            <div class='material-attr' > </div>
        </div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    //upframe
    const up_frame = _rootElm.querySelector('.up-frame');
    const _glContainer = up_frame.querySelector('.gl-container');
    const materialListContainer = up_frame.querySelector('.material-list');
    const materialAttrContainer = up_frame.querySelector('.material-attr');

    const materialList = await materialListSetup(_Context, materialListContainer);
    const materialAttr = await materialAttrSetup(_Context, materialAttrContainer);

    const host_url = _Context.host_url;

    //up frame define style
    up_frame.style.display = 'flex';

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);


    function new_Material() {
        let newMtrl = objViewer.objMng.defaultMaterial.standard.clone();
        // newMtrl.userData.texture = {}
        materialAttr.setData({
            fileInfo: {
                isPublic: true
            },
            mtrlInfo: newMtrl
        });
        gameobject.entity.material = newMtrl;
    }

    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        try {
            if (btnName) {
                if (btnName === 'Viewer') {
                    switch (menuName) {
                        case 'clear':
                            objViewer.objMng.clearObject();
                            break;
                        case 'camera reset':
                            objViewer.resetCamera();
                            break;
                        case 'enviroment map':
                            {
                                // objViewer.hideEnvMap();
                                objViewer.toggleEnvMap();
                            }
                            break;
                        case 'grid':
                            {
                                // objViewer.showGrid();
                                objViewer.toggleGrid();
                            }
                            break;
                        case 'chgEnv':
                            {
                                let selectFile = await new Promise((resolve, reject) => {
                                    _Context.fileSelectBox.show(
                                        (evt) => {
                                            // console.log(evt);
                                            resolve(evt);
                                        },
                                        'envmap'
                                    )
                                });

                                if (selectFile) {

                                    //load texture
                                    let _tex = await _Context.objViewer.objMng.loadTexture({
                                        textureFile: selectFile.id,
                                        repo_ip: selectFile.repo_ip,
                                        onProgress: (progress) => {
                                            console.log(progress)
                                            _Context.progressBox.update(progress);
                                        },
                                        type: selectFile.type
                                    });
                                    _tex.mapping = THREE.EquirectangularReflectionMapping;

                                    objViewer.elvis.scene.background = _tex; //배경 표시 
                                    objViewer.elvis.scene.environment = _tex; //효과적용
                                }

                            }
                    }


                }
                else if (btnName === 'File') {
                    switch (menuName) {
                        case 'new':
                            new_Material();
                            break;
                        case 'save':
                            {

                                const matJson = gameobject.entity.material.toJSON();
                                delete matJson.images;
                                delete matJson.textures;
                                delete matJson.map;
                                console.log(matJson);

                                delete matJson.map
                                delete matJson.aoMap
                                delete matJson.bumpMap
                                delete matJson.displacementMap
                                delete matJson.emissiveMap
                                delete matJson.envMap
                                delete matJson.lightMap
                                delete matJson.metalnessMap
                                delete matJson.normalMap
                                delete matJson.roughnessMap
                                delete matJson.alphaMap



                                let _data = JSON.stringify(matJson)

                                const currentData = materialAttr.getData();
                                let material_name = currentData.fileInfo.title ? currentData.fileInfo.title : '';

                                const fileObj = {
                                    file: {
                                        name: `${material_name}.material`,
                                        size: _data.length,
                                        type: 'application/text',
                                    },
                                    data: _data
                                }

                                let hash = md5(fileObj.data)

                                const _res = await comFileUpload({
                                    fileObj: fileObj,
                                    fileType: 'application/text',
                                    title: material_name,
                                    description: currentData.fileInfo.description ? currentData.fileInfo.description : '',
                                    directory: 'material',
                                    isPublic: currentData.fileInfo.isPublic ? currentData.fileInfo.isPublic : false,
                                    md5: hash,
                                    id: currentData.fileInfo._id ? currentData.fileInfo._id : '',
                                    hostUrl: host_url
                                });
                                if (_res.r === 'ok') {
                                    _Context.messageModal.show({
                                        msg: _res.data.insertedId ? '저장되었습니다.' : '수정되었습니다.',
                                    })

                                    materialList.updateList();
                                }
                                else {
                                    _Context.messageModal.show({
                                        msg: `save material fail`
                                    })
                                }

                            }
                            break;
                        case 'reload':
                            {
                                const currentData = materialAttr.getData();
                                if (currentData.fileInfo._id) {

                                    const material = await objViewer.objMng.loadMaterial({
                                        fileID: currentData.fileInfo._id,
                                        repo_ip: currentData.fileInfo.repo_ip,
                                        reload: true,
                                        onProgress: (progress) => {
                                            _Context.progressBox.update(progress);
                                        }
                                    });

                                    materialAttr.setData({
                                        fileInfo: currentData.fileInfo,
                                        mtrlInfo: material
                                    });
                                    gameobject.entity.material = material;
                                }
                            }
                            break;
                        case 'delete':
                            {
                                if (materialAttr.getData().fileInfo?._id !== ''
                                    && materialAttr.getData().fileInfo?._id !== undefined) {


                                    const fileId = materialAttr.getData().fileInfo._id;



                                    // objViewer.objMng.disposeMaterial({
                                    //     fileID: materialAttr.getData().fileInfo._id
                                    // })
                                    // gameobject.entity.material = objViewer.objMng.defaultMaterial.standard.clone();

                                    // materialAttr.setData({
                                    //     fileInfo: {},
                                    //     mtrlInfo: gameobject.entity.material
                                    // });

                                    let res = await comFileDelete({
                                        id: fileId
                                    });

                                    if (res.r === 'ok') {
                                        _Context.messageModal.show({
                                            msg: `delete material ${fileId}`
                                        })
                                        await materialList.updateList();

                                        //clear material
                                        new_Material();
                                    }
                                    else {
                                        _Context.messageModal.show({
                                            msg: `delete material fail`
                                        })
                                    }
                                }




                            }
                            break;
                    }
                }

            }

        }
        catch (e) {
            console.log(e);
            _Context.messageModal.show({
                msg: e.message
            });
        }
    });

    //리스트에서 선택했을때
    materialList.setOnSelect(async (item) => {
        console.log(item);

        _Context.progressBox.show();

        try {
            const material = await objViewer.objMng.loadMaterial({
                fileID: item._id,
                repo_ip: item.repo_ip,
                onProgress: (progress) => {
                    // console.log(progress)
                    _Context.progressBox.update(progress);
                }
            });

            materialAttr.setData({
                fileInfo: item,
                mtrlInfo: material
            });

            gameobject.entity.material = material;

        }
        catch (e) {
            console.error(e);
            _Context.messageBox.show({ msg: e.message });
        }

        _Context.progressBox.closeDelay(150);

    });

    
    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 512,
            height: 512
        },
        isGrid: false,
        container: _glContainer,
        // envMapFile: basicEnvMapId
    });


    let _defaultMtrl = objViewer.objMng.defaultMaterial.standard.clone();
    // _defaultMtrl.userData.texture = {};

    const geometry = new THREE.SphereGeometry(30, 30, 30);
    const gameobject = objViewer.elvis.createGameObject({
        geometry: geometry,
        material: _defaultMtrl
    });

    objViewer.elvis.root_dummy.add(gameobject.entity);

    _Context.body_container.appendChild(_rootElm);
    _Context.objViewer = objViewer;
    _Context.gameObject = gameobject;

    
    const basicEnvMap = await comFileFindFile({
        filename: 'basic_envmap'
    })

    // console.log(basicEnvMap);

    await objViewer.objMng.setEnvMap({
        type: basicEnvMap[0].fileType,
        file_id: basicEnvMap[0]._id,
        repo_ip: basicEnvMap[0].repo_ip,
        onProgress: (progress) => {
            console.log(progress)
            // _Context.progressBox.update(progress);
        },
        bShow: true
    });

    //메트리얼 초기화
    new_Material();

    objViewer.elvis.startRender();

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}