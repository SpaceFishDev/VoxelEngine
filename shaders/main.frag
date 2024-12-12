#version 330 core
out vec4 fragColor;

uniform vec2 resolution;

vec3 camera_pos = vec3(0);

struct ray{
    vec3 origin;
    vec3 direction;
};
vec3 at(ray r, float t){
    return r.origin + r.direction*t;
}
vec3 unit_vector(vec3 v){
    return v / length(v);
}
const float voxel_lim = 10;

uniform float[10*10*10] voxel_map_v1;



void marchf(inout ray r, float t)
{
    r.origin = at(r, t);    
}

const float dist = 0.0001;

int vto1d(vec3 pos){
    pos = round(pos);
    return int(((pos.z * voxel_lim*voxel_lim) + (pos.y*voxel_lim) + pos.x));
}

vec3 ray_col(ray r)
{
    vec3 col = vec3(0,0,0);

    int num_idx = 0;
    while(true){
        if(r.origin.x > voxel_lim || r.origin.y > voxel_lim || r.origin.z < 0 || r.origin.z > voxel_lim){
            return col/num_idx;
        }
        int idx = vto1d(r.origin);
        r.origin = at(r, dist);
        float data = voxel_map_v1[idx];
        col += data;
        ++num_idx;
    }
    return r.direction;
}



void main(){
    float focal_length = 1.0f;
    vec3 lookfrom = vec3(0,0,0);
    vec3 lookat = vec3(0,0,1);
    vec3 up = vec3(0,1,0);
    vec2 _resolution = resolution/voxel_lim;
    float ScreenW = resolution.x;
    float ScreenH = resolution.y;
    float aspect_ratio = ScreenW/ScreenH;
    float viewport_height = 2.0;
    float viewport_width = viewport_height*aspect_ratio;

    vec3 w = unit_vector(lookfrom - lookat);
    vec3 u = unit_vector(cross(up,w));
    vec3 v = cross(w,u);
    vec3 horizontal = viewport_width*u;
    vec3 vertical = viewport_height*v;
    vec3 lower_left_corner = lookfrom - horizontal/2 - vertical/2 -w;
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 pixel_world_pos = lower_left_corner + uv.x *horizontal + uv.y * vertical;
    vec3 dir = pixel_world_pos;
    vec3 origin = vec3(0,0,0);
    ray r;
    r.direction = dir;
    r.origin = origin;

    fragColor = vec4(ray_col(r), 1.0);
}