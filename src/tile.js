import {
	Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, Vector2, EdgesGeometry,
	LineBasicMaterial, LineSegments
} from "three";

export class RenderTile extends Mesh {
	constructor(x, y, tile, parentLayer, renderer) {
		const geometry = new PlaneGeometry(renderer.map.tileWidth, renderer.map.tileHeight);
		const material = new MeshBasicMaterial({
			side: DoubleSide,
			transparent: true,

			// For the outline
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
		});
		super(geometry, material);

		const outlineGeometry = new EdgesGeometry(this.geometry);
		const outlineMaterial = new LineBasicMaterial({
			color: 0x000000,
			linewidth: 2
		});
		this._outline = new LineSegments(outlineGeometry, outlineMaterial);
		this.add(this._outline);

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

		if (!this._lastTile ||
			this.tile.tileId !== this._lastTile.tileId ||
			this.tile.tilesetId !== this._lastTile.tilesetId) {
			// TODO: Optimization.

			// This is a work-around for this bug: https://github.com/mrdoob/three.js/issues/7179
			const newUvs = tileset.getTileUvs(this.tile.tileId);
			for (let i = 0; i < this.geometry.faceVertexUvs[0].length; i++) {
				for (let j = 0; j < this.geometry.faceVertexUvs[0][i].length; j++) {
					const newUv = newUvs[i][j];
					this.geometry.faceVertexUvs[0][i][j].set(newUv.x, newUv.y);
				}
			}
			this.geometry.uvsNeedUpdate = true;

			this._lastTile = this.tile.clone();
		}

		if (this.tint) {
			this.material.color.set(this.tint);
		} else {
			this.material.color.set(0xffffff);
		}

		this.material.polygonOffset = this._renderer.outlineEnabled;
		this._outline.visible = this._renderer.outlineEnabled;
	}
}
