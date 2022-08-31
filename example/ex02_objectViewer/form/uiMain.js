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
    _menuBar.setCallback(async (menuName) => {
        console.log(menuName);

        switch (menuName) {
            case 'clear':
                objViewer.clearObject();
                break;
            case 'camera reset':
                objViewer.resetCamera();
                break;
            case 'add object':
                {
                    let redPlaneObj = objViewer.addPlane({color : 0xff0000});
                    redPlaneObj.position.set(0,0,0);
                }
                break;
        }
    });

    //object viewer 등록
    let basicEnvMapId = await comFileFindFile({});

    
    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size : {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        envMapFile: basicEnvMapId
    });


    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}