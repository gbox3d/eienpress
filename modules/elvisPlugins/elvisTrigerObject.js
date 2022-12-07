import * as THREE from 'three';

class elvisTrigerObject extends THREE.Object3D {
	constructor() {
		super();
		this.type = 'elvisTrigerObject';
        this.isElvisTrigerObject = true;
		this.radius = 100;
		this.link = 'https://www.naver.com';
	}
	
	toJSON(meta) {
        const data = super.toJSON( meta );

		data.object.radius = this.radius;
		data.object.link = this.link;

		return data;
	}

	copy(source, recursive = true) {
		super.copy(source, recursive);

		this.radius = source.radius;
		this.link = source.link;

		return this;
	}
}

class elvisStartPoint extends THREE.Object3D {
	constructor() {
		super();
		this.type = 'elvisStartPoint';
		this.isElvisStartPoint = true;
		this.height = 150;
		this.radius = 5;

	}
	
	toJSON(meta) {

		//children 임시저장 
		let _children = this.children;
		this.children = [];

		const data = super.toJSON( meta );

		this.children = _children; //children 복구

		data.object.height = this.height;
		data.object.radius = this.radius;
		
		return data;
	}

	copy(source, recursive = true) {
		super.copy(source, recursive);

		this.height = source.height;
		this.radius = source.radius;

		return this;
	}
}


export {elvisTrigerObject,elvisStartPoint};