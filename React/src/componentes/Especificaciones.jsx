import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RobotoFont from '../assets/texts_fonts/Roboto-Regular.ttf';
import PacificoFont from '../assets/texts_fonts/Pacifico-Regular.ttf';
import OrbitronFont from '../assets/texts_fonts/Orbitron-Regular.ttf';
import IndieFlowerFont from '../assets/texts_fonts/IndieFlower-Regular.ttf';

const Especificaciones = () => {
  const [textoArribaState, setTextoArribaState] = useState('');
  const [textoAbajo, setTextoAbajo] = useState('');
  const [estiloLetra, setEstiloLetra] = useState('');
  const [tamanoFuente, setTamanoFuente] = useState(12);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenNombre, setImagenNombre] = useState('');
  const [imagenAncho] = useState(500); // Ancho deseado
  const [imagenAlto] = useState(400); // Alto deseado

  useEffect(() => {
    // Cargar la fuente seleccionada
    const loadFont = async () => {
      let fontUrl = '';
      switch (estiloLetra) {
        case 'Roboto':
          fontUrl = RobotoFont;
          break;
        case 'Pacifico':
          fontUrl = PacificoFont;
          break;
        case 'Orbitron':
          fontUrl = OrbitronFont;
          break;
        case 'IndieFlower':
          fontUrl = IndieFlowerFont;
          break;
        default:
          fontUrl = '';
          break;
      }
      if (fontUrl !== '') {
        try {
          await new FontFace('CustomFont', `url(${fontUrl})`).load();
        } catch (error) {
          console.error('Error al cargar la fuente:', error);
        }
      }
    };
    loadFont();
  }, [estiloLetra]);

  // Función para manejar cambios en el texto de arriba
  const setTextoArriba = (value) => {
    setTextoArribaState(value);
    checkTextOverflow(); // Verificar si el texto se desborda
  };

  // Función para manejar la selección de archivos
  const handleSeleccionImagen = (e) => {
    const imagen = e.target.files[0];
    if (imagen) {
      setImagenSeleccionada(imagen);
      setImagenNombre(imagen.name); // Guardamos solo el nombre del archivo
    }
  };

  // Función para enviar los datos al servidor Go
  const enviarDatosAServidor = () => {
    // Construir el objeto de datos a enviar al servidor Go
    const datos = {
      textoArriba: textoArribaState,
      textoAbajo,
      estiloLetra,
      tamanoFuente,
      imagenNombre,
      imagenAncho,
      imagenAlto
    };
  
    console.log('Datos a enviar:', datos); // Agregar esta línea para verificar los datos antes de enviarlos al servidor
  
    // Realizar una solicitud POST al servidor Go
    axios.post('http://localhost:8080/guardar-especificaciones', datos)
      .then(response => {
        // Manejar la respuesta del servidor
        console.log(response.data); // Imprimir el mensaje de éxito en la consola
      })
      .catch(error => {
        // Manejar cualquier error
        console.error('Error del cliente no de enviaron los datos:', error);
      });
  };

 // Función para verificar si el texto se desborda del contenedor de la imagen
// Función para verificar si el texto se desborda del contenedor de la imagen
const checkTextOverflow = () => {
  const textoArribaElement = document.getElementById("mostrar-texto-arriba");

  if (textoArribaElement) {
    const textoArribaWidth = textoArribaElement.offsetWidth;
    const textoArribaScrollWidth = textoArribaElement.scrollWidth;

    if (textoArribaScrollWidth > textoArribaWidth) {
      // Si el texto se desborda, mostrar un mensaje emergente
      alert("¡El texto se ha desbordado del contenedor de la imagen!");
    }
  }
};


  return (
    <div>
      <div className="especificaciones-container">
        <h1 className="especificaciones-title">Generador de postales</h1>
        <div className="campo-texto-arriba">
          <label className="especificaciones-label">Ingrese el texto a mostrar arriba:</label>
          <input
            type="text"
            className="especificaciones-input"
            value={textoArribaState}
            onChange={(e) => setTextoArriba(e.target.value)}
          />
        </div>
        <div className="campo-texto-abajo">
          <label className="especificaciones-label">Ingrese el texto a mostrar abajo:</label>
          <input
            type="text"
            className="especificaciones-input"
            value={textoAbajo}
            onChange={(e) => setTextoAbajo(e.target.value)}
          />
        </div>
        <div className="estilo-letra">
          <label className="especificaciones-label">Seleccione el estilo de letra:</label>
          <select
            className="especificaciones-select"
            value={estiloLetra}
            onChange={(e) => setEstiloLetra(e.target.value)}
          >
            <option value="Roboto">Roboto</option>
            <option value="Pacifico">Pacifico</option>
            <option value="Orbitron">Orbitron</option>
            <option value="IndieFlower">IndieFlower</option>
          </select>
        </div>
        <div className="seleccion-tamano-fuente">
          <label className="especificaciones-label">Seleccione el número de fuente:</label>
          <select
            className="especificaciones-select"
            value={tamanoFuente}
            onChange={(e) => setTamanoFuente(parseInt(e.target.value))}
          >
            {[...Array(48)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="botones-container">
        <div className="boton-seleccionar">
          <input
            type="file"
            accept="image/*"
            id="seleccionar-imagen"
            onChange={handleSeleccionImagen}
            style={{ display: 'none' }}
          />
          <label htmlFor="seleccionar-imagen" className="boton-seleccionar-imagen">
            Selecciona la imagen
          </label>
        </div>
        <button className="boton-enviar" onClick={enviarDatosAServidor}>Enviar</button>
      </div>
      {imagenSeleccionada && (
        <div className="vista-previa-imagen" style={{ position: 'relative' }}>
          <div id="mostrar-texto-arriba" className="mostrar-texto-arriba" style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', fontFamily: estiloLetra, fontSize: tamanoFuente }}>
            {textoArribaState}
          </div>
          <div className="mostrar-texto-abajo" style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontFamily: estiloLetra, fontSize: tamanoFuente }}>
            {textoAbajo}
          </div>
          <img src={URL.createObjectURL(imagenSeleccionada)} alt="Vista previa" style={{ width: imagenAncho, height: imagenAlto }} />
        </div>
      )}
    </div>
  );
}

export default Especificaciones;
