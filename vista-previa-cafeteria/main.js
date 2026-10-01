// ===== MENÚ HAMBURGUESA (tablet y móvil) =====
// Pone o quita .menu-abierto en el <header>; el CSS enseña u oculta el menú según esa clase.
const header = document.querySelector('header');
const botonMenu = document.querySelector('.menu-toggle');

botonMenu.addEventListener('click', () => {
    const abierto = header.classList.toggle('menu-abierto');

    // Para los lectores de pantalla: dicen si el menú está abierto o cerrado
    botonMenu.setAttribute('aria-expanded', abierto);
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
});

// ===== PUNTOS DEL CARRUSEL (móvil) =====
const mosaico = document.querySelector('#mosaico');
const fotos = mosaico.querySelectorAll('img');
const contenedorPuntos = document.querySelector('#puntos-mosaico');

// Un punto por foto; al pulsarlo, el carrusel se desplaza hasta esa foto
fotos.forEach((foto, i) => {
    const punto = document.createElement('button');
    punto.setAttribute('aria-label', `Ver foto ${i + 1}`);
    punto.addEventListener('click', () => {
        mosaico.scrollTo({ left: foto.offsetLeft - fotos[0].offsetLeft, behavior: 'smooth' });
    });
    contenedorPuntos.append(punto);
});
const puntos = contenedorPuntos.querySelectorAll('button');

function marcarPunto(){
    const anchoFoto = fotos[1].offsetLeft - fotos[0].offsetLeft;   // foto + gap
    let actual = Math.round(mosaico.scrollLeft / anchoFoto);
    // La última foto nunca llega a la izquierda: si el carrusel está al final, es la última
    if (mosaico.scrollLeft + mosaico.clientWidth >= mosaico.scrollWidth - 2){
        actual = fotos.length - 1;
    }
    puntos.forEach((punto, i) => {
        punto.classList.toggle('activo', i === actual);
        punto.toggleAttribute('aria-current', i === actual);
    });
}
mosaico.addEventListener('scroll', marcarPunto);
marcarPunto();
