import {
	Object3D, Raycaster, Mesh, PlaneGeometry, DoubleSide,
	Matrix4, ShaderMaterial, FaceColors
} from "three";

import { RenderTile } from "./tile";

import vertexSrc from "./shader/layer.vert";
import fragmentSrc from "./shader/layer.frag";

const material = new ShaderMaterial({
	uniforms: {
		texture: { type: "t", value: null },
		tileSize: { type: "2f", value: null },
		lineWidth: { type: "1f", value: null }
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
					tile = new RenderTile(x, y, this._tilelayer.tiles[index],
						this, this._renderer);

				this._tiles[index] = tile;
			}
		}
	}

	update() {
		const tilesetsFound = new Set();
		for (let tile of this._tiles) {
			tile.update();
			tilesetsFound.add(tile.tile.tilesetId);
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
		this.applyUvs();
	}

	generateMesh(id) {
		this.remove(...this.children);

		const mapWidth = this._renderer.map.width;
		const mapHeight = this._renderer.map.height;
		const width = mapWidth * this._renderer.tileSize.x;
		const height = mapHeight * this._renderer.tileSize.y;

		const geometry = new PlaneGeometry(width, height, mapWidth, mapHeight);
		geometry.applyMatrix(new Matrix4().makeTranslation(width / 2, height / 2, 0));

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

	applyUvs() {
		let { width, height } = this._renderer.map;
		width = parseInt(width); height = parseInt(height);

		this._tilesetMeshes.forEach(mesh => {
			mesh.geometry.faceVertexUvs[0].forEach((vertices, i) => {
				const uvIndex = Math.floor(i / 2);
				const offset = i % 2;

				// FIXME: PlaneGeometry has a lot of things inverted. After a
				// lot of struggling, this worked out somehow.
				const invertedUv = width * height - uvIndex - 1;
				const x = invertedUv - Math.floor(invertedUv / width) * width;
				const newX = x * -1 + width - 1;
				const id = invertedUv - x + newX;
				const tileObject = this._tiles[id];

				vertices.forEach((vertex, index) => {
					const { x, y } = tileObject.uvs[offset][index];
					vertex.set(x, y);
				});

				// const color = new Color(tileObject.tint || 0x000000);
				// for (let j = 0; j < 3; j++) {
				// 	mesh.geometry.faces[i].vertexColors[j] = color;
				// }
				mesh.geometry.faces[i].color.set(tileObject.tint || 0x000000);
				if (tileObject.tint) {
					mesh.geometry.colorsNeedUpdate = true;
				}
			});
			mesh.geometry.uvsNeedUpdate = true;

			this._updateMeshUniforms(mesh);
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
