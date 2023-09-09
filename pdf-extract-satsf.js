const fs = require('fs');
const pdf = require('pdf-parse');

async function extractTextFromPDF(pdfFilePath) {
    try {
        // Lee el archivo PDF
        const dataBuffer = fs.readFileSync(pdfFilePath);

        // Convierte el buffer del PDF en texto
        const data = await pdf(dataBuffer);
        //console.log(data.text);
        const response = await extractDataFromText(data.text)
        response.urlPDF = pdfFilePath;

        // El texto extraído se encuentra en data.text
        return response
    } catch (error) {
        console.error('Error al extraer texto del PDF:', error);
        throw error;
    }
}
function extractDataFromText(text) {
    const data = {
        identificacion: {},
        direccion: {},
        actividades: [],
        regimenes: [],
    };
    // Divide el texto en líneas
    const lines = text.split('\n');
    let recopilandoActividades = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === 'RFC:') {
            data.identificacion.RFC = lines[i + 1];
        } else if (lines[i] === 'CURP:') {
            data.identificacion.CURP = lines[i + 1];
        }
        else if (lines[i] === 'Nombre(s):') {
            data.identificacion.Nombre = lines[i + 1];
        }
        else if (lines[i] === 'PrimerApellido:') {
            data.identificacion.ApellidoPaterno = lines[i + 1];
        }
        else if (lines[i] === 'SegundoApellido:') {
            data.identificacion.ApellidoMaterno = lines[i + 1];
        }
        else if (lines[i] === 'CódigoPostal:') {
            data.direccion.cp = lines[i + 1];
        }
        else if (lines[i] === 'TipodeVialidad:') {
            data.direccion.tipoVialidad = lines[i + 1];
        }
        else if (lines[i].includes('NombredeVialidad')) {
            const matchVialidad = lines[i].match(/NombredeVialidad:(\w+)NúmeroExterior:(\d+)/);
            if (matchVialidad) {
                const [, NombredeVialidad, NumeroExterior] = matchVialidad;
                data.direccion.NombredeVialidad = NombredeVialidad;
                data.direccion.NumeroExterior = NumeroExterior;
            }
        }
        else if (lines[i] === 'NúmeroInterior:Nombredela Colonia:') {
            data.direccion.colonia = lines[i + 1];
        }
        else if (lines[i].includes('Nombredela Localidad')) {
            const matches = lines[i].match(/Nombredela Localidad:(\w+)NombredelMunicipioo DemarcaciónTerritorial:(\w+)/);
            if (matches) {
                const [, NombreLocalidad, NombreMunicipio] = matches;
                data.direccion.NombreLocalidad = NombreLocalidad;
                data.direccion.NombreMunicipio = NombreMunicipio;
            }
        }
        else if (lines[i].includes('Nombredela EntidadFederativa')) {
            const matches = lines[i].match(/Nombredela EntidadFederativa:(\w+)EntreCalle:(\w+)/);

            if (matches) {
                const [, Entidad, ReferenciaCalle] = matches;
                data.direccion.Entidad = Entidad;
                data.direccion.ReferenciaCalle = [];
                data.direccion.ReferenciaCalle.push(ReferenciaCalle);
            }
        }
        else if (lines[i].includes('Y Calle')) {
            const matches = lines[i].match(/Y Calle:(\w+)/);
            if (matches) {
                const [, ReferenciaCalle] = matches;
                data.direccion.ReferenciaCalle.push(ReferenciaCalle);
            }
        }
        else if (lines[i].includes('Y Calle')) {
            const matches = lines[i].match(/Y Calle:(\w+)/);
            if (matches) {
                const [, ReferenciaCalle] = matches;
                data.direccion.ReferenciaCalle.push(ReferenciaCalle);
            }
        }

        else if (lines[i].includes('Actividades Económicas:')) { recopilandoActividades = true; }
        else if (lines[i].includes('Regímenes:')) { recopilandoActividades = false; }
        else if (recopilandoActividades) {
            const match = lines[i].match(/^(\d+)([a-zA-Z\s,]+?)(\d+\/\d+\/\d+)$/);
            if (match) {
                const orden = parseInt(match[1]);
                const restoLinea = match[2];
                const porcentajeMatch = restoLinea.match(/\d+/);
                const nombre = restoLinea.replace(/\d+/g, '').trim();
                const porcentaje = porcentajeMatch ? parseInt(porcentajeMatch[0]) : null;
                const fecha = match[3];

                data.actividades.push({ orden, nombre, porcentaje, fecha });
            }

        }
        if (lines[i].includes('Régimen de')) {
            const match = lines[i].match(/^Régimen de (.+?)(\d{2}\/\d{2}\/\d{4})?$/);
            if (match) {
                const nombre = match[1];
                const fechaInicio = match[2] || null;
                data.regimenes.push({ nombre, fechaInicio });
            }
        }



    }
    return data;

}



module.exports = extractTextFromPDF;
