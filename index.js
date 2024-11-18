const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json"); // Tu archivo JSON
const middlewares = jsonServer.defaults();
const multer = require("multer");
const path = require("path");
server.use('/uploads', express.static('uploads'));

// Configuración de multer para almacenar archivos en la carpeta "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para evitar conflictos
  },
});

const upload = multer({ storage });

// Middleware de json-server
server.use(middlewares);

// Crear carpeta de subida si no existe
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Endpoint para subir imágenes
server.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // Construir la URL para acceder a la imagen
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl: fileUrl }); // Devolver la URL de la imagen
});

// Agregar las rutas de json-server
server.use(router);

// Iniciar el servidor
const port = process.env.PORT || 10000;
server.listen(port, () => {
  console.log(`Servidor JSON Server ejecutándose en el puerto ${port}`);
});