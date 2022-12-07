import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';

class elvisGameObject extends THREE.Object3D {
	constructor({ user }) {
		super();
		this.type = 'elvisGameobject';
		this.isElvisGameObject = true;
		// this.socket = socket; //서버 소켓 객체 
		this.user = user;
		this.socketId = user.id; //클라이언트 소켓아이디

	}

	receiveControl({ user, data }) {

		//apply transform
		if (data?.matrix) {
			// this.matrixAutoUpdate = false;
			// this.matrix.identity();
			// this.applyMatrix4(new THREE.Matrix4().fromArray(data.matrix));
			// this.matrixAutoUpdate = true;
			this.matrix.fromArray(data.matrix);
			this.matrix.decompose(this.position, this.quaternion, this.scale);
		}
	}

	update(event) {
		// console.log('dummyObject update');
	}
}

class dummyObject extends elvisGameObject {
	constructor({ sceneMng, user }) {

		super({ user });

		// this.roomName = roomName;
		this.sceneMng = sceneMng;

		// this.Context = Context;
		const objMng = sceneMng.objMng;

		// const objMng = objMng;

		//make host object
		let body = new THREE.Mesh(
			new THREE.CylinderGeometry(5, 5, 20, 32),
			objMng.defaultMaterial.standard);
		body.position.y = 10;

		let head = new THREE.Mesh(
			new THREE.SphereGeometry(5, 32, 32),
			objMng.defaultMaterial.standard);
		head.position.y = 20;

		let armL = new THREE.Mesh(
			new THREE.CylinderGeometry(2, 2, 10, 32),
			objMng.defaultMaterial.standard);
		armL.position.y = 15;
		armL.position.x = -7;

		let armR = new THREE.Mesh(
			new THREE.CylinderGeometry(2, 2, 10, 32),
			objMng.defaultMaterial.standard);
		armR.position.y = 15;
		armR.position.x = 7;

		let backpack = new THREE.Mesh(
			new THREE.BoxGeometry(3, 10, 10),
			objMng.defaultMaterial.standard);
		backpack.position.y = 15;
		backpack.position.z = -5;

		this.add(body);
		this.add(head);
		this.add(armL);
		this.add(armR);
		this.add(backpack);
	}




}

class gameObject extends dummyObject {

	constructor({ socket, roomName, sceneMng, user }) {
		super({ sceneMng, user });

		this.socket = socket;
		this.roomName = roomName;

		this.up = new THREE.Vector3(0, 1, 0);
		this.front = new THREE.Vector3(0, 0, 1);
		this.side = new THREE.Vector3(1, 0, 0);
		this.speed = 30;

	}


	getFrontVector() {
		let _front = this.front.clone().applyQuaternion(this.quaternion);
		return _front;
	}
	getUpVector() {
		let _up = this.up.clone().applyQuaternion(this.quaternion);
		return _up;
	}
	getSideVector() {
		let _side = this.side.clone().applyQuaternion(this.quaternion);
		return _side;
	}

	sendControl() {
		// const socket = this.Context.socket;

		if (this.roomName) {
			this.socket?.emit('control', {
				to: this.roomName,
				data: {
					matrix: this.matrix.toArray(),
				}
			});
		}
	}

	update(event) {

		if (this.bDummy) return;

		const camera = this.sceneMng.elvis.camera;
		const orbitControl = this.sceneMng.elvis.orbitControl;

		let obsVector = this.position.clone().sub(camera.position);
		let bUpdate = false;

		let _front = this.getFrontVector();

		if (this.sceneMng.getKeyStates('KeyW')) {
			this.position.addScaledVector(_front, (this.speed * event.deltaTick));
			bUpdate = true;
		}
		if (this.sceneMng.getKeyStates('KeyS')) {
			this.position.addScaledVector(_front, (-this.speed * event.deltaTick));
			bUpdate = true;
		}
		if (this.sceneMng.getKeyStates('KeyA')) {
			this.rotation.y += (Math.PI * event.deltaTick);
			bUpdate = true;
		}
		if (this.sceneMng.getKeyStates('KeyD')) {
			this.rotation.y -= (Math.PI * event.deltaTick);
			bUpdate = true;
		}

		if (bUpdate) {
			camera.position.copy(this.position.clone().sub(obsVector));

			camera.target.copy(this.position);
			orbitControl.target.copy(this.position);

			this.sendControl();

		}
	}
}

