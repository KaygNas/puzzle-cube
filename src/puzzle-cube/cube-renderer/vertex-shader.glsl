attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;

uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_ModelMatrix;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {
  v_Normal = normalize(vec3(u_ModelMatrix * vec4(a_Normal.x, a_Normal.y, a_Normal.z, 0)));
  v_Position = vec3(u_ModelMatrix * a_Position);
  v_Color = a_Color;
  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
}