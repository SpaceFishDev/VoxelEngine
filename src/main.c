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

typedef struct
{
    uint8_t r, g, b;
    uint8_t active;
} __attribute__((packed)) Voxel;

int main()
{
    srand(time(0));
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
    const GLint voxel_maximum = 512;
    GLint max_location = glGetUniformLocation(shaderProgram, "voxelMax");
    glUniform1i(max_location, voxel_maximum);

    Voxel *voxels = malloc(voxel_maximum * voxel_maximum * voxel_maximum * sizeof(Voxel));
    int i = 0;
    srand(time(0));
    for (int x = 0; x < voxel_maximum; ++x)
    {
        for (int y = 0; y < voxel_maximum; ++y)
        {
            for (int z = 0; z < voxel_maximum; ++z)
            {
                if (y < voxel_maximum / 2)
                {
                    voxels[i].active = 1;
                }
                voxels[i].r = (int)(((float)rand() / (float)RAND_MAX) * 255.99f);
                ++i;
            }
        }
    }
    printf("here\n");
    GLuint textureID;
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_3D, textureID);
    glTexImage3D(GL_TEXTURE_3D, 0, GL_RGBA, voxel_maximum, voxel_maximum, voxel_maximum, 0, GL_RGBA, GL_UNSIGNED_BYTE, voxels);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_3D, textureID);
    glUniform1i(glGetUniformLocation(shaderProgram, "voxelTexture"), 0);

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
