import {
	Vector2
} from "three";

export class RenderTile {
	constructor(x, y, tile, parentLayer, renderer) {
		this.uvs = [];

		this._tilePosition = new Vector2(x, y);
		this.worldPosition = new Vector2(
			x * renderer.map.tileWidth + renderer.map.tileWidth * 0.5,
			y * renderer.map.tileHeight + renderer.map.tileHeight * 0.5
		);

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

		if (!tileset) return;

		if (!this._lastTile ||
			this.tile.tileId !== this._lastTile.tileId ||
			this.tile.tilesetId !== this._lastTile.tilesetId) {
			this.uvs = tileset.getTileUvs(this.tile.tileId);

			this._lastTile = this.tile.clone();
		}
	}
}
