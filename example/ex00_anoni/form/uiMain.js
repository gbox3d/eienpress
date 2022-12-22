import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';


import 'md5';

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='ui-menu-bar'></div>
        <div class='gl-container'></div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _glContainer = htmlDoc.querySelector('.gl-container');


    const host_url = _Context.host_url;

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);

    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        if (btnName) {
            if (btnName === 'Hello') {
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
                }

            }
        }

    });

    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        cameraPosition: new THREE.Vector3(0, 50, 200),
    });

    // //환경멥 로딩
    let basicEnvMap= await comFileFindFile({
        filename: 'basic_envmap'
    });

    if(basicEnvMap.length > 0) {

        objViewer.objMng.setEnvMap({
            file_id: basicEnvMap[0]._id,
            repo_ip: basicEnvMap[0].repo_ip,
            type: basicEnvMap[0].fileType
        });
    }
    

    const _material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    const gameobject = objViewer.elvis.createGameObject({
        geometry: geometry,
        material: _material,
    });

    let loader = new THREE.TextureLoader();
    
    // let texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg');

    



    
    // gameobject.entity.material.map = texture;

    objViewer.elvis.root_dummy.add(gameobject.entity);
    objViewer.showEnvMap(true);
    objViewer.elvis.startRender();

    _Context.body_container.appendChild(_rootElm);

    async function _loop() {

        const texture = await new Promise((resolve, reject) => {

            loader.load('http://localhost:8080/getimg', function (texture) {
                // loader.load('http://localhost:8080/_out.png', function (texture) {
                resolve(texture);
            },
                function (xhr) {
                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    onProgress ? onProgress({
                        name: textureFile,
                        progress: (xhr.loaded / xhr.total * 100)
                    }) : null;
                }
                ,
                err => {
                    console.log(err);
                    return reject(err);
                }
            );
        })

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.repeat.set(1, 1);

        gameobject.entity.material.map = texture;
        gameobject.entity.material.needsUpdate = true;

        requestAnimationFrame(_loop);
    }

    _loop();

    // requestAnimationFrame(_loop);

    
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}