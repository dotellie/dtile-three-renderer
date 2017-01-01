varying vec2 uvFinal;
varying vec3 vertexColor;
varying float vertexColorOpacity;
varying float vertexOpacity;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	uvFinal = uv;
	vertexColor = color;
	if (length(color) > 0.0) {
		vertexColorOpacity = 0.5;
	} else {
		vertexColorOpacity = 0.0;
	}
	vertexOpacity = 1.0;
}