/////////

class walkerGameObject extends elvisGameObject {
	constructor({ user, socket,
		engine,
		playerWidth = 3.5,
		playerHeight = 15,
		playerSpeed = 500,
		gravity = 98,
		dampingParameter = 4, //0이상의값
		STEPS_PER_FRAME = 5
	}) {
		super({ user });
		this.socket = socket;

		this.engine = engine;
		this.elvis = engine.elvis;
		this.m_playerCollider = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, playerHeight, 0), playerWidth);
		this.worldOctree = null


		// this.m_mousePointer = new THREE.Vector2();

		this.playerSpeed = playerSpeed;
		this.playerHeight = playerHeight;
		this.playerWidth = playerWidth;

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


		this.AccTimer_ping = 0;


	}

	sendControl() {
		// const socket = this.Context.socket;

		const camera = this.engine.elvis.camera;
		const m_playerCollider = this.m_playerCollider;

		let _matrix = new THREE.Matrix4();
		// console.log(THREE.MathUtils)

		let qt = new THREE.Quaternion()
		qt.setFromAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y + Math.PI);
		_matrix.compose(m_playerCollider.start, qt, new THREE.Vector3(1, 1, 1));

		// console.log(_matrix.toArray())

		this.socket?.emit('control', {
			to: this.user.room,
			data: {
				matrix: _matrix.toArray(),
			}
		});
		// }
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

		if (result) {

			// console.log(result)

			this.playerOnFloor = result.normal.y > 0;

			if (!this.playerOnFloor) {

				playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
			}

			m_playerCollider.translate(result.normal.multiplyScalar(result.depth));

		}

		if (m_playerCollider.start.y <= 0) {
			m_playerCollider.start.y = 0;
			m_playerCollider.end.y = this.playerHeight;
			playerVelocity.y = 0;
			this.playerOnFloor = true;
		}

	}

	async checkResolve() {

		//임계영역지정 
		if (!this.bResolveNow) {

			this.bResolveNow = true;

			const camera = this.engine.elvis.camera;

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

						// console.log(`start resolve ${this.todoResolve[i].uuid}`);

						// todoResolve[i].resolved = true;
						await this.engine.objMng.resolvePrefab({
							entity: this.todoResolve[i],
							progress: (progress) => {
								// _Context.progressBox.update(progress);
							}
						});

						// console.log(`complete resolve ${this.todoResolve[i].uuid}`);

					}
					this.worldOctree = this.engine.getWorldCollider();
					this.todoResolve = [];
				}
			}

			this.bResolveNow = false;
		}
	}

	todoResolve = [];
	async updatePlayer(deltaTime) {

		const camera = this.engine.elvis.camera;
		const m_playerCollider = this.m_playerCollider;
		const playerVelocity = this.playerVelocity;

		switch (this.playerFsm) {
			case 'ready':
				this.playerFsm = 'play';
				this.checkResolve();
				break;
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


					//움직임 여부 판단 
					if (deltaPosition.length() > 0.01 || this.engine.getDragStatus()) {
						this.sendControl();
						//check resolve
						await this.checkResolve();
					}

					//ping
					if (this.AccTimer_ping > 2.5) {
						this.AccTimer_ping = 0;
						this.sendControl();
					}
					this.AccTimer_ping += deltaTime;
				}
				break;
			default:
				break;
		}

		this.position.copy(m_playerCollider.end);
	}

	moveTo(x, y, z) {
		const m_playerCollider = this.m_playerCollider;
		const playerVelocity = this.playerVelocity;

		m_playerCollider.start.set(x, y, z);
		m_playerCollider.end.set(x, y + this.playerHeight, z);
		playerVelocity.set(0, 0, 0);
	}

	update(event) {

		const deltaTime = Math.min(0.05, event.deltaTick) / this.STEPS_PER_FRAME;

		for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
			this.controls(deltaTime);
			this.updatePlayer(deltaTime);
		}

	}
}

export { dummyObject, gameObject, walkerGameObject };