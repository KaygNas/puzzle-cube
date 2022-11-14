precision mediump float;
uniform vec3 u_LightColor;
uniform vec3 u_AmbientLight;
uniform vec3 u_LightPosition;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;

vec4 colorOfLight(vec3 lightPosition, vec3 vertexNormal, vec3 vectexPosition, vec4 vertexColor);

void main() {
  gl_FragColor = colorOfLight(u_LightPosition, v_Normal, v_Position, v_Color);
}

vec4 colorOfLight(vec3 lightPosition, vec3 vertexNormal, vec3 vectexPosition, vec4 vertexColor) {
  vec3 normal = normalize(vertexNormal);
  vec3 lightDirecion = normalize(lightPosition - vectexPosition);
  float nDotL = max(dot(lightDirecion, normal), 0.0);
  vec3 diffuse = u_LightColor * vec3(vertexColor) * nDotL;
  vec3 ambient = u_AmbientLight * vec3(vertexColor);
  vec4 color = vec4(diffuse + ambient, vertexColor.a);
  return color;
}