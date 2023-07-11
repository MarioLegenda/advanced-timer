import typescript from "rollup-plugin-typescript2";

export default {
    input: "./src/index.tsx",
    output: [
        {
            //Specify the output directory
            dir: "build",
            //We will be using commonjs as a format for bundling
            format: "cjs",
            exports: "named",
            //It will provide you the sourcemap for debugging
            sourcemap: true,
            strict: false,
        },
    ],
    //Preserve module will generate a transpiled file for every file in your src folder, if set false it will bundle all the code in one file
    preserveModules: false,
    //Rollup allows a rich set of plugins to be used along side, we are only using one to compile typescript code to JS
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    //We will add React and React-dom as externals because our library will use these two packages from its parent
    external: ["react", "react-dom"],
};