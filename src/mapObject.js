import {
	Mesh, MeshBasicMaterial, BoxGeometry, CanvasTexture, LinearFilter
} from "three";

const material = new MeshBasicMaterial({ transparent: true });

export class RenderMapObject extends Mesh {
	constructor(renderer, object) {
		const x = object.x * renderer.tileSize.x;
		const y = object.y * renderer.tileSize.y;
		const width = object.width * renderer.tileSize.x;
		const height = object.height * renderer.tileSize.y;

		const geometry = new BoxGeometry(width, height, 0.5);
		geometry.rotateZ(Math.PI);
		geometry.translate(width * 0.5, height * 0.5, 0);

		super(geometry, material.clone());

		this.position.set(x, y, 1);

		this.material.map = generateTexture("rgba(255, 61, 0, 0.5)", object.name, width * 4, height * 4);

		this._renderer = renderer;
		this._object = object;
	}
}

function generateTexture(color, text, width, height, font = "15px Arial") {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, width, height);

	ctx.font = font;
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.fillText(text, 10, 10, width - 20);

	const texture = new CanvasTexture(canvas);
	texture.minFilter = LinearFilter;
	return texture;
}
