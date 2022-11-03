import * as THREE from 'three';

class dummyObject extends THREE.Object3D {
	constructor({socket,roomName,sceneMng,user}) {
		super();
		this.type = 'elvisGameobject';
		this.isElvisGameObject = true;

		// this.Context = Context;
		this.socket = socket; //서버 소켓 객체 
		this.roomName = roomName;
		this.sceneMng = sceneMng;
		this.socketId = user.id; //클라이언트 소켓아이디

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

class gameObject extends dummyObject {

	constructor({socket,roomName,sceneMng,user}) {
		super({socket,roomName,sceneMng,user});

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

export { dummyObject, gameObject };