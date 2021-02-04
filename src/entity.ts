//
//
// David Kviloria <dkviloria@gmail.com>
//
//

import { Vector3, AnimationMixer, Group } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export namespace dkvilo {
	type Mixer_t = { animationMixer: AnimationMixer; animationClip: any };

	export class Mesh {
		private model: string;
		private animations: [string];

		private mixer: [Mixer_t] | [];

		private _raw: Group | null;
		private _position: Vector3;
		private _scale: Vector3;

		constructor(model: string, animations: [string]) {
			this.model = model;
			this.animations = animations;
			this.mixer = [];
			this._raw = null;
			this._position = new Vector3(0, 0, 0);
			this._scale = new Vector3(0.5, 0.5, 0.5);
			this.__load_animated_mesh__();
		}

		get scale(): Vector3 {
			return this._scale;
		}

		set position(pos: Vector3) {
			this._position = pos;
		}

		get position(): Vector3 {
			return this._position;
		}

		get raw(): Group {
			return this._raw as Group;
		}

		public getMixer(): [Mixer_t] {
			return this.mixer as [Mixer_t];
		}

		playAnimationFromMixer() {
			if (this.mixer !== null) {
				for (const mix of this.mixer) {
					mix.animationMixer.clipAction(mix.animationClip).play();
				}
			} else {
				throw new Error("Animation Mixer is empty");
			}
		}

		__load_animated_mesh__() {
			const loader: FBXLoader = new FBXLoader();
			loader.load(this.model, (fbx: Group) => {
				fbx.scale.setScalar(0.1);

				const animLoader: FBXLoader = new FBXLoader();
				for (const animation of this.animations) {
					animLoader.load(animation, (anim: any) => {
						(this.mixer as [Mixer_t]).push({
							animationMixer: new AnimationMixer(fbx),
							animationClip: anim.animations[0],
						});
					});
				}

				this._raw = fbx;
			});
		}
	}

	export class Entity {
		private mesh: Mesh;

		constructor(mesh: Mesh) {
			this.mesh = mesh;
		}

		set position(pos: Vector3) {
			this.mesh.position = pos;
		}

		getMesh(): Group {
			return this.mesh.raw;
		}

		update(dt: number) {
			for (const m of this.mesh.getMixer()) {
				m.animationMixer.update(dt);
			}
		}

		playAnimationClips() {
			for (const m of this.mesh.getMixer()) {
				m.animationMixer.clipAction(m.animationClip).play();
			}
		}
	}
}
