const fs = require('fs');
const { decode } = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const axios = require('axios');
const cheerio = require('cheerio');


// Ruta de la imagen que contiene el código QR
const imagePath = 'cif/RFC.jpg'; // Reemplaza con la ruta de tu imagen

// Lee la imagen desde el archivo
const image = fs.readFileSync(imagePath);
const img = new Uint8Array(image);

// Carga la imagen en un objeto Canvas utilizando la biblioteca canvas
async function getDataFromImage(imagePath) {
    return new Promise((resolve, reject) => {
        loadImage(imagePath).then((image) => {
            const canvas = createCanvas(image.width, image.height);
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
          
            // Obtiene los datos de píxeles de la imagen
            const imageData = context.getImageData(0, 0, image.width, image.height);
          
            // Utiliza jsQR para detectar el código QR
            const code = jsQR(imageData.data, imageData.width, imageData.height);
          
            if (code) {
                // Si se detecta un código QR, imprime el contenido
                const qrContent = code.data;
                console.log('Contenido del código QR:', qrContent);
                const contenCif = getContentHTML(qrContent);
                resolve(contenCif);
            } else {
                console.error('No se detectó ningún código QR en la imagen.');
                reject(new Error('No se detectó ningún código QR en la imagen.'));
            }
        }).catch((error) => {
            console.error('Error al cargar la imagen:', error);
            reject(error);
        });
    });
}


async function getContentHTML(url) {
  try {
    const response = await axios.get(url); // Reemplaza con la URL que desees obtener

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      // Inicializar un objeto para almacenar los datos
const data = {};
data.url = url;
// Extraer RFC
data.RFC = $('#ubicacionForm  li').text().match(/RFC: ([A-Z0-9]+)/)[1];

// Extraer CURP
data.CURP = $('#ubicacionForm td:contains("CURP:")').next().text();

// Extraer Nombre
data.Nombre = $('#ubicacionForm  td:contains("Nombre:")').next().text();

// Extraer Fecha de Nacimiento
data.FechaNacimiento = $('#ubicacionForm td:contains("Fecha Nacimiento:")').next().text();

// Extraer Entidad Federativa
data.EntidadFederativa = $('#ubicacionForm td:contains("Entidad Federativa:")').next().text();

// Extraer Municipio o Delegación
data.MunicipioDelegacion = $('#ubicacionForm td:contains("Municipio o delegación:")').next().text();

// Extraer Colonia
data.Colonia = $('#ubicacionForm td:contains("Colonia:")').next().text();

// Extraer Tipo de Vialidad
data.TipoVialidad = $('#ubicacionForm td:contains("Tipo de vialidad:")').next().text();

// Extraer Nombre de la Vialidad
data.NombreVialidad = $('#ubicacionForm td:contains("Nombre de la vialidad:")').next().text();

// Extraer Número Exterior
data.NumeroExterior = $('#ubicacionForm td:contains("Número exterior:")').next().text();

// Extraer Número Interior
data.NumeroInterior = $('#ubicacionForm td:contains("Número interior:")').next().text();

// Extraer CP
data.CP = $('#ubicacionForm td:contains("CP:")').next().text();

// Extraer Régimen
data.Regimen = $('#ubicacionForm td:contains("Régimen:")').next().text();

// Convertir los resultados en un objeto JSON

// Imprimir el objeto JSON
return data

    } else {
      console.error(`Error al obtener el contenido HTML. Código de estado: ${response.status}`);
    }
  } catch (error) {
    console.error('Error al hacer la solicitud:', error.message);
  }
}


module.exports = getDataFromImage;
