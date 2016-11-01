import { Object3D, Raycaster } from "three";

import { RenderTile } from "./tile";

export class RenderLayer extends Object3D {
	constructor(renderer, tilelayer) {
		super();

		this._renderer = renderer;
		this._tilelayer = tilelayer;
		this._tiles = [];

		this._raycaster = null;

		this.init();
	}

	init() {
		const mapWidth = this._renderer.map.width,
			mapHeight = this._renderer.map.height;

		for (let y = 0; y < mapHeight; y++) {
			for (let x = 0; x < mapWidth; x++) {
				const index = y * mapWidth + x,
					tile = new RenderTile(x, y, this._tilelayer.tiles[index],
						this, this._renderer);

				this._tiles[index] = tile;
				this.add(tile);
			}
		}
	}

	update() {
		for (let tile of this._tiles) {
			tile.update();
		}
	}

	raycastToTile(cursorPosition, camera) {
		if (!this._raycaster) this._raycaster = new Raycaster();

		this._raycaster.setFromCamera(cursorPosition, camera);

		const intersections = this._raycaster.intersectObjects(this.children);
		for (let intersection of intersections) {
			return intersection.object.tilePosition;
		}
	}

	getTile(x, y) {
		return this._tiles[x + y * this._renderer.map.width];
	}
}
