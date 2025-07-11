const { config } = require("@swc/core/spack")

module.exports = config({
    entry: {
        app: __dirname + "/src/index.ts",
    },
    output: {
        path: __dirname + "/dist",
    },
    module: {},
});
