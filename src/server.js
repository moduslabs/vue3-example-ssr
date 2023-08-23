const path = require("path");
const express = require("express");
const { createSSRApp } = require("vue");
const { renderToString } = require("@vue/server-renderer");
const manifest = require("../dist/ssr-manifest.json");
const clientManifest = require("../client-dist/ssr-manifest.json");

const server = express();

const appPath = path.join(__dirname, "../dist", manifest["app.js"]);
const clientAppPath = path.join(__dirname, "../client-dist", clientManifest["client.js"]);
const App = require(appPath).default;

server.use("/img", express.static(path.join(__dirname, "../dist", "img")));
server.use("/js", express.static(path.join(__dirname, "../dist", "js")));
server.use("/css", express.static(path.join(__dirname, "../dist", "css")));
server.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "../dist", "favicon.ico"))
);
server.use(
  "/client.js",
  express.static(clientAppPath)
);

server.get("*", async (req, res) => {
  const app = createSSRApp(App);
  const appContent = await renderToString(app);

  const html = `
  <html>
    <head>
      <title>Hello</title>
      <link rel="stylesheet" href="${manifest["app.css"]}" />
      <script src="/client.js"></script>
    </head>
    <body>
      <div id="app">${appContent}</div>
    </body>
  </html>

  `;

  res.end(html);
});

console.log(`
  You can navigate to http://localhost:8080
`);

server.listen(8080);
