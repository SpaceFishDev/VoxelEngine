#version 330 core

out vec4 FragColor;
uniform vec2 resolution;
uniform sampler3D voxelTexture;
uniform int voxelMax;

struct Camera{
    vec3 lookfrom;
    vec3 lookat;
    float fov;
};

struct Ray{
    vec3 origin;
    vec3 dir;
};

Ray create_ray(vec2 uv, Camera camera)
{
    float aspect_ratio = resolution.x/resolution.y;
    float theta = radians(camera.fov);
    float half_height= tan(theta/2.0);
    float half_width = aspect_ratio*half_height;
    vec3 w = normalize(camera.lookfrom-camera.lookat);
    vec3 u = normalize(cross(vec3(0,1,0),w));
    vec3 v = cross(w,u);
    
    vec3 origin = camera.lookfrom;
    vec3 lower_left_corner = origin-(u*half_width)-(v*half_height) - w;
    vec3 horizontal = u*2.0*half_width;
    vec3 vertical = v*2.0*half_height;

    float xu = uv.x/resolution.x;
    float yu = uv.y/resolution.y;

    vec3 dir = normalize(lower_left_corner + (horizontal*xu)+(vertical*yu) - origin);
    return Ray(origin, dir);

}

vec3 byte_color_to_color(int r, int g, int b){
    return vec3(float(r)/255.9, float(g)/255.9, float(b)/255.9);
}

struct hit_record{
    vec3 pos;
    vec3 uvw;
    vec3 normal;
    ivec3 voxel;
    float t;
    bvec3 axis;
};

#define MAX_RAY_DEPTH 64

bool is_voxel_filled(ivec3 coords){
    vec4 idx = texture(voxelTexture, coords);
    return idx.a > 0;
}

vec3 get_color(ivec3 coords){
    vec4 idx = texture(voxelTexture, coords);
    vec3 output_col = vec3(idx.x, idx.y, idx.z);
    return output_col;
}

bool ray_cast(Ray r, out hit_record rec){
    r.dir = normalize(r.dir);
    if(r.dir.x < 0.0001){
        r.dir.x = 0.0001;
    }
    if(r.dir.y < 0.0001){
        r.dir.y = 0.0001;
    }
    if(r.dir.z < 0.0001){
        r.dir.z = 0.0001;
    }

    vec3 ray_signf = sign(r.dir);
    ivec3 ray_sign = ivec3(ray_signf);
    vec3 ray_step = 1.0/r.dir;

    vec3 ray_origin_grid = floor(r.origin);
    ivec3 voxel_coords = ivec3(ray_origin_grid);

    vec3 side_distance = ray_origin_grid - r.origin;

    side_distance += 0.5;
    side_distance += ray_signf*0.5;
    side_distance *= ray_step;

    bvec3 mask;

    for(int i= 0; i < MAX_RAY_DEPTH; ++i){
        if(is_voxel_filled(voxel_coords)){
            rec.axis = mask; 

            rec.pos = side_distance - r.origin;
            rec.pos += 0.5;
            rec.pos -= ray_signf*0.5;
            rec.pos *= ray_step;

            rec.voxel = voxel_coords;

            rec.t = max(rec.pos.x, max(rec.pos.y, rec.pos.z));

            rec.normal = vec3(mask)*-ray_sign;

            rec.uvw = rec.pos - rec.voxel;
            return true;
        }
        mask = lessThanEqual(side_distance.xyz, min(side_distance.yzx, side_distance.zxy));
        side_distance += vec3(mask) * ray_step;
        voxel_coords += ivec3(vec3(mask)) * ray_sign;
    }

    return false;
}


void main(){

    vec2 uv = gl_FragCoord.xy;
    Camera camera = Camera(vec3(0,0,0),vec3(0,0,1),90);
    Ray r = create_ray(uv, camera);
    hit_record rec;
    bool hit = ray_cast(r, rec);
    FragColor = vec4(r.dir,1);    
    if(hit){
        vec3 col = get_color(rec.voxel);
        FragColor = vec4(col,1);
    }
}