import * as THREE from 'three';
// import WEBGL from 'WebGL';
// import { Octree } from 'Octree';
import { Capsule } from 'Capsule';


export class walker extends THREE.EventDispatcher {
    constructor({
        engine,
        playerWidth = 3.5,
        playerHeight = 15,
        playerSpeed = 500,
        gravity = 98,
        dampingParameter = 4, //0이상의값
        STEPS_PER_FRAME = 5
    }) {
        super();

        this.engine = engine;
        this.elvis = engine.elvis;
        this.m_playerCollider = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0), playerWidth);
        this.worldOctree = null

        // this.m_mousePointer = new THREE.Vector2();

        this.playerSpeed = playerSpeed;
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.playerFsm = 'ready';

        this.bDrag = false;
        this.playerOnFloor = false;
        this.mouseTime = 0;
        this.keyStates = {};

        this.GRAVITY = gravity;
        this.dampingParameter = dampingParameter;
        this.STEPS_PER_FRAME = STEPS_PER_FRAME;
    }


    getForwardVector() {

        // this.elvis.camera.getWorldDirection(this.playerDirection);
        let _vec = this.elvis.camera.getWorldDirection(new THREE.Vector3(0, 0, 0));

        _vec.y = 0;

        // this.playerDirection.y = 0;
        // this.playerDirection.normalize();

        return _vec;

    }

    getSideVector() {


        let _vec = this.elvis.camera.getWorldDirection(new THREE.Vector3(0, 0, 0));

        _vec.cross(new THREE.Vector3(0, 1, 0));

        return _vec;

        // this.playerDirection.y = 0;
        // this.playerDirection.normalize();
        // this.playerDirection.cross(camera.up);

        // return playerDirection;

    }

    controls(deltaTime) {

        // gives a bit of air control
        const speedDelta = deltaTime * (this.playerOnFloor ? this.playerSpeed : this.playerSpeed * 0.5);
        const keyStates = this.engine.getKeyStatus();


        if (keyStates['KeyW']) {

            this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));

        }

        if (keyStates['KeyS']) {

            this.playerVelocity.add(this.getForwardVector().multiplyScalar(- speedDelta));

        }

        if (keyStates['KeyA']) {

            this.playerVelocity.add(this.getSideVector().multiplyScalar(- speedDelta * 0.2));

        }

        if (keyStates['KeyD']) {

            this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta * 0.2));

        }

        if (this.playerOnFloor) {

            if (keyStates['Space']) {
                this.playerVelocity.y = 15;
            }

        }

    }

    playerCollisions() {

        const m_playerCollider = this.m_playerCollider;
        const playerVelocity = this.playerVelocity;

        const result = this.worldOctree?.capsuleIntersect(m_playerCollider);

        this.playerOnFloor = false;

        // console.log(m_playerCollider.start)


        if (m_playerCollider.start.y <= 0) {
            m_playerCollider.start.y = 0;
            playerVelocity.y = 0;
            this.playerOnFloor = true;
        }

        if (result) {

            this.playerOnFloor = result.normal.y > 0;

            if (!this.playerOnFloor) {

                playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

            }

            m_playerCollider.translate(result.normal.multiplyScalar(result.depth));

        }
    }

    todoResolve = [];
    async updatePlayer(deltaTime) {


        const camera = this.engine.elvis.camera;
        // const scope = this.engine.elvis;
        const m_playerCollider = this.m_playerCollider;
        const playerVelocity = this.playerVelocity;

        switch (this.playerFsm) {
            case 'ready':
                this.playerFsm = 'play';
            case 'stop':
                break;
            case 'play':
                {
                    let damping = Math.exp(- this.dampingParameter * deltaTime) - 1;

                    if (!this.playerOnFloor) {
                        playerVelocity.y -= this.GRAVITY * deltaTime;
                        // small air resistance
                        damping *= 0.1;
                    }

                    playerVelocity.addScaledVector(playerVelocity, damping);

                    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
                    m_playerCollider.translate(deltaPosition);

                    

                    this.playerCollisions();
                    camera.position.copy(m_playerCollider.end);

                    console.log(m_playerCollider.end)

                    // let isUpdateWorld = false;

                    if (this.todoResolve.length == 0) {
                        this.elvis.root_dummy.traverse((child) => {

                            if (child.isElvisObject3D && !child.resolved) {

                                const _distance = child.position.distanceTo(camera.position);

                                if (_distance < 500) {
                                    this.todoResolve.push(child);
                                    child.resolved = true;
                                }
                            }
                        }
                        );

                        if (this.todoResolve.length > 0) {

                            for (let i = 0; i < this.todoResolve.length; i++) {
    
                                console.log(`start resolve ${this.todoResolve[i].uuid}`);
    
                                // todoResolve[i].resolved = true;
                                await this.engine.objMng.resolvePrefab({
                                    entity: this.todoResolve[i],
                                    progress: (progress) => {
                                        // _Context.progressBox.update(progress);
                                    }
                                });
    
                                console.log(`complete resolve ${this.todoResolve[i].uuid}`);
    
                            }
                            this.worldOctree = this.engine.getWorldCollider();
                            this.todoResolve = [];
                        }
                    }

                    
                }
                break;
            default:
                break;
        }


    }

    update(event) {

        const deltaTime = Math.min(0.05, event.deltaTick) / this.STEPS_PER_FRAME;

        for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
            this.controls(deltaTime);
            this.updatePlayer(deltaTime);
        }
        // }

    }

}