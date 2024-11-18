const jsonServer = require("json-server");
const multer = require("multer");
const path = require("path");
const cors = require("cors"); // Importa cors
const express = require("express");

const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

// Configura multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Asegúrate de que la carpeta 'uploads' exista
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Habilitar CORS para todas las solicitudes
server.use(cors());

// Endpoint para subir imágenes
server.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl: fileUrl });
});

// Sirve la carpeta de subidas como recursos estáticos
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Usa JSON Server para manejar los recursos
server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server está corriendo en http://localhost:${port}`);
});