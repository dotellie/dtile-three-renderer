import {
	Object3D, Raycaster, Mesh, DoubleSide, BufferAttribute, BufferGeometry,
	ShaderMaterial, FaceColors, Vector2
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

	transparent: true,
	side: DoubleSide,
	vertexColors: FaceColors
});

const outlineWidth = 0.5;

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
			const { uv, color, opacity } = mesh.geometry.attributes;

			let offset2 = 0, offset3 = 0;

			const faces = uv.count / 3;

			for (let i = 0; i < faces; i++) {
				const tileObject = this._tiles[Math.floor(i * 0.5)];

				if (tileObject.triRenderCount < 2) {
					tileObject.triRenderCount++;

					const { currentTileId: tileId, currentTilesetId: tilesetId,
						tint, opacity: tileOpacity } = tileObject;

					let tileUvs = tileObject.uvs;

					if (tileId < 0 || tileUvs.length === 0 || tilesetId !== meshTilesetId) {
						tileUvs = [[-1, -1, -1], [-1, -1, -1]];
					}

					let newOff2 = 0, newOff3 = 0;
					const uvOffset = i % 2;

					for (let j = 0; j < 3; j++) {
						opacity.array[i * 3 + j] = tileOpacity;

						uv.array[offset2 + newOff2] = tileUvs[uvOffset][j].x;
						uv.array[offset2 + newOff2 + 1] = tileUvs[uvOffset][j].y;

						color.array[offset3 + newOff3] = tint.r;
						color.array[offset3 + newOff3 + 1] = tint.g;
						color.array[offset3 + newOff3 + 2] = tint.b;

						newOff2 = newOff2 + 2;
						newOff3 = newOff3 + 3;
					}
				} else {
					// The tile is rendered, so we skip rendering the other tri.
					i++;
					offset2 = offset2 + 6;
					offset3 = offset3 + 9;
				}

				offset2 = offset2 + 6;
				offset3 = offset3 + 9;
			}

			uv.needsUpdate = true;
			color.needsUpdate = true;
			opacity.needsUpdate = true;
		});
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

	_updateMeshUniforms(mesh) {
		const uniforms = mesh.material.uniforms;
		uniforms.tileSize.value = this._renderer.tileSize;
		uniforms.lineWidth.value = this._renderer.outlineEnabled ? outlineWidth : 0;
	}
}
