import nodeResolve from "rollup-plugin-node-resolve";
import string from "rollup-plugin-string";

const pkg = require("./package.json");

const plugins = [
    nodeResolve({
        main: true,
        jsnext: true,
        browser: true
    }),
    string({
        include: ["**/*.frag", "**/*.vert"]
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
            dest: pkg["module"],
            format: "es",
            sourceMap: true
        }
    ]
};
