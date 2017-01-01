import { WebGLRenderer, OrthographicCamera, Scene, Vector2, Vector3 } from "three";

import { RenderLayer } from "./tilelayer";
import { RenderTileset } from "./tileset";

const CAMERA_UNIT = 10;
const TILE_BASE_SIZE = 8;

let testing = false;

export class Renderer {
	static enableTesting() {
		testing = true;
		console.info("[dtile-three-renderer] Testing mode enabled; WebGL will not be used.");
	}

	constructor(canvas, alpha) {
		this._canvas = canvas;
		if (!testing) {
			this.renderer = new WebGLRenderer({
				canvas,
				alpha
			});
		}
		this.camera = new OrthographicCamera(0, CAMERA_UNIT, 0, CAMERA_UNIT, 0.1, CAMERA_UNIT * 10);
		this.camera.position.z = CAMERA_UNIT;
		this.scene = new Scene();

		this.tileSize = new Vector2(0, 0);

		this.debugMode = false;
		this.runProfile = false;

		this._layers = [];
		this._tilesets = [];

		this.outlineEnabled = false;

		this.update();
	}

	get width() {
		return this._canvas.offsetWidth;
	}

	get height() {
		return this._canvas.offsetHeight;
	}

	update(shouldUpdate = ["size", "camera", "tiles"]) {
		if (this.debugMode && this.runProfile) console.profile("Update: " + shouldUpdate.join(", "));

		for (let toUpdate of shouldUpdate) {
			if (toUpdate === "size") {
				this._updateSize(this.width, this.height);
			} else if (toUpdate === "camera") {
				this.camera.updateProjectionMatrix();
			} else if (toUpdate === "tiles") {
				for (let layer of this._layers) {
					layer.update();
				}
			} else if (toUpdate === "layers") {
				this._updateLayers();
			} else if (toUpdate === "tilesets") {
				this.loadTilesets();
			} else {
				console.error("Unknown update action: " + toUpdate);
			}
		}

		this.render();

		if (this.debugMode && this.runProfile) console.profileEnd();
	}

	render() {
		if (testing) return;
		if (this.debugMode) console.time("Render Time");
		this.renderer.render(this.scene, this.camera);

		if (this.debugMode) {
			this.printDebugInfo("Render Time");
		}
	}

	changeMap(map) {
		// Completely reset the scene and rebuild it.
		this.scene = new Scene();

		this.map = map;

		const tileSize = new Vector2(map.tileWidth, map.tileHeight);
		const maxTileSize = Math.max(tileSize.x, tileSize.y);
		tileSize.divideScalar(maxTileSize).multiplyScalar(TILE_BASE_SIZE);
		this.tileSize = tileSize;

		this.loadTilesets();
		this._updateLayers();
	}

	loadTilesets() {
		this._tilesets = [];
		for (let i = 0; i < this.map.tilesets.length; i++) {
			RenderTileset.load(this.map.tilesets[i], this)
				.then(renderTileset => {
					this._tilesets[i] = renderTileset;
					this.update();
				}, e => {
					throw e;
				});
		}
	}

	getTileset(id) {
		return this._tilesets[id];
	}

	getTileAtMouse(position) {
		const normalizedPosition = new Vector3();
		normalizedPosition.x = (position.x / this.width) * 2 - 1;
		normalizedPosition.y = -(position.y / this.height) * 2 + 1;
		normalizedPosition.z = 0;

		normalizedPosition.unproject(this.camera);
		normalizedPosition.divide(new Vector3(this.tileSize.x, this.tileSize.y, 1));

		const tilePosition = new Vector2(normalizedPosition.x, normalizedPosition.y);
		tilePosition.set(Math.floor(tilePosition.x), Math.floor(tilePosition.y));

		return tilePosition;
	}

	getTile(x, y, layerId) {
		return this._layers[layerId].getTile(x, y);
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

	_updateLayers() {
		this._layers.forEach(layer => {
			this.scene.remove(layer);
		});

		this._layers = this.map.layers.map(layer => {
			const renderLayer = new RenderLayer(this, layer);
			this.scene.add(renderLayer);
			return renderLayer;
		});
	}

	printDebugInfo(consoleTimer) {
		console.group("Render info");
		console.log("Draw Calls: " + this.renderer.info.render.calls);
		console.log("Vertex Count: " + this.renderer.info.render.vertices);
		console.log("Face Count: " + this.renderer.info.render.faces);
		console.log("---");
		console.log("Textures Count: " + this.renderer.info.memory.textures);
		console.log("Shader Program Count: " + this.renderer.info.programs.length);
		if (consoleTimer) {
			console.log("---");
			console.timeEnd(consoleTimer);
		}
		console.groupEnd();
	}
}
