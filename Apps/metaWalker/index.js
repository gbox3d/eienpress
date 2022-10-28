import * as THREE from 'three';
import WEBGL from 'WebGL';

import waitModalSetup from '../../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../../modules/comModules/progressBox.js';
import messageModal from '/modules/comModules/messageModal.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";

import sceneWalkerSetup from '../../modules/elvisPlugins/sceneWalker.js';
import { walker } from './object/walker.js';
import objMng from '../../modules/elvisPlugins/objMng.js';

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
    // theApp.objectInfoBox = await objectInfoBoxSetup(theApp);

    try {
        theApp.waitModal.show({
            msg: 'connecting to server...'
        });

        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        console.log(params.gid);
        theApp.sceneFileId = params.gid;

        let res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(res);

        if (res?.r === 'ok') {

            // loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;
            // theApp.root_path = res.repository + '/' + res.user.userId;
            // theApp.uiMain = await uiMainSetup(theApp);

            

            // theApp.messageModal.show({
            //     msg: `${res.user.userName} 님 환영합니다.`
            // });

            // //환경멥 로딩
            let basicEnvMapId = await comFileFindFile({
                filename: 'basic_envmap'
            });

            const sceneWalker = await sceneWalkerSetup({
                Context: theApp,
                // sceneFileID: params.gid,
                envMapFile: basicEnvMapId,
                onSelectObject: (obj) => {
                    console.log(obj);
                }
            });

            //scene 로딩
            sceneWalker.objMng.clearObject();

            const scene = await sceneWalker.objMng.loadScene({
                fileID: params.gid,
                repo_ip: theApp.host_url
            });

            console.log(scene);

            sceneWalker.objMng.addEntity({
                entity:scene,
            })

            console.log(sceneWalker);
            const player = new walker({
                engine: sceneWalker,
                playerHeight : 120,
                playerWidth : 5
            });
            sceneWalker.addObjectList(player);

            theApp.sceneWalker = sceneWalker;

            theApp.waitModal.close();
        }
        else {

            theApp.waitModal.close();

            await theApp.messageModal.showWait({
                msg: '로그인이 필요합니다.'
            });

            //goto login page
            window.location.href = '/login';


        }
    
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