import { WebGLRenderer, OrthographicCamera, Scene, Vector2 } from "three";

import { RenderLayer } from "./tilelayer";
import { RenderTileset } from "./tileset";

const CAMERA_UNIT = 100;

let testing = false;

export class Renderer {
	static enableTesting() {
		testing = true;
		console.info("[dtile-three-renderer] Testing mode enabled; WebGL will not be used.");
	}

	constructor(canvas) {
		this._canvas = canvas;
		if (!testing) {
			this.renderer = new WebGLRenderer({
				canvas
			});
		}
		this.camera = new OrthographicCamera(0, CAMERA_UNIT, 0, CAMERA_UNIT, 0.1, CAMERA_UNIT * 10);
		this.camera.position.z = CAMERA_UNIT;
		this.scene = new Scene();

		this._layers = [];
		this._tilesets = [];

		this.update();
	}

	get width() {
		return this._canvas.offsetWidth;
	}

	get height() {
		return this._canvas.offsetHeight;
	}

	update(shouldUpdate = "everything") {
		const should = type => {
			return shouldUpdate === "everything" || shouldUpdate[type];
		};

		if (should("size")) {
			this._updateSize(this.width, this.height);
		}

		if (should("camera")) {
			this.camera.updateProjectionMatrix();
		}

		if (should("tiles")) {
			for (let layer of this._layers) {
				layer.update();
			}
		}

		this.render();
	}

	render() {
		if (testing) return;
		this.renderer.render(this.scene, this.camera);
	}

	changeMap(map) {
		// Completely reset the scene and rebuild it.
		this.scene = new Scene();

		this.map = map;

		this._tilesets = [];
		for (let i = 0; i < this.map.tilesets.length; i++) {
			RenderTileset.load(map.tilesets[i], this)
				.then(renderTileset => {
					this._tilesets[i] = renderTileset;
					this.update();
				}, e => {
					console.error("Something went wrong while loading a texture", e);
				});
		}

		this._layers = map.layers.map(layer => {
			const renderLayer = new RenderLayer(this, layer);
			this.scene.add(renderLayer);
			return renderLayer;
		});
	}

	getTileset(id) {
		return this._tilesets[id];
	}

	getTileAtMouse(position, layerId) {
		const normalizedPosition = new Vector2();
		normalizedPosition.x = (position.x / this.width) * 2 - 1;
		normalizedPosition.y = -(position.y / this.height) * 2 + 1;

		return this._layers[layerId].raycastToTile(normalizedPosition, this.camera);
	}

	_updateSize(width, height) {
		if (!testing) {
			this.renderer.setSize(width, height);
		} else {
			this._canvas.style.width = width;
			this._canvas.style.height = height;
			this._canvas.width = width;
			this._canvas.height = height;
		}
		this.camera.right = width / height * CAMERA_UNIT;
	}
}
