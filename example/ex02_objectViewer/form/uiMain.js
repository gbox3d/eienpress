import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
import objectViewerSetup from '../../../modules/comModules/objectViewer.js';


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

            if (btnName === 'Viewer') {
                switch (menuName) {
                    case 'clear':
                        objViewer.clearObject();
                        break;
                    case 'camera reset':
                        objViewer.resetCamera();
                        break;
                    case 'add object':
                        {
                            let redPlaneObj = objViewer.addPlane({ color: 0xff0000 });
                            redPlaneObj.position.set(0, 0, 0);

                        }
                        break;
                    

                }
            }
            else if (btnName === 'script') {
                switch (menuName) {
                    case 'hello':
                        {   
                            const gameObject = objViewer.elvis.createGameObject({
                                entity : new THREE.Object3D()
                            });

                            gameObject.addScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/hello.js`);

                            objViewer.elvis.root_dummy.add(gameObject.entity);
                            gameObject.start();
                            
                        }
                        break;
                    case 'test1':
                        {
                            let cube = objViewer.addCube({ size: 100, color: 0xff0000 });

                            const gameObject = objViewer.elvis.createGameObject({
                                entity : cube
                            });

                            gameObject.addScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/rotation.js`);
                            gameObject.start();

                            
                            // const _script = await (await fetch(`./script_exam/rotation.js`)).text();
                            // const _codeObj = (new Function('engine', _script)).bind(gameObject)(objViewer.elvis);

                            // gameObject.update = _codeObj.update;
                            // gameObject.start = _codeObj.start;

                            // gameObject.entity.gameObject = gameObject;
                            // _codeObj.start();

                        }
                        break;
                    case 'test2':
                        {

                            let redPlaneObj = objViewer.addPlane({ color: 0xff0000 });
                            const gameObject = objViewer.elvis.createGameObject({
                                entity : redPlaneObj
                            });

                            gameObject.addScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/destory.js`);
                            gameObject.start();


                            // redPlaneObj.position.set(0, 0, 0);

                            // const gameObject = {
                            //     entity : redPlaneObj,
                            // } 

                            // const _script = await (await fetch(`./script_exam/destory.js`)).text();
                            // const _codeObj = (new Function('gameObject', _script)).bind(gameObject)();

                            // gameObject.update = _codeObj.update;
                            // gameObject.start = _codeObj.start;

                            // gameObject.entity.gameObject = gameObject;

                            // _codeObj.start();
                            
                        }
                        break;

                }
            }

        }



    });

    //object viewer 등록
    let basicEnvMapId = await comFileFindFile({});


    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        envMapFile: basicEnvMapId
    });


    // console.log(objViewer.elvis.THREE)


    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}