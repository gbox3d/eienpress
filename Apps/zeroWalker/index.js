import * as THREE from 'three';
import WEBGL from 'WebGL';

import waitModalSetup from '../../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../../modules/comModules/progressBox.js';
import messageModal from '/modules/comModules/messageModal.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";

import sceneWalkerSetup from '../../modules/elvisPlugins/sceneWalker.js';

// import clientSocketSetup from './clientSocket.js';
import { zeroWalkerObject } from '../../../modules/elvisPlugins/gameObject.js';

async function main() {

    // 634e8283526a0a6df4d8f5c1
    //test gallery : https://cam2us.ubiqos.co.kr:24030/Apps/gWalker/?gid=628a00bf6fdf6bbe514dfe50

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    globalThis.theApp = {
        host_url: '',
        modalContainer: document.querySelector('.modal-container')
    }

    theApp.waitModal = waitModalSetup(theApp);
    theApp.progressBox = progressBoxSetup(theApp);
    theApp.messageModal = messageModal(theApp);


    try {
        theApp.waitModal.show({
            msg: 'connecting to server...'
        });

        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        console.log(params.gid);
        theApp.sceneFileId = params.gid;

        // //환경멥 로딩
        let basicEnvMapId = await comFileFindFile({
            filename: 'basic_envmap'
        });

        const renderEngine = await sceneWalkerSetup({
            Context: theApp,
            isGrid: false,
            // sceneFileID: params.gid,
            // envMapFile: basicEnvMapId,
            onSelectObject: (obj) => {
                console.log(obj.parent.name);
            }
        });

        //환경멥 세팅 
        {
            const basicEnvMap = await comFileFindFile({
                filename: 'basic_envmap'
            });

            await renderEngine.objMng.setEnvMap({
                type: basicEnvMap[0].fileType,
                file_id: basicEnvMap[0]._id,
                repo_ip: basicEnvMap[0].repo_ip,
                onProgress: (progress) => {
                    // console.log(progress)
                    // _Context.progressBox.update(progress);
                },
                bShow: true
            });
        }

        renderEngine.objMng.initGameObjectSystem();

        //scene 로딩
        renderEngine.objMng.clearObject();
        const scene = await renderEngine.objMng.loadScene({
            fileID: theApp.sceneFileId,
            repo_ip: theApp.host_url
        });

        renderEngine.objMng.addEntity({
            entity: scene,
        })

        //start point , triger찾기
        theApp.startPoint = null;
        theApp.triger = [];

        scene.traverse((obj) => {
            if (obj.isElvisStartPoint) {
                theApp.startPoint = obj;
            }
            else if (obj.isElvisTrigerObject) {
                theApp.triger.push(obj);
            }
        });

        //start point가 없으면 원점으로
        if (theApp.startPoint === null) {
            theApp.startPoint = {
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                radius: 1,
                height: 1
            }
        }

        const hostPlayer = new zeroWalkerObject({
            engine: renderEngine,
            playerHeight: theApp.startPoint.height,
            playerWidth: theApp.startPoint.radius
        });
        hostPlayer.moveTo(
            theApp.startPoint.position.x,
            theApp.startPoint.position.y,
            theApp.startPoint.position.z
        );

        renderEngine.objMng.addGameObject({
            entity: hostPlayer,
        });

        theApp.hostPlayer = hostPlayer;

        theApp.renderEngine = renderEngine;

        theApp.waitModal.close();

        console.log('start trigger check loop');

        (function _trigger_loop() {
            theApp.triger.forEach((triger) => {
                // console.log(theApp.hostPlayer.position.distanceTo(triger.position), triger.radius);
                if (theApp.hostPlayer.position.distanceTo(triger.position) < triger.radius) {
                    window.location.replace(triger.link);
                }
            });
            setTimeout(() => {
                _trigger_loop();
            }, 1000);
        })();

    }
    catch (e) {
        console.log(e);
        theApp.waitModal.close();
        theApp.messageModal.show({
            msg: `Error : ${e}`
        });
        // theApp.waitModal.show(`에러 발생 : ${e.message}`);
        // alert(`에러 발생 : ${e.message}`);
    }

}



export default main;