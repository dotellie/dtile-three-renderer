import { Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, Vector2 } from "three";

export class RenderTile extends Mesh {
	constructor(x, y, tile, parentLayer, renderer) {
		const geometry = new PlaneGeometry(renderer.map.tileWidth, renderer.map.tileHeight);
		const material = new MeshBasicMaterial({
			side: DoubleSide,
			transparent: true
		});
		super(geometry, material);

		this._tilePosition = new Vector2(x, y);
		this.position.set(x * renderer.map.tileWidth, y * renderer.map.tileHeight, 0);

		this._layer = parentLayer;
		this._renderer = renderer;
		this.tile = tile;

		this.tint = false; // Color (0xffffff) to tint, false to "un-tint"
	}

	get tilePosition() {
		return this._tilePosition.clone();
	}

	update() {
		const tileset = this._renderer.getTileset(this.tile.tilesetId);

		// Make invisible and return when tileset isn't loaded. Make sure to make
		// it visible once loaded though!
		if (!tileset) {
			this.visible = false;
			return;
		} else {
			this.visible = true;
		}

		// Update texture if needed
		if (!this.material.map) {
			this.material.map = tileset.texture;
		}

		if (this.tile.tileId === -1) {
			this.visible = false;
			return;
		} else {
			this.visible = true;
		}
		if (this.tile === this._lastTile) return;

		// TODO: Optimization.
		this.geometry.faceVertexUvs[0] = tileset.getTileUvs(this.tile.tileId);
		this.geometry.uvsNeedUpdate = true;

		if (this.tint) {
			this.material.color.set(this.tint);
		} else {
			this.material.color.set(0xffffff);
		}

		this._lastTile = this.tile.clone();
	}
}
