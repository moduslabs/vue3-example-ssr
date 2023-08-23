const ManifestPlugin = require("webpack-manifest-plugin");
const nodeExternals = require("webpack-node-externals");

const isClient = process.env.CLIENT === "true";
const isSSR = process.env.SSR === "true";

/**
 * change the output dir for compiled files
 * https://github.com/vuejs/vue-cli/issues/2202
 */
if (isClient) {
  exports.outputDir = "client-dist";
}

exports.chainWebpack = webpackConfig => {
  if (!isSSR) {
    // This is required for repl.it to play nicely with the Dev Server
    webpackConfig.devServer.disableHostCheck(true);
    return;
  }

  /**
   * By default, vue-cli-service uses "app" as entry point for webpack,
   * and the corresponding entry point file  is "./src/main.js".
   * 
   * When we compile the file on ssr client side, we just allow "client" as 
   * the only entry point for webpack, and the corresponding entry point 
   * file is "./src/ssr-client.js", so we should delete "app", otherwise, 
   * vue-cli-service will be failed because of the lack of "./src/main.js"
   */
  webpackConfig
    .entryPoints
    .delete("app");


  if (isClient) {
    /**
     * Compile ./src/ssr-client.js, and we will response the compiled file
     * to browser in ./src/server.js.We won't import vue separately, so we
     * also need to bundle vue into the compiled file.
     */
    webpackConfig
      .entry("client")
      .clear()
      .add("./src/ssr-client.js");
  } else if (isSSR) {
    /**
     * Compile ./src/App.js, so we could require it in ./src/server.js.
     * 
     * We already require "vue" in ./src/server.js, so we don't need to
     * bundle it, but we still need to compile and bundle .css or .vue files,
     * so we add `nodeExternals` below.
     */
    webpackConfig
      .entry("app")
      .clear()
      .add("./src/App.js");

    webpackConfig.target("node");
    webpackConfig.output.libraryTarget("commonjs2");
    webpackConfig.externals(nodeExternals({ allowlist: /\.(css|vue)$/ }));

  } else {
    /**
     * Compile for SPA
     */
    webpackConfig
      .entry("app")
      .clear()
      .add("./src/spa-client.js");
  }
  
  webpackConfig
    .plugin("manifest")
    .use(new ManifestPlugin({ fileName: "ssr-manifest.json" }));



  webpackConfig.optimization.splitChunks(false).minimize(false);

  webpackConfig.plugins.delete("hmr");
  webpackConfig.plugins.delete("preload");
  webpackConfig.plugins.delete("prefetch");
  webpackConfig.plugins.delete("progress");
  webpackConfig.plugins.delete("friendly-errors");

  // console.log(webpackConfig.toConfig())
};