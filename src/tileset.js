import { TextureLoader, NearestFilter, Vector2 } from "three";

export class RenderTileset {
	constructor(tileset, texture, renderer) {
		this._tileset = tileset;
		this.texture = texture;

		this._renderer = renderer;
	}

	static load(tileset, renderer) {
		return new Promise((resolve, reject) => {
			const texture = new TextureLoader().load(tileset.path, () => {
				texture.magFilter = texture.minFilter = NearestFilter;
				resolve(new RenderTileset(tileset, texture, renderer));
			}, undefined, e => {
				reject(e);
			});
		});
	}

	getTileUvs(id) {
		const array = [];

		const tileWidth = this._renderer.map.tileWidth,
			tileHeight = this._renderer.map.tileHeight,
			textureWidth = this.texture.image.width,
			textureHeight = this.texture.image.height,
			y = parseInt(id / (textureWidth / tileWidth)),
			x = id - y * (textureWidth / tileWidth);

		for (let ly = y; ly < y + 2; ly++) {
			for (let lx = x; lx < x + 2; lx++) {
				array.push(new Vector2(
					lx * tileWidth / textureWidth,
					ly * tileHeight / textureHeight * -1 + 1
				));
			}
		}

		return makeTrisFromQuad(array);
	}
}

function makeTrisFromQuad(quad) {
	return [
		[quad[2], quad[0], quad[3]],
		[quad[0], quad[1], quad[3]]
	];
}
