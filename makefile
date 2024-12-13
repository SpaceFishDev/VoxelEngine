src = $(wildcard src/*.c)
out = main

all: build run
build:
	gcc $(src) glad/glad.c -o $(out) -lglfw -lGL -lm 
run:
	./main