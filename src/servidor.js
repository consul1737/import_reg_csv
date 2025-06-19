import   express  from "express"; 

// Importamos las funciones necesarias
const app = express ();
const  PORT = 3003;

app.get('/', (req, res) => {console.log('Recibida una solicitud GET en la ruta raíz')
    res.send('¡Hola, mundo!');
   ;
})

 app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)});  