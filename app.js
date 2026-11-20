const inputCarpeta = document.getElementById("selector-carpeta");
const controles = document.querySelector(".controles");
const menu = document.getElementById("menu-resenas");
const vista = document.getElementById("vista-resena");

let mapaImagenes = {};

function parsearResena(texto) {
  const lineas = texto.replace(/\r\n/g, "\n").split("\n");
  const secciones = {};
  let etiquetaActual = null;

  for (const linea of lineas) {
    const limpia = linea.trim();
    if (limpia.startsWith("##")) {
      etiquetaActual = limpia.slice(2).trim().toLowerCase();
      secciones[etiquetaActual] = [];
    } else if (etiquetaActual) {
      secciones[etiquetaActual].push(linea);
    }
  }

  const obtener = (clave) => (secciones[clave] ? secciones[clave].join("\n").trim() : "");

  return {
    alumno: obtener("alumno"),
    titulo: obtener("título") || obtener("titulo"),
    autor: obtener("autor"),
    portada: obtener("portada"),
    resumen: obtener("resument") || obtener("resumen"),
    resena: obtener("reseña") || obtener("resena"),
    puntuacion: obtener("puntuación") || obtener("puntuacion")
  };
}

function normalizarPuntuacion(valorRaw) {
  if (!valorRaw) return 0;
  const limpio = valorRaw.replace(",", ".").trim();
  const num = parseFloat(limpio);
  if (Number.isNaN(num)) return 0;
  const clamped = Math.max(0, Math.min(5, num));
  return Math.round(clamped * 2) / 2;
}

function renderizarEstrellas(valorRaw) {
  const contenedor = document.getElementById("estrellas");
  const textoEl = document.getElementById("puntuacion-texto");
  contenedor.innerHTML = "";

  const nota = normalizarPuntuacion(valorRaw);

  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.className = "estrella";

    if (nota >= i) {
      span.classList.add("llena");
      span.textContent = "★";
    } else if (nota >= i - 0.5) {
      span.classList.add("media");
      span.textContent = "★";
    } else {
      span.classList.add("vacia");
      span.textContent = "☆";
    }

    contenedor.appendChild(span);
  }

  textoEl.textContent = `${nota.toString().replace(".", ",")} / 5`;
}

function mostrarResena(datos, botonActivo) {
  document.querySelectorAll("#menu-resenas button").forEach(b => b.classList.remove("activo"));
  if (botonActivo) botonActivo.classList.add("activo");

  document.getElementById("alumno").textContent = datos.alumno;
  document.getElementById("titulo").textContent = datos.titulo;
  document.getElementById("autor").textContent = datos.autor;
  document.getElementById("resumen").textContent = datos.resumen;
  document.getElementById("opinion").textContent = datos.resena;
  renderizarEstrellas(datos.puntuacion);

  const img = document.getElementById("imagen");
  const portadaLimpia = datos.portada.trim();
  const esUrl = /^https?:\/\//i.test(portadaLimpia);
  const urlImagen = mapaImagenes[portadaLimpia.toLowerCase()] || (esUrl ? portadaLimpia : "");

  if (urlImagen) {
    img.src = urlImagen;
    img.hidden = false;
  } else {
    img.hidden = true;
  }

  vista.hidden = false;
}

inputCarpeta.addEventListener("change", async (e) => {
  const archivos = Array.from(e.target.files);
  menu.innerHTML = "";
  mapaImagenes = {};

  const archivosTxt = [];

  for (const archivo of archivos) {
    const nombre = archivo.name;
    if (nombre.toLowerCase().endsWith(".txt")) {
      archivosTxt.push(archivo);
    } else if (archivo.type.startsWith("image/")) {
      mapaImagenes[nombre.toLowerCase()] = URL.createObjectURL(archivo);
    }
  }

  archivosTxt.sort((a, b) => a.name.localeCompare(b.name));

  if (archivosTxt.length > 0) {
    controles.hidden = true;
  }

  for (let i = 0; i < archivosTxt.length; i++) {
    const texto = await archivosTxt[i].text();
    const datos = parsearResena(texto);

    const btn = document.createElement("button");
    btn.textContent = datos.titulo && datos.alumno ? `${datos.titulo} | ${datos.alumno}` : datos.titulo || datos.alumno || archivosTxt[i].name.replace(".txt", "");
    btn.onclick = () => mostrarResena(datos, btn);
    menu.appendChild(btn);

    if (i === 0) mostrarResena(datos, btn);
  }
});
