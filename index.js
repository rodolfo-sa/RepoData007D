const jsonServer = require("json-server");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const express = require("express");

const server = jsonServer.create();
const router = jsonServer.router("almacen.json");  // Archivo de la base de datos
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

// Configura multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Carpeta de destino para las imágenes
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

// Endpoint para validar el token de recuperación de contraseña
server.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const gestores = router.db.get('gestores').value();  // Accede a los gestores desde la base de datos
  const gestor = gestores.find(g => g.resetToken === token && new Date(g.resetTokenExpiry) > new Date());

  if (gestor) {
    res.json(gestor);  // Si el token es válido, retorna los datos del gestor
  } else {
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
});

// Endpoint para actualizar la contraseña de un gestor
server.put('/gestores/:id', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const gestor = router.db.get('gestores').find({ id }).value();

  if (gestor) {
    gestor.password = newPassword;  // Actualiza la contraseña
    router.db.get('gestores').find({ id }).assign(gestor).write();  // Guarda los cambios
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } else {
    res.status(400).json({ message: 'Gestor no encontrado' });
  }
});

// Usa JSON Server para manejar los recursos
server.use(middlewares);
server.use(router);

// Inicia el servidor
server.listen(port, () => {
  console.log(`JSON Server está corriendo en http://localhost:${port}`);
});