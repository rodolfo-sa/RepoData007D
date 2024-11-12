const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000; //web service

server.use(middlewares);
server.use(router);

server.listen(port);
