import * as THREE from 'three';

/*
import { comFileFindFile, comFileDownload, comFileGetDetail } from "../comLibs/utils.js";

import { InstancedBufferAttribute } from 'three';
import { Color } from 'three';
import { Object3D } from 'three';
import { Group } from 'three';
import { InstancedMesh } from 'three';
import { Sprite } from 'three';
import { Points } from 'three';
import { Line } from 'three';
import { LineLoop } from 'three';
import { LineSegments } from 'three';
import { LOD } from 'three';
import { Mesh } from 'three';
import { SkinnedMesh } from 'three';
import { Bone } from 'three';
import { Fog } from 'three';
import { FogExp2 } from 'three';
import { HemisphereLight } from 'three';
import { SpotLight } from 'three';
import { PointLight } from 'three';
import { DirectionalLight } from 'three';
import { AmbientLight } from 'three';
import { RectAreaLight } from 'three';
import { LightProbe } from 'three';
import { OrthographicCamera } from 'three';
import { PerspectiveCamera } from 'three';
import { Scene } from 'three';
*/

import elvisObject3d from './elvisObject3d.js';

class loader extends THREE.ObjectLoader {
	constructor(objMng, onProgress) {
		super();
		this.objMng = objMng
		this.onProgress = onProgress;
	}

	parseElvisObject(data, geometries, materials, textures, animations) {

		const object = new elvisObject3d();

		object.uuid = data.uuid;

		data.assetType && (object.assetType = data.assetType);
		data.geometryFile && (object.geometryFile = data.geometryFile);
		data.materialFile && (object.materialFile = data.materialFile);
		data.isPrefabRoot && (object.isPrefabRoot = data.isPrefabRoot);
		data.childTransforms && (object.childTransforms = data.childTransforms);

		if (data.name !== undefined) object.name = data.name;

		if (data.matrix !== undefined) {

			object.matrix.fromArray(data.matrix);

			if (data.matrixAutoUpdate !== undefined) object.matrixAutoUpdate = data.matrixAutoUpdate;
			if (object.matrixAutoUpdate) object.matrix.decompose(object.position, object.quaternion, object.scale);

		} else {

			if (data.position !== undefined) object.position.fromArray(data.position);
			if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
			if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
			if (data.scale !== undefined) object.scale.fromArray(data.scale);

		}

		if (data.castShadow !== undefined) object.castShadow = data.castShadow;
		if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;

		if (data.shadow) {

			if (data.shadow.bias !== undefined) object.shadow.bias = data.shadow.bias;
			if (data.shadow.normalBias !== undefined) object.shadow.normalBias = data.shadow.normalBias;
			if (data.shadow.radius !== undefined) object.shadow.radius = data.shadow.radius;
			if (data.shadow.mapSize !== undefined) object.shadow.mapSize.fromArray(data.shadow.mapSize);
			if (data.shadow.camera !== undefined) object.shadow.camera = this.parseObject(data.shadow.camera);

		}

		if (data.visible !== undefined) object.visible = data.visible;
		if (data.frustumCulled !== undefined) object.frustumCulled = data.frustumCulled;
		if (data.renderOrder !== undefined) object.renderOrder = data.renderOrder;
		if (data.userData !== undefined) object.userData = data.userData;
		if (data.layers !== undefined) object.layers.mask = data.layers;

		if (data.children !== undefined) {

			const children = data.children;

			for (let i = 0; i < children.length; i++) {

				object.add(this.parseObject(children[i], geometries, materials, textures, animations));

			}

		}

		if (data.animations !== undefined) {

			const objectAnimations = data.animations;

			for (let i = 0; i < objectAnimations.length; i++) {

				const uuid = objectAnimations[i];

				object.animations.push(animations[uuid]);

			}

		}

		if (data.type === 'LOD') {

			if (data.autoUpdate !== undefined) object.autoUpdate = data.autoUpdate;

			const levels = data.levels;

			for (let l = 0; l < levels.length; l++) {

				const level = levels[l];
				const child = object.getObjectByProperty('uuid', level.object);

				if (child !== undefined) {

					object.addLevel(child, level.distance);

				}

			}

		}

		// if (data.childTransforms !== undefined) {
		// 	const childTransforms = data.childTransforms;
		// 	for (let i = 0; i < childTransforms.length; i++) {
		// 		const childTransform = childTransforms[i];

		// 		if (childTransform.name !== '') {

		// 			const child = object.getObjectByProperty('name', childTransform.name);
		// 			if (child !== undefined) {
		// 				// child.matrixAutoUpdate = false;
		// 				child.matrix.fromArray(childTransform.matrix);
		// 				child.matrix.decompose(child.position, child.quaternion, child.scale);
						
		// 				// child.matrixAutoUpdate = true;
		// 			}
		// 		}
		// 	}
		// }

		return object;

	}

	parseObject(data, geometries, materials, textures, animations) {

		let object;

		if (data.type === 'elvisObject3d') {

			object = this.parseElvisObject(data, geometries, materials, textures, animations);

			// console.log(`geomery : ${object.geometryFile?.id}, material : ${object.materialFile?.id}`)

		}
		else {
			object = super.parseObject(data, geometries, materials, textures, animations);
		}

		return object;
	}

	async parseAsync(json) {

		const animations = this.parseAnimations(json.animations);
		const shapes = this.parseShapes(json.shapes);
		const geometries = this.parseGeometries(json.geometries, shapes);

		const images = await this.parseImagesAsync(json.images);

		const textures = this.parseTextures(json.textures, images);
		const materials = this.parseMaterials(json.materials, textures);

		let object = this.parseObject(json.object, geometries, materials, textures, animations);

		const skeletons = this.parseSkeletons(json.skeletons, object);
		this.bindSkeletons(object, skeletons);

		return object;

	}
}

export default loader;