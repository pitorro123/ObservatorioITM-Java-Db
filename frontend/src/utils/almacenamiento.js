export function leerAlmacenamiento(clave, valorInicial) {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado === null) return valorInicial;
    return JSON.parse(guardado);
  } catch {
    return valorInicial;
  }
}

export function escribirAlmacenamiento(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // almacenamiento no disponible
  }
}