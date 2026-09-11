import fondoPortada from "../assets/images/observatorio/hero/fondo-portada.png";
import telescopioIcon from "../assets/images/observatorio/icons/telescopio-observaciones.png";
import talleresIcon from "../assets/images/observatorio/icons/talleres-charlas.png";
import comunidadIcon from "../assets/images/observatorio/icons/comunidad-cientifica.png";
import andresTorresImg from "../assets/images/observatorio/profesores/andres-torres.jpg";
import luisOcampoImg from "../assets/images/observatorio/profesores/luis-ocampo.jpg";

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
      imagen: telescopioIcon,
      titulo: "Observaciones Astronómicas",
      descripcion:
        "Aprende utilizando telescopios y equipos especializados completamente gratis.",
    },
    {
      id: 2,
      icono: "Presentation",
      imagen: talleresIcon,
      titulo: "Charlas y Talleres",
      descripcion:
        "Participa en actividades dirigidas por docentes e investigadores.",
    },
    {
      id: 3,
      icono: "Users",
      imagen: comunidadIcon,
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

export const contenidoSemillero = {
  titulo: "Semillero de astronomía",
  descripcion:
    "Nuestro semillero de astronomía ofrece aprendizaje y experiencias en astronomía para estudiantes apasionados por el universo.",
  objetivos: [
    "Desarrollar habilidades de observación astronómica en los estudiantes.",
    "Fomentar la investigación en astronomía y ciencias afines.",
    "Participar en proyectos y actividades de divulgación científica.",
    "Crear una comunidad de aprendizaje permanente alrededor de la astronomía.",
  ],
  comoParticipar:
    "Para hacer parte del semillero, escríbenos al correo observatorioitm25@gmail.com indicando tu nombre, programa académico y motivación para participar. También puedes acercarte al observatorio en la Sede Fraternidad durante las jornadas de observación.",
};

export const contenidoObservatorio = {
  titulo: "Sobre el Observatorio Astronómico del ITM",
  descripcion:
    "El observatorio astronómico del ITM es un espacio dedicado a la divulgación, investigación y formación astronómica. Aquí puedes descubrir todo lo que hacemos.",
  trayectoria: [
    "El Observatorio Astronómico del ITM es un espacio dedicado a la divulgación científica y a la formación de la comunidad en astronomía.",
    "Ofrece servicios de observación pública, talleres educativos, conferencias y actividades de intercambio científico.",
    "Cuenta con telescopios y equipos especializados disponibles para los estudiantes y la ciudadanía.",
  ],
  mision:
    "Acercar la astronomía a la comunidad del ITM y de la ciudad mediante observaciones, formación y proyectos de investigación abiertos al público.",
  vision:
    "Ser un referente regional en divulgación astronómica, formando nuevas generaciones interesadas en la ciencia y el estudio del universo.",
};

export const equipoDocente = [
  {
    id: 1,
    nombre: "Andrés David Torres Cañas",
    cargo: "Coordinador del Observatorio",
    tituloAcademico: "Físico · M.Sc. en Astronomía",
    descripcion:
      "Lidera la gestión académica, formativa y de divulgación en el Campus Fraternidad. Dirige el Semillero de Astronomía y coordina las jornadas de observación abierta para la comunidad.",
    especialidades: [
      "Astronomía observacional",
      "Divulgación científica",
      "Mecánica celeste",
    ],
    correo: "andrestorres@itm.edu.co",
    imagen: andresTorresImg,
    badge: "Coordinación & Divulgación",
  },
  {
    id: 2,
    nombre: "Luis Fernando Ocampo Ochoa",
    cargo: "Instrumentador Científico",
    tituloAcademico: "Ingeniero · Especialista en Instrumentación",
    descripcion:
      "Especialista en calibración, mantenimiento y operación de los telescopios y sistemas ópticos del observatorio. Asesora a estudiantes e investigadores en astrofotografía y captura de datos astronómicos.",
    especialidades: [
      "Telescopios e Instrumentación",
      "Astrofotografía",
      "Óptica astronómica",
    ],
    correo: "luisocampo@itm.edu.co",
    imagen: luisOcampoImg,
    badge: "Instrumentación & Docencia",
  },
];