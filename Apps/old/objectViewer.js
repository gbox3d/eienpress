import * as THREE from 'three';
// import WEBGL from 'WebGL';
// import Stats from 'state';
import { OrbitControls } from 'OrbitControls';
import { TransformControls } from 'TransformControls';
import { FBXLoader } from 'fbxLoader';
import { GLTFLoader } from 'GLTFLoader';

import { RGBELoader } from 'RGBELoader';

import Elvis from 'evlis';
import { TextureLoader } from 'three';


export default function setup(option) {

    // const Context = option.Context;
    // let select_node = null;
    // let onSelectObject = option.onSelectObject;
    // let onObjectEditChange = option.onObjectEditChange;


    return new Elvis({
        camera: {
            fov: 45,
            far: 5000,
            near: 1,
            position: new THREE.Vector3(0, 100, 200),
            lookat: new THREE.Vector3()

        },
        renderer: {
            type: 'webgl',
            container: option.container,
            clear: {
                color: 0x000000,
                alpha: 1
            }
        },
        setup: async function () {

            //초기화 코드는 여기에서 코딩한다.
            const scope = this;
            this.pauseKeyInput = false;
            this.select_node = null;

            scope.userData = {}

            //확장함수
            scope.addObject = async function ({
                modelFile,textureFile,
                diffuseColor,
                onProgress,
                roughness=0.5,
                metalness=0.5,
                bumpScale=0.01,
            }) {
                let _texture
                {
                    //6282fc15be7f388aab7750dc

                    const loader = new TextureLoader();

                    let texture = await new Promise((resolve, reject) => {
                        // let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
                        // let texture = new THREE.Texture(blob);
                        // loader.load('/com/file/download/pub/6282fc15be7f388aab7750dc', function (texture) {
                        loader.load(`/com/file/download/pub/${textureFile}`, function (texture) {
                            // texture.needsUpdate = true;
                            // let material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, name: _file });
                            // scope.materialList['Kitamuki1.jpg'] = material;
                            resolve(texture);
                        },
                            function (xhr) {
                                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                                onProgress ? onProgress({
                                    name : textureFile,
                                    progress: (xhr.loaded / xhr.total * 100)
                                }) : null;
                                //loadingStatus.innerText = `radios hdr enviroment map : ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`;
                            }
                            ,
                            err => {
                                console.log(err);
                                return reject(err);
                            }
                        );
                    })

                    console.log('load complete', texture);
                    _texture = texture;
                }

                {
                    const loader = new FBXLoader();
                    // console.log(loader);

                    let object = await new Promise((resolve, reject) => {
                        // loader.load(`/com/file/download/pub/6282fc15be7f388aab7750db`,
                        loader.load(`/com/file/download/pub/${modelFile}`,
                            (object) => resolve(object),
                            (xhr) => { //progress
                                // console.log(xhr)
                                // console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
                                onProgress ? onProgress({
                                    name : 'modelfile',
                                    progress: (xhr.loaded / xhr.total * 100)
                                }) : null;
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                    });

                    object.traverse(function (child) {
                        if (child.isMesh) {

                            // const diffuseColor = new THREE.Color().setRGB(0.8, 0.8, 0.8);

                            child.material = new THREE.MeshStandardMaterial(
                                {
                                    map: _texture,
                                    bumpMap: _texture,
                                    bumpScale: 0.01,
                                    color: diffuseColor,
                                    metalness: 0.5,
                                    roughness: 0.5,
                                    // envMap: hdrTexture, //오브잭트 단위로 환경멥을 적용시킨다.
                                }
                            );
                        }
                    });
                    console.log(object)

                    scope.root_dummy.add(object);

                    return object;
                }
            }

            scope.removeAllChild = function () {
                scope.root_dummy.children.forEach(child => {
                    scope.root_dummy.remove(child);
                });
            }


            //////////

            try {

                scope.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                scope.renderer.toneMappingExposure = 0.75;
                scope.renderer.outputEncoding = THREE.sRGBEncoding;

                //shadow map setup
                scope.renderer.shadowMap.enabled = true;
                scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

                //tone map setup
                {
                    let texture = await new Promise((resolve, reject) => {
                        new RGBELoader()
                            .setPath('/com/file/download/pub/')
                            .load('62837f89be7f388aab7750e9', function (texture) {
                                return resolve(texture);
                            },
                                function (xhr) {
                                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                                    //loadingStatus.innerText = `radios hdr enviroment map : ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`;
                                },
                                function (err) {
                                    console.log(err);
                                    return reject(err);
                                });
                    });

                    console.log('load complete')

                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    scope.scene.background = texture;
                    scope.scene.environment = texture;

                    //사용자변수 등록 
                    scope.userData.envMapTexure = texture;
                }


                //그리드헬퍼
                const helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
                //helper.setColors(0x00ff00,0xff0000);
                scope.scene.add(helper);

                //오빗컨트롤
                //카메라의 현재 위치 기준으로 시작한다.
                var orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
                orbitControl.target.set(0, 0, 0);
                orbitControl.update();
                this.orbitControl = orbitControl;

                //트랜스폼 컨트롤러
                // this.trn_control = new TransformControls(this.camera, this.renderer.domElement);
                // this.trn_control.addEventListener('change', function () {
                //     scope.updateAll();

                // });
                // this.trn_control.addEventListener('dragging-changed', function (event) {
                //     orbitControl.enabled = !event.value;
                // });
                // this.trn_control.addEventListener('objectChange', (event) => {
                //     // console.log(event);
                //     onObjectEditChange?.call(this, this.select_node);
                // });

                // this.scene.add(this.trn_control);

                //dummy object setup
                this.root_dummy = new THREE.Group();
                this.scene.add(this.root_dummy);



                //setup complete
                this.startRender();
                option.onComplete(this);
                console.log('setup complete');

                return true;

            }
            catch (e) {
                console.error(e);
                return false;
            }
        },
        event: {
            onWindowResize: function () {
                //동적으로 창의 크기가 바뀌면 이부분이 콜백된다.
                // this.updateAll({
                //     resize: {
                //         width: window.innerWidth,
                //         height: window.innerHeight
                //     }
                // });
            },
            onUpdate: function (event) {

                // let angleSpeed = parseInt(angleSpeedSlider.value);

                // this.cube.rotation.x += THREE.MathUtils.degToRad(angleSpeed) * event.deltaTick;
                // this.cube.rotation.y += THREE.MathUtils.degToRad(angleSpeed) * event.deltaTick;


                // this.stats.update()
                this.updateAll();
            },
            onMouseMove: function (event) {
                let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;
            },
            onMouseDown: function (event) {

                if (this.orbitControl.enabled) { //오빗컨트롤이 활성화 상태일때만..
                    let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                    let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                    // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;

                    // let _rayCaster = this.trn_control.getRaycaster();
                    // _rayCaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);

                    // //레이캐스팅 충돌 검사
                    // let intersects = _rayCaster.intersectObjects(this.root_dummy.children);
                    // if (intersects.length > 0) {
                    //     let node = intersects[0].object;

                    //     if (this.select_node !== node) {

                    //         this.trn_control.attach(node);
                    //         this.select_node = node;
                    //         onSelectObject?.call(this, node);
                    //     }
                    // }
                    // else {
                    //     //없으면 선택 해제
                    //     // if (this.select_node &&
                    //     //     !this.trn_control.axis //기즈모 호버링 여부 판단 
                    //     // ) {
                    //     //     this.trn_control.detach();
                    //     //     this.select_node = null;
                    //     // }
                    // }

                }


            },
            onKeyDown: function (event) {
                // if (this.pauseKeyInput) {
                //     return;
                // }
                // let control = this.trn_control
                // switch (event.keyCode) {
                //     case 16: // Shift
                //         // snap control
                //         control.setTranslationSnap(1);
                //         control.setRotationSnap(THREE.MathUtils.degToRad(15));
                //         control.setScaleSnap(0.25);
                //         break;
                //     case 81: // Q
                //         control.setSpace(this.trn_control.space == "local" ? "world" : "local");
                //         break;
                //     case 87: // W
                //         control.setMode("translate");
                //         break;
                //     case 69: // E
                //         control.setMode("rotate");
                //         break;
                //     case 82: // R
                //         control.setMode("scale");
                //         break;
                //     case 187:
                //     case 107: // +,=,num+
                //         control.setSize(this.trn_control.size + 0.1);
                //         break;
                //     case 189:
                //     case 10: // -,_,num-
                //         control.setSize(Math.max(this.trn_control.size - 0.1, 0.1));
                //         break;
                //     case 27: //deselect
                //         control.detach();
                //         this.select_node = null;
                //         break;
                // }
            },
            onKeyUp: function (event) {
                // if (this.pauseKeyInput) {
                //     return;
                // }
                // let control = this.trn_control
                // switch (event.keyCode) {
                //     case 16: // Shift
                //         control.setTranslationSnap(null);
                //         control.setRotationSnap(null);
                //         control.setScaleSnap(null);
                //         break;
                // }
            }

        }
    });

}

