uniform sampler2D texture;

varying vec2 uvFinal;

void main() {
	gl_FragColor = texture2D(texture, uvFinal);
}
