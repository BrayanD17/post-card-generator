package main

import (
	"encoding/json"
	"fmt"
	"gopkg.in/gomail.v2"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/anthonynsimon/bild/imgio"
	"github.com/fogleman/gg"
	"github.com/rs/cors"
)

type Especificaciones struct {
	TextoArriba  string  `json:"textoArriba"`
	TextoAbajo   string  `json:"textoAbajo"`
	EstiloLetra  string  `json:"estiloLetra"`
	TamanoFuente float64 `json:"tamanoFuente"`
	ImagenNombre string  `json:"imagenNombre"`
	ImagenAncho  int     `json:"imagenAncho"`
	ImagenAlto   int     `json:"imagenAlto"`
}

func guardarEspecificaciones(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Parse JSON data into Especificaciones struct
	var espec Especificaciones
	if err := json.Unmarshal(body, &espec); err != nil {
		http.Error(w, "Error parsing JSON", http.StatusBadRequest)
		return
	}
	generarImagen(espec)
	enviarCorreo(espec.ImagenNombre)
	fmt.Fprintf(w, "Datos recibidos con éxito")
}

func generarImagen(espec Especificaciones) {
	fmt.Println("Generando imagen con las siguientes especificaciones:")
	fmt.Println("Texto arriba:", espec.TextoArriba)
	fmt.Println("Texto abajo:", espec.TextoAbajo)
	fmt.Println("Estilo de letra:", espec.EstiloLetra)
	fmt.Println("Tamaño de fuente:", espec.TamanoFuente)
	fmt.Println("Nombre de la imagen:", espec.ImagenNombre)
	fmt.Println("Ancho de la imagen:", espec.ImagenAncho)
	fmt.Println("Alto de la imagen:", espec.ImagenAlto)

	// Concatenar la ruta base con el nombre de la imagen
	rutaImagen := filepath.Join("C:/Users/dinar/Pictures/Imagenes prueba/", espec.ImagenNombre)
	rutaSalida := filepath.Join("C:/Users/dinar/Pictures/Imagenes prueba/", "text_"+espec.ImagenNombre)

	// Abrir la imagen
	img, err := imgio.Open(rutaImagen)
	if err != nil {
		fmt.Println("Error al cargar la imagen:", err)
		return
	}

	// Crear un nuevo contexto de dibujo
	dc := gg.NewContext(espec.ImagenAncho, espec.ImagenAlto)

	// Dibujar la imagen en el contexto
	dc.DrawImage(img, 0, 0)

	// Llamar a la función para agregar texto a la imagen con el contexto de dibujo
	err = agregarTextoAImagen(dc, espec.TextoArriba, espec.TextoAbajo, espec.EstiloLetra, espec.TamanoFuente, rutaSalida)
	if err != nil {
		fmt.Println("Error al generar la imagen:", err)
	}
}

func agregarTextoAImagen(dc *gg.Context, textoArriba string, textoAbajo string, estiloLetra string, tamanoFuente float64, rutaSalida string) error {
	dc.LoadFontFace(estiloLetra+".ttf", tamanoFuente)

	// Configurar estilo de texto
	dc.SetRGB(1, 1, 1) // color blanco

	// Calcular posición del texto
	textoArribaX := float64(dc.Width()) / 2
	textoArribaY := 40
	textoAbajoX := float64(dc.Width()) / 2
	textoAbajoY := dc.Height() - 70

	// Dibujar texto arriba
	dc.DrawStringAnchored(textoArriba, textoArribaX, float64(textoArribaY), 0.5, 0)

	// Dibujar texto abajo
	dc.DrawStringAnchored(textoAbajo, textoAbajoX, float64(textoAbajoY), 0.5, 1)
	// Guardar la imagen resultante
	if err := dc.SavePNG(rutaSalida); err != nil {
		fmt.Println("Error al guardar la imagen:", err)
		return err
	}

	fmt.Println("Imagen creada con éxito en:", rutaSalida)
	return nil
}

func enviarCorreo(archivoAdjunto string) {
	from := "dinartebryan17@gmail.com"
	password := "nkdb aakg alqb kyec"
	to := "dinartebryan17@gmail.com"

	msg := gomail.NewMessage()
	msg.SetHeader("From", from)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", "Archivo Adjunto")
	msg.SetBody("text/html", "Se adjunta el archivo.")

	// Adjuntar archivo
	msg.Attach(("C:/Users/dinar/Pictures/Imagenes prueba/text_" + archivoAdjunto))

	d := gomail.NewDialer("smtp.gmail.com", 587, from, password)

	if err := d.DialAndSend(msg); err != nil {
		fmt.Println("Error al enviar el correo:", err)
		return
	}

	fmt.Println("Correo enviado con éxito.")
}

func main() {
	// Create a new CORS handler
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
	})

	// Attach the handler to the router
	handler := c.Handler(http.HandlerFunc(guardarEspecificaciones))

	// Listen and serve
	http.ListenAndServe(":8080", handler)
}
