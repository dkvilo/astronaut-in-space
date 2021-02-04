import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

const isProduction = process.env.NODE_ENV === "production";

export default {
	input: "src/app.ts",
	plugins: [
		resolve(),
		serve({
			open: true,
			verbose: true,
			port: 3000,
		}),
		livereload(),
		isProduction && terser(),
		json({ compact: true }),
		typescript({ lib: ["es5", "es6", "dom"], target: "es5" }),
	],
	output: {
		file: "build/bundle.js",
		format: "umd",
	},
};
