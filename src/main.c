#include <stdio.h>
#include <stdlib.h>
#include "../glad/glad.h"
#include <GLFW/glfw3.h>
#include "gl_setup.h"
#include <time.h>
float random_float()
{
    int x = rand();
    float y = (float)x / (float)RAND_MAX;
    return y;
}

int main()
{
    GLFWwindow *window = init_opengl();

    if (!window)
    {
        return -1;
    }

    VAO_VBO();

    int width, height;
    glfwGetFramebufferSize(window, &width, &height);

    GLuint shaderProgram = compile_shaders();

    glUseProgram(shaderProgram);
    GLint resolutionLocation = glGetUniformLocation(shaderProgram, "resolution");
    glUniform2f(resolutionLocation, (float)width, (float)height);
    const int NumVoxel = 10 * 10 * 10;

    float *buffer = calloc(1, 10 * 10 * 10 * sizeof(GLfloat));
    for (int i = 10 * 10 + 5 * 10 + 0; i < NumVoxel; i++)
    {
        buffer[i] = 1;
    }
    GLint VoxelLocation = glGetUniformLocation(shaderProgram, "voxel_map_v1");
    glUniform1fv(VoxelLocation, NumVoxel * 4, buffer);

    // Render loop
    while (!glfwWindowShouldClose(window))
    {
        glfwGetFramebufferSize(window, &width, &height);
        glViewport(0, 0, width, height);
        glUniform2f(resolutionLocation, (float)width, (float)height);

        glClear(GL_COLOR_BUFFER_BIT);

        glUseProgram(shaderProgram);
        glBindVertexArray(VAO);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // Cleanup
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(shaderProgram);

    glfwTerminate();
    return 0;
}
