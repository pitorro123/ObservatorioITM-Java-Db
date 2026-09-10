import fondoPortada from "../assets/images/observatorio/hero/fondo-portada.png";

export const contenidoPortada = {
  tituloLinea1: "Explora el universo desde",
  tituloLinea2: "el Observatorio Astronómico del ITM",
  descripcion:
    "Participa en observaciones, conferencias, talleres y actividades astronómicas abiertas para la comunidad.",
  imagen: fondoPortada,
  botonPrimario: { etiqueta: "Ver Calendario", ruta: "/eventos" },
  botonSecundario: { etiqueta: "Ver Semillero", ruta: "/semillero" },
};

export const estadoObservatorio = {
  titulo: "¿Se puede observar hoy?",
  descripcion:
    "Consulta las condiciones del observatorio y descubre si es una buena noche para observar.",
  linkLabel: "¿Cómo calculamos estas condiciones?",
  estado: {
    etiqueta: "Estado del observatorio",
    valor: "ABIERTO",
    descripcion: "El observatorio está abierto al público.",
  },
  condiciones: {
    etiqueta: "Condiciones de observación",
    valor: "FAVORABLES",
    descripcion: "Las condiciones actuales son adecuadas para observar el cielo.",
  },
};

export const porQueAsistir = {
  titulo: "¿Por qué asistir?",
  items: [
    {
      id: 1,
      icono: "Telescope",
      titulo: "Observaciones Astronómicas",
      descripcion:
        "Aprende utilizando telescopios y equipos especializados completamente gratis.",
    },
    {
      id: 2,
      icono: "Presentation",
      titulo: "Charlas y Talleres",
      descripcion:
        "Participa en actividades dirigidas por docentes e investigadores.",
    },
    {
      id: 3,
      icono: "Users",
      titulo: "Comunidad Científica",
      descripcion:
        "Conecta con estudiantes interesados en la astronomía y comparte experiencias únicas.",
    },
  ],
};

export const tarjetasInformacion = [
  {
    titulo: "Conoce el observatorio",
    descripcion:
      "El observatorio astronómico del ITM es un espacio dedicado a la divulgación, investigación y formación astronómica. Aquí puedes descubrir todo lo que hacemos.",
    icono: "Building2",
    gradiente: "azul",
    boton: {
      etiqueta: "Más información",
      ruta: "/sobre-nosotros",
    },
  },
  {
    titulo: "Semillero de astronomía",
    descripcion:
      "Nuestro semillero de astronomía ofrece aprendizaje y experiencias en astronomía para estudiantes apasionados por el universo.",
    icono: "GraduationCap",
    gradiente: "purpura",
    boton: {
      etiqueta: "Conoce el semillero",
      ruta: "/semillero",
    },
  },
];

export const informacionContacto = {
  correo: "observatorioitm25@gmail.com",
  telefono: "(604) 440 51 00",
  ubicacion: "Medellín, Colombia",
};