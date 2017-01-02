uniform sampler2D texture;
uniform vec2 tileSize;
uniform float lineWidth;

varying vec2 uvFinal;
varying vec3 vertexColor;
varying float vertexColorOpacity;
varying float vertexOpacity;

varying vec2 vertexPosition;

vec4 normalBlend(vec4 b, vec4 s) {
	vec3 cm = s.rgb * s.a + b.rgb * b.a * (1.0 - s.a);

	float ao = s.a + b.a * (1.0 - s.a);
	vec3 co = cm / ao;

	return vec4(co, ao);
}

void main() {
	vec4 textureColor = texture2D(texture, uvFinal);
	if (lineWidth > 0.0) {
		if (mod(vertexPosition.x + lineWidth * 0.5, tileSize.x) < lineWidth ||
			mod(vertexPosition.y + lineWidth * 0.5, tileSize.y) < lineWidth) {
			textureColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	vec4 otherColor = vec4(vertexColor, vertexColorOpacity);

	vec4 finalColor = normalBlend(textureColor * vertexOpacity, otherColor);

	gl_FragColor = finalColor;
}
