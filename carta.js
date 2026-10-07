// ===== FILTROS DE LA CARTA =====
// Este archivo solo se carga en carta.html, así que no hace falta comprobar si existen los filtros.
const filtros = document.querySelector('.filtros');
const botones = filtros.querySelectorAll('button');
const secciones = document.querySelectorAll('.carta-seccion');
const recomendados = document.querySelectorAll('.recomendados-grupo');

filtros.hidden = false;

botones.forEach((boton) => {
    boton.addEventListener('click', () => {
        const elegido = boton.dataset.filtro;

        botones.forEach((b) => b.setAttribute('aria-pressed', b === boton));

        secciones.forEach((seccion) => {
            seccion.hidden = elegido !== 'todo' && seccion.dataset.categoria !== elegido;
        });

        // Hay un grupo de recomendados por botón (también uno para "todo"): solo se ve el suyo
        recomendados.forEach((grupo) => {
            grupo.hidden = grupo.dataset.categoria !== elegido;
        });
    });
});
