import * as THREE from 'three';

import { FBXLoader } from 'fbxLoader';
import { GLTFLoader } from 'GLTFLoader';

import { RGBELoader } from 'RGBELoader';
import { EXRLoader } from 'EXRLoader';

import { TextureLoader } from 'three';

import { comFileFindFile, comFileDownload, comFileGetDetail } from "../comLibs/utils.js";

class elvisObject3d extends THREE.Object3D {
	constructor() {
		super();
		this.type = 'elvisObject3d';
		this.resolved = false;
		this.isPrefabRoot = false;
		this.assetType = 'none';
	}
	makePrefabEntity(assetType) {

		this.isPrefabRoot = true;
		this.assetType = assetType; // assetType = 'prefab.fbx' , 'prefab.obj' , 'prefab.gltf' , 'prefab.bltin'
	}
	toJSON(meta) {

		let output;

		if (this.assetType.includes('prefab.fbx')) {
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
		}
		else if (this.assetType.includes('prefab.builtIn')) {

			output = super.toJSON(meta)

			output.images = []
			output.textures = []
			output.materials = []

			output.object.material = undefined
			output.object.children[0].material = undefined

			console.log(output)

			this.materialFile && (output.object.materialFile = this.materialFile);
			this.isPrefabRoot && (output.object.isPrefabRoot = this.isPrefabRoot);
			this.assetType && (output.object.assetType = this.assetType);
		}
		else {
			// output.object = super.toJSON(meta).object;
			output = super.toJSON(meta)

			this.isPrefabRoot && (output.object.isPrefabRoot = this.isPrefabRoot);
			this.assetType && (output.object.assetType = this.assetType);
		}

		return output
	}
	copy(source, recursive = true) {

		super.copy(source, recursive);

		this.geometryFile = source.geometryFile;
		this.materialFile = source.materialFile;
		this.isPrefabRoot = source.isPrefabRoot;
		this.assetType = source.assetType;

		return this;
	}

	async resolveFbx(objMng, onProgress) {

		if(this.resolved) return;

		try {
			if (this.materialFile) {
				this.material = await objMng.loadMaterial({
					fileID: this.materialFile.id,
					repo_ip: this.materialFile.repo_ip,
					onProgress: onProgress
				})
			}

			if (this.geometryFile) {
				let _entity = await objMng.loadFbx({
					modelFile: this.geometryFile.id,
					repo_ip: this.geometryFile.repo_ip,
					onProgress: onProgress,
					material: this.material
				})
				this.add(_entity)
			}
			this.resolved = true;
			// return _entity
		} catch (e) {
			console.log(e)
		}
	}

	async resolveBuiltIn(objMng, onProgress) {
		if(this.resolved) return;

		try {
			if (this.materialFile) {
				this.material = await objMng.loadMaterial({
					fileID: this.materialFile.id,
					repo_ip: this.materialFile.repo_ip,
					onProgress: onProgress
				})
			}

			this.traverse((child) => {
				if (child.isMesh) {
					child.material = this.material
				}
			});

			this.resolved = true;
			// return _entity
		} catch (e) {
			console.log(e)
		}
	}

	async resolve(objMng, onProgress) {

		if (this.resolved) return;

		if (this.assetType.includes('prefab.builtIn')) {
			await this.resolveBuiltIn(objMng, onProgress)
		}
		else {
			//원격파일 다운받아서 완성하기 
			switch (this.assetType) {
				case 'prefab.fbx':
					await this.resolveFbx(objMng, onProgress);
					break;
				case 'prefab.obj':
					break;
				case 'prefab.gltf':
					break;
			}

		}
	}
}

export default elvisObject3d;