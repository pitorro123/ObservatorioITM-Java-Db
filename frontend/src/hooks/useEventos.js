import { useMemo, useState } from "react";

const EVENTOS_POR_PAGINA = 4;
const CLAVE_A_ESTADO = {
  publicado: "publicado",
  borrador: "borrador",
  cancelado: "cancelado",
};

export function useEventos(listaEventos, usuarioActual = null) {
  const [pestañaActiva, setPestañaActiva] = useState("publicado");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [filtroMes, setFiltroMes] = useState(null);
  const [filtroAutor, setFiltroAutor] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const eventosFiltrados = useMemo(() => {
    const estadoActivo = CLAVE_A_ESTADO[pestañaActiva];
    return listaEventos.filter((evento) => {
      const coincideEstado = estadoActivo
        ? evento.estado === estadoActivo
        : true;
      const coincideMes = filtroMes
        ? evento.fecha.slice(0, 7) === filtroMes
        : true;
      const coincideBusqueda =
        evento.titulo.toLowerCase().includes(valorBusqueda.toLowerCase()) ||
        (evento.creadoPorNombre &&
          evento.creadoPorNombre.toLowerCase().includes(valorBusqueda.toLowerCase()));
      const coincideAutor =
        filtroAutor === "mis_eventos" && usuarioActual
          ? Number(evento.creadoPorId) === Number(usuarioActual.id)
          : true;
      return coincideEstado && coincideMes && coincideBusqueda && coincideAutor;
    });
  }, [listaEventos, valorBusqueda, pestañaActiva, filtroMes, filtroAutor, usuarioActual]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(eventosFiltrados.length / EVENTOS_POR_PAGINA)
  );

  const conteosPorEstado = useMemo(() => {
    const eventosBase = listaEventos.filter((evento) => {
      const coincideAutor =
        filtroAutor === "mis_eventos" && usuarioActual
          ? Number(evento.creadoPorId) === Number(usuarioActual.id)
          : true;
      return coincideAutor;
    });

    return {
      publicado: eventosBase.filter((e) => e.estado === "publicado").length,
      borrador: eventosBase.filter((e) => e.estado === "borrador").length,
      cancelado: eventosBase.filter((e) => e.estado === "cancelado").length,
    };
  }, [listaEventos, filtroAutor, usuarioActual]);

  const eventosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * EVENTOS_POR_PAGINA;
    return eventosFiltrados.slice(inicio, inicio + EVENTOS_POR_PAGINA);
  }, [eventosFiltrados, paginaActual]);

  const cambiarBusqueda = (texto) => {
    setValorBusqueda(texto);
    setPaginaActual(1);
  };

  const cambiarPestaña = (clave) => {
    setPestañaActiva(clave);
    setPaginaActual(1);
  };

  const cambiarFiltroMes = (valor) => {
    setFiltroMes(valor);
    setPaginaActual(1);
  };

  const cambiarFiltroAutor = (valor) => {
    setFiltroAutor(valor);
    setPaginaActual(1);
  };

  return {
    pestañaActiva,
    cambiarPestaña,
    valorBusqueda,
    cambiarBusqueda,
    filtroMes,
    cambiarFiltroMes,
    filtroAutor,
    cambiarFiltroAutor,
    conteosPorEstado,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    eventosPagina,
  };
}