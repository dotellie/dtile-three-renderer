import nodeResolve from "rollup-plugin-node-resolve";

const pkg = require("./package.json");

const plugins = [
	nodeResolve({
		main: true,
		jsnext: true,
		browser: true
	})
];

export default {
	entry: "src/index.js",
	plugins,
	targets: [
		{
			dest: pkg.main,
			format: "umd",
			moduleName: "dtileThreeRenderer",
			globals: { three: "THREE" },
			sourceMap: true
		},
		{
			dest: pkg["jsnext:main"],
			format: "es",
			sourceMap: true
		}
	]
};
