// ===== MENÚ HAMBURGUESA (tablet y móvil) =====
const header = document.querySelector('header');
const botonMenu = document.querySelector('.menu-toggle');

function ponerMenu(abierto) {
    header.classList.toggle('menu-abierto', abierto);
    botonMenu.setAttribute('aria-expanded', abierto);
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
}

botonMenu.addEventListener('click', () => {
    ponerMenu(!header.classList.contains('menu-abierto'));
});

// Esc cierra el menú. Si el submenú de Servicios está abierto, esa vez solo se cierra el submenú (lo hace su bloque, más abajo)
document.addEventListener('keydown', (e) => {
    const submenuAbierto = document.querySelector('.submenu-toggle[aria-expanded="true"]');
    if (e.key === 'Escape' && header.classList.contains('menu-abierto') && !submenuAbierto) {
        ponerMenu(false);
        botonMenu.focus();
    }
});

// ===== PUNTOS DEL CARRUSEL (móvil) =====
const mosaico = document.querySelector('#mosaico');

// El mosaico solo existe en la portada: en las demás páginas querySelector da null y nos saltamos este bloque
if (mosaico) {
    const fotos = mosaico.querySelectorAll('img');
    const contenedorPuntos = document.querySelector('#puntos-mosaico');
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

    fotos.forEach((foto, i) => {
        const punto = document.createElement('button');
        punto.setAttribute('aria-label', `Ver foto ${i + 1}`);
        punto.addEventListener('click', () => {
            mosaico.scrollTo({
                left: foto.offsetLeft - fotos[0].offsetLeft,
                behavior: reducirMovimiento.matches ? 'auto' : 'smooth',   // sin animación si el sistema pide reducir movimiento
            });
        });
        contenedorPuntos.append(punto);
    });
    const puntos = contenedorPuntos.querySelectorAll('button');

    // Las medidas solo cambian si cambia el tamaño de la ventana: se guardan para no leerlas en cada scroll
    let anchoFoto;
    let scrollMaximo;
    function medir(){
        anchoFoto = fotos[1].offsetLeft - fotos[0].offsetLeft;   // foto + gap
        scrollMaximo = mosaico.scrollWidth - mosaico.clientWidth;
    }

    let marcado = -1;
    function marcarPunto(){
        let actual = Math.round(mosaico.scrollLeft / anchoFoto);
        // La última foto nunca llega a la izquierda: si el carrusel está al final, es la última
        if (mosaico.scrollLeft >= scrollMaximo - 2){
            actual = fotos.length - 1;
        }
        if (actual === marcado) return;   // sigue siendo la misma foto: no hay nada que cambiar
        marcado = actual;
        puntos.forEach((punto, i) => {
            punto.classList.toggle('activo', i === actual);
            // aria-current="" cuenta como "false": hay que ponerle "true" o quitarlo
            if (i === actual) {
                punto.setAttribute('aria-current', 'true');
            } else {
                punto.removeAttribute('aria-current');
            }
        });
    }

    medir();
    marcarPunto();
    mosaico.addEventListener('scroll', marcarPunto);
    window.addEventListener('resize', () => {
        medir();
        marcarPunto();
    });
}

// ===== SUBMENÚ DE SERVICIOS =====
const botonSubmenu = document.querySelector('.submenu-toggle');

if (botonSubmenu) {
    botonSubmenu.addEventListener('click', () => {
        const abierto = botonSubmenu.getAttribute('aria-expanded') === 'true';
        botonSubmenu.setAttribute('aria-expanded', !abierto);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.submenu')) {
            botonSubmenu.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && botonSubmenu.getAttribute('aria-expanded') === 'true') {
            botonSubmenu.setAttribute('aria-expanded', 'false');
            botonSubmenu.focus();
        }
    });
}

// ===== TOQUES EN EL MÓVIL =====
// Safari en el iPhone no aplica :active (botones que se hunden, enlaces que se aclaran) si la página no escucha los toques
document.addEventListener('touchstart', () => {}, { passive: true });
