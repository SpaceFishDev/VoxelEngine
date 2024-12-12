#ifndef GL_SETUP
#include <stdio.h>
#include <stdlib.h>
#include "../glad/glad.h"
#include <GLFW/glfw3.h>

extern GLuint VAO;
extern GLuint VBO;

struct vec3
{
    GLfloat x, y, z;
};
struct vec4
{
    GLfloat x, y, z, t;
};

char *read_file(char *path);
GLFWwindow *init_opengl();
GLuint compile_shaders();
void VAO_VBO();
#endif