import {
	Object3D, Raycaster, Mesh, DoubleSide, BufferAttribute, BufferGeometry,
	ShaderMaterial, FaceColors, Vector2, Color
} from "three";

import { TileGeometry } from "./tileGeometry";
import { RenderTile } from "./tile";

import vertexSrc from "./shader/layer.vert";
import fragmentSrc from "./shader/layer.frag";

const material = new ShaderMaterial({
	uniforms: {
		texture: { type: "t", value: null },
		tileSize: { type: "2f", value: new Vector2(0, 0) },
		lineWidth: { type: "1f", value: 0 }
	},
	vertexShader: vertexSrc,
	fragmentShader: fragmentSrc,

	extensions: {
		derivatives: true
	},

	transparent: true,
	side: DoubleSide,
	vertexColors: FaceColors
});

const outlineWidth = 1;

export class RenderLayer extends Object3D {
	constructor(renderer, tilelayer) {
		super();

		this._renderer = renderer;
		this._tilelayer = tilelayer;
		this._tiles = [];

		this._tilesetMeshes = new Map();

		this._raycaster = null;

		this.init();
	}

	init() {
		const mapWidth = this._renderer.map.width,
			mapHeight = this._renderer.map.height;

		for (let y = 0; y < mapHeight; y++) {
			for (let x = 0; x < mapWidth; x++) {
				const index = y * mapWidth + x,
					tile = new RenderTile(x, y,
						this._tilelayer.tiles[index], this._renderer);

				this._tiles[index] = tile;
			}
		}
	}

	update() {
		const tilesetsFound = new Set();
		for (let tile of this._tiles) {
			tile.update();
			const tilesetId = tile.currentTilesetId;
			if (tilesetId >= 0) {
				tilesetsFound.add(tilesetId);
			}
		}

		this._tilesetMeshes.forEach((mesh, meshId) => {
			let exist = tilesetsFound.has(meshId);
			if (exist) {
				tilesetsFound.delete(meshId);
			} else {
				this.remove(mesh);
				this._tilesetMeshes.delete(meshId);
			}
		});
		// These are the tilesets that need to be added. The others are removed.
		tilesetsFound.forEach(id => {
			this.generateMesh(id);
		});

		this.applyTextures();
		this.updateMeshes();
	}

	generateMesh(id) {
		const mapWidth = this._renderer.map.width;
		const mapHeight = this._renderer.map.height;
		const width = mapWidth * this._renderer.tileSize.x;
		const height = mapHeight * this._renderer.tileSize.y;

		const tileGeometry = new TileGeometry(width, height, mapWidth, mapHeight);
		const geometry = new BufferGeometry().fromGeometry(tileGeometry);

		const opacity = new Float32Array(mapWidth * mapHeight * 2 * 3);
		geometry.addAttribute("opacity", new BufferAttribute(opacity, 1));

		const mesh = new Mesh(geometry, material.clone());

		this._tilesetMeshes.set(id, mesh);
		this.add(mesh);
	}

	applyTextures() {
		this._tilesetMeshes.forEach((mesh, id) => {
			const tileset = this._renderer.getTileset(id);
			if (tileset) {
				mesh.visible = true;
				mesh.material.uniforms.texture.value = tileset.texture;
			} else {
				mesh.visible = false;
			}
		});
	}

	updateMeshes() {
		this._tilesetMeshes.forEach((mesh, meshTilesetId) => {
			const attributes = mesh.geometry.attributes;
			const noColor = new Color(0x000000);
			const noUv = new Vector2(-1, -1);

			let offset2 = 0, offset3 = 0;

			const faces = attributes.uv.count / 3;

			for (let i = 0; i < faces; i++) {
				const tileObject = this._tiles[Math.floor(i * 0.5)];

				const { currentId: tileId, currentTilesetId: tilesetId,
					tint, opacity: tileOpacity, uvs } = tileObject;

				if (tilesetId === meshTilesetId && tileId >= 0 && uvs.length > 0) {
					if (tileObject.triRenderCount < 2) {
						tileObject.triRenderCount++;
						setAttributesForFace(attributes, offset2, offset3, i,
							tileOpacity, uvs[i % 2], tint);
					}
				} else {
					setAttributesForFace(attributes, offset2, offset3, i,
						1, [noUv, noUv, noUv], noColor);
				}

				offset2 = offset2 + 6;
				offset3 = offset3 + 9;
			}

			this._updateMeshUniforms(mesh);

			attributes.uv.needsUpdate = true;
			attributes.color.needsUpdate = true;
			attributes.opacity.needsUpdate = true;
		});
	}

	getTile(x, y) {
		return this._tiles[x + y * this._renderer.map.width];
	}

	_updateMeshUniforms(mesh) {
		const uniforms = mesh.material.uniforms;
		uniforms.tileSize.value = this._renderer.tileSize;
		uniforms.lineWidth.value = this._renderer.outlineEnabled ? outlineWidth : 0;
	}
}

function setAttributesForFace(attributes, offset2, offset3, i,
	faceOpacity, uvArray, tint) {
	let off2 = 0, off3 = 0;
	for (let j = 0; j < 3; j++) {
		attributes.opacity.array[i * 3 + j] = faceOpacity;

		attributes.uv.array[offset2 + off2] = uvArray[j].x;
		attributes.uv.array[offset2 + off2 + 1] = uvArray[j].y;

		attributes.color.array[offset3 + off3] = tint.r;
		attributes.color.array[offset3 + off3 + 1] = tint.g;
		attributes.color.array[offset3 + off3 + 2] = tint.b;

		off2 = off2 + 2;
		off3 = off3 + 3;
	}
};
