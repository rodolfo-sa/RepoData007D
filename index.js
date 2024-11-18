const express = require("express"); // Importar Express
const jsonServer = require("json-server");
const server = express(); // Usar Express como servidor
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware de json-server
server.use(middlewares);

// Servir archivos estáticos desde la carpeta "uploads"
server.use("/uploads", express.static("uploads"));

// Endpoint para subir imágenes
server.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl: fileUrl });
});

// Agregar las rutas de json-server
server.use(router);

// Iniciar el servidor
const port = process.env.PORT || 10000;
server.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});