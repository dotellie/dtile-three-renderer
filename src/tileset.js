import { TextureLoader, NearestFilter, Vector2 } from "three";

export class RenderTileset {
	constructor(tileset, texture, renderer) {
		this._tileset = tileset;
		this.texture = texture;

		this._renderer = renderer;
	}

	static load(tileset, renderer) {
		const resolveTexture = (resolve, texture) => {
			texture.name = `Tileset ${tileset.name}`;
			texture.magFilter = texture.minFilter = NearestFilter;
			texture.generateMipmaps = false;
			resolve(new RenderTileset(tileset, texture, renderer));
		};

		if (tileset.type === "image") {
			return new Promise((resolve, reject) => {
				const texture = new TextureLoader().load(tileset.virtualPath, () => {
					resolveTexture(resolve, texture);
				}, undefined, e => {
					reject(e);
				});
			});
		} else if (tileset.type === "test") {
			return new Promise((resolve, reject) => {
				const testTileset = generateTestImage(
					25, 25,
					renderer.map.tileWidth, renderer.map.tileHeight
				);

				const texture = new TextureLoader().load(testTileset, () => {
					resolveTexture(resolve, texture);
				}, undefined, e => {
					reject(e);
				});
			});
		}
	}

	getTileUvs(id) {
		if (id === -1) {
			const v = new Vector2(-1, -1);
			return makeTrisFromQuad([v, v, v, v]);
		}

		const array = [];

		const tileWidth = this._renderer.map.tileWidth,
			tileHeight = this._renderer.map.tileHeight,
			textureWidth = this.texture.image.width,
			textureHeight = this.texture.image.height,
			width = textureWidth / tileWidth,
			y = Math.floor(id / width),
			x = Math.floor(id - y * width);

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

function generateTestImage(width, height, tileWidth, tileHeight) {
	const canvas = document.createElement("canvas");
	canvas.width = width * tileWidth;
	canvas.height = height * tileHeight;
	const context = canvas.getContext("2d");

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			context.fillStyle = "#" + ("000000" +
				(Math.floor(Math.random() * 0xffffff))).substr(-6);
			context.fillRect(
				x * tileWidth, y * tileHeight,
				(x + 1) * tileWidth, (y + 1) * tileHeight
			);
		}
	}

	return canvas.toDataURL();
}
