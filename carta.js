// ===== FILTROS DE LA CARTA =====
// Este archivo solo se carga en carta.html, así que no hace falta comprobar si existen los filtros.
const filtros = document.querySelector('.filtros');
const botones = filtros.querySelectorAll('button');
const secciones = document.querySelectorAll('.carta-seccion');
const recomendados = document.querySelectorAll('.recomendados-grupo');
const aviso = document.querySelector('#aviso-filtro');
const carta = document.querySelector('#carta-wrapper');

filtros.hidden = false;

// Si una categoría se queda sin productos (el cliente aún no los ha pasado), su botón no sale
botones.forEach((b) => {
    const seccion = [...secciones].find((s) => s.dataset.categoria === b.dataset.filtro);
    if (seccion && !seccion.querySelector('.producto')) b.hidden = true;
});

function filtrar(elegido) {
    botones.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filtro === elegido));

    secciones.forEach((seccion) => {
        seccion.hidden = elegido !== 'todo' && seccion.dataset.categoria !== elegido;
    });

    // Hay un grupo de recomendados por botón (también uno para "todo"): solo se ve el suyo
    recomendados.forEach((grupo) => {
        grupo.hidden = grupo.dataset.categoria !== elegido;
    });
}

botones.forEach((boton) => {
    boton.addEventListener('click', () => {
        const elegido = boton.dataset.filtro;
        carta.classList.add('filtrando');   // activa el fundido de carta.css (no en la carga: la página no se anima al abrirla)
        filtrar(elegido);

        // El filtro queda en la URL (carta.html?filtro=bebidas): se puede compartir y sobrevive a recargar
        const url = new URL(location.href);
        if (elegido === 'todo') {
            url.searchParams.delete('filtro');
        } else {
            url.searchParams.set('filtro', elegido);
        }
        history.replaceState(null, '', url);

        // El lector de pantalla no ve que la carta ha cambiado: se lo dice este aviso (aria-live en el HTML)
        aviso.textContent = elegido === 'todo' ? 'Mostrando toda la carta' : `Mostrando: ${boton.textContent}`;
    });
});

// Si se entra con un filtro en la URL, se aplica (solo si es el de alguno de los botones)
const filtroUrl = new URLSearchParams(location.search).get('filtro');
if ([...botones].some((b) => b.dataset.filtro === filtroUrl && !b.hidden)) {
    filtrar(filtroUrl);
}
