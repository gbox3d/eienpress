import * as THREE from 'three';

class elvisObject3d extends THREE.Object3D {
	constructor() {
		super();
		this.type = 'elvisObject3d';
		this.resolved = false;
		this.isPrefabRoot = false;
		this.isElvisObject3D = true;
		// this.assetType = 'none';
	}
	makePrefabEntity(assetType) {

		this.isPrefabRoot = true;
		this.assetType = assetType; // assetType = 'prefab.fbx' , 'prefab.obj' , 'prefab.glf' , 'prefab.bltin'
	}
	toJSON(meta) {

		let output;

		// if (this.assetType.includes('prefab')) {
		// meta is a string when called from JSON.stringify
		const isRootObject = (meta === undefined || typeof meta === 'string');

		output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if (isRootObject) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {},
				nodes: {}
			};

			output.metadata = {
				version: 1.0,
				type: 'elvisObject',
				generator: 'elvisObject.toJSON'
			};

		}
		let _children = this.children
		this.children = []

		output.object = super.toJSON(meta).object;

		this.geometryFile && (output.object.geometryFile = this.geometryFile);
		this.materialFile && (output.object.materialFile = this.materialFile);
		this.isPrefabRoot && (output.object.isPrefabRoot = this.isPrefabRoot);
		this.assetType && (output.object.assetType = this.assetType);
		this.children = _children

		//동적로딩 상태 상태초기화 
		output.object.geometryFile?.resolve ? delete output.object.geometryFile.resolve : null;
		output.object.materialFile?.resolve ? delete output.object.materialFile.resolve : null;

		output.object.childTransforms = _children.map((child) => {
			return {
				name: child.name,
				matrix: child.matrix.toArray() //	복원은 다음과 같이 , object.matrix.fromArray( data.matrix );
			}
		});

		// console.log()
		// }
		// else {
		// 	output = super.toJSON(meta)
		// }

		console.log('elvisObject3d.toJSON', output)

		return output
	}
	copy(source, recursive = true) {

		super.copy(source, recursive);

		this.geometryFile = _.cloneDeep(source.geometryFile);
		this.materialFile = _.cloneDeep(source.materialFile);
		this.isPrefabRoot = source.isPrefabRoot;
		// this.assetType = source.assetType;
		this.childTransforms = source.childTransforms;

		return this;
	}

	// async resolveFbx(objMng, onProgress) {

	// 	if(this.resolved) return;

	// 	try {
	// 		if (this.materialFile) {
	// 			this.material = await objMng.loadMaterial({
	// 				fileID: this.materialFile.id,
	// 				repo_ip: this.materialFile.repo_ip,
	// 				onProgress: onProgress
	// 			})
	// 		}

	// 		if (this.geometryFile) {
	// 			let _entity = await objMng.loadFbx({
	// 				modelFile: this.geometryFile.id,
	// 				repo_ip: this.geometryFile.repo_ip,
	// 				onProgress: onProgress,
	// 				material: this.material
	// 			})
	// 			this.add(_entity.clone())
	// 		}
	// 		this.resolved = true;
	// 		// return _entity
	// 	} catch (e) {
	// 		console.log(e)
	// 	}
	// }

	// async resolveGlf(objMng, onProgress) {

	// 	if(this.resolved) return;

	// 	try {
	// 		if (this.materialFile) {
	// 			this.material = objMng.loadMaterial({
	// 				fileID: this.materialFile.id,
	// 				repo_ip: this.materialFile.repo_ip,
	// 				onProgress: onProgress
	// 			})
	// 		}

	// 		if (this.geometryFile) {
	// 			let _entity = objMng.loadGlf({
	// 				modelFile: this.geometryFile.id,
	// 				repo_ip: this.geometryFile.repo_ip,
	// 				onProgress: onProgress,
	// 				material: this.material
	// 			})
	// 			this.add(_entity.clone())

	// 		}
	// 		this.resolved = true;
	// 		// return _entity
	// 	} catch (e) {
	// 		console.log(e)
	// 	}
	// }



	// async resolveBuiltIn(objMng, onProgress) {
	// 	if(this.resolved) return;

	// 	try {
	// 		if (this.materialFile) {
	// 			this.material = await objMng.loadMaterial({
	// 				fileID: this.materialFile.id,
	// 				repo_ip: this.materialFile.repo_ip,
	// 				onProgress: onProgress
	// 			})
	// 		}

	// 		this.traverse((child) => {
	// 			if (child.isMesh) {
	// 				child.material = this.material
	// 			}
	// 		});

	// 		this.resolved = true;
	// 		// return _entity
	// 	} catch (e) {
	// 		console.log(e)
	// 	}
	// }

	// async resolve(objMng, onProgress) {

	// 	if (this.resolved) return;

	// 	if (this.assetType.includes('prefab.builtIn')) {
	// 		await this.resolveBuiltIn(objMng, onProgress)
	// 	}
	// 	else {
	// 		//원격파일 다운받아서 완성하기 
	// 		switch (this.assetType) {
	// 			case 'prefab.fbx':
	// 				await this.resolveFbx(objMng, onProgress);
	// 				break;
	// 			case 'prefab.obj':
	// 				break;
	// 			case 'prefab.glf':
	// 				await this.resolveGlf(objMng, onProgress);
	// 				break;
	// 		}

	// 	}
	// }
}

export default elvisObject3d;