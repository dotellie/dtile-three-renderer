uniform sampler2D texture;

varying vec2 uvFinal;
varying vec3 vertexColor;
varying float vertexColorOpacity;
varying float vertexOpacity;

vec4 normalBlend(vec4 b, vec4 s) {
	vec3 cm = s.rgb * s.a + b.rgb * b.a * (1.0 - s.a);

	float ao = s.a + b.a * (1.0 - s.a);
	vec3 co = cm / ao;

	return vec4(co, ao);
}

void main() {
	vec4 textureColor = texture2D(texture, uvFinal);
	vec4 otherColor = vec4(vertexColor, vertexColorOpacity);

	vec4 finalColor = normalBlend(textureColor * vertexOpacity, otherColor);

	gl_FragColor = finalColor;
}
