varying vec2 uvFinal;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	uvFinal = uv;
}
