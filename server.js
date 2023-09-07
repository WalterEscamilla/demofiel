const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios'); // Importa la biblioteca Axios
const multer = require('multer'); // Para manejar archivos
const getDataFromImage = require('./qr-decode');
// Configuración de multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'CIF/');
  },
  filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = Date.now() + ext;
      cb(null, filename);
  },
});
const upload = multer({ storage: storage });

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000'); // Aquí especifica el origen permitido
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Encabezados permitidos
  
    // Habilita las credenciales (si es necesario)
    res.header('Access-Control-Allow-Credentials', 'true');
  
    // Continúa con la siguiente función middleware
    next();
  })

// Define una ruta estática para servir archivos estáticos (como tu index.html)
app.use(express.static(path.join(__dirname)));

// Configura la ruta raíz para servir tu index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/obtenerIdDeCredencial', async (req, res) => {
    const { rfc, password } = req.body;
    console.info({rfc, password})
  
    // Llama a la función obtenerIdDeCredencial aquí y maneja la respuesta
    try {
      //const id = await obtenerIdDeCredencial(rfc, password);
      const url = 'https://api.sandbox.syntage.com';

      // Configura los datos del JSON que deseas enviar
      const data = {
        type: 'ciec',
        rfc,
        password,
      };
    
      const respuesta = await axios.get(`${url}/taxpayers/${rfc}/tax-status`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'e6448bc356494b2174baf14cb4a2ea17'
        },
      });
  
      // Comprueba el estado de la respuesta HTTP
      
  
      const datos = respuesta.data;
  
      // Imprime la respuesta JSON
      console.log('Respuesta JSON:', JSON.stringify(datos, null, 2));
  

    // Imprime la respuesta JSON
      res.json(datos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post('/validate-cif', upload.single('image'), async (req, res) => {
    if (req.file) {
        const imagePath = 'CIF/' + req.file.filename;
        const data = await getDataFromImage(imagePath);
        console.log(data);
        res.json({ data });
    } else {
        res.status(400).json({ error: 'No se cargó ningún archivo.' });
    }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});


