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

    // //환경멥 로딩
    let basicEnvMapId = await comFileFindFile({
        filename: 'basic_envmap'
    });

    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: false,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        envMapFile: basicEnvMapId,
        // Context: theApp,
        // container: _glContainer,
        // envMapFile: basicEnvMapId,
        cameraPosition: new THREE.Vector3(-169, -62, -140),
        // isGrid: false
    });

    const geometry = new THREE.TorusGeometry(30,
        10, 30, 30);
    const gameobject = objViewer.elvis.createGameObject({
        geometry: geometry,
        material: objViewer.elvis.defaultMaterial
    });

    objViewer.elvis.root_dummy.add(gameobject.entity);
    objViewer.showEnvMap(true);


    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}