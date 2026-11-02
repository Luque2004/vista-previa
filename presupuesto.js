const formulario = document.querySelector(".formulario");
const grupoEntrega = formulario.querySelector('fieldset.solo-catering');
const fecha = formulario.elements.fecha;

// La fecha de dentro de unos días, escrita como la quiere el input de fecha: aaaa-mm-dd
function fechaDentroDe(dias){
    const dia = new Date();                                   // hoy, con la hora de aquí
    dia.setDate(dia.getDate() + dias);                        // setDate ya pasa de mes y de año si hace falta
    const mes = String(dia.getMonth() + 1).padStart(2, '0');  // los meses empiezan en 0: enero es 0
    const numero = String(dia.getDate()).padStart(2, '0');    // 5 → "05"
    return `${dia.getFullYear()}-${mes}-${numero}`;
}

function actualizarCatering(){
    const servicio = formulario.elements.servicio.value;
    grupoEntrega.disabled = servicio !== "catering";
    // El catering, con una semana de antelación; lo demás, desde hoy (nunca una fecha pasada)
    fecha.min = servicio === "catering" ? fechaDentroDe(7) : fechaDentroDe(0);
}
// Si se llega desde una página de servicio (presupuesto.html?servicio=catering&entrega=caja), ese servicio sale ya marcado.
// Dar un valor a un grupo de radios marca el que tiene ese value; si no hay ninguno con ese value, no marca nada
const desdeLaDireccion = new URLSearchParams(location.search);
if (desdeLaDireccion.has('servicio')) formulario.elements.servicio.value = desdeLaDireccion.get('servicio');
if (desdeLaDireccion.has('entrega')) formulario.elements.entrega.value = desdeLaDireccion.get('entrega');

formulario.addEventListener('change', actualizarCatering);
actualizarCatering();   // también al cargar la página, después de marcar lo que venga en la dirección

// Teléfono: según el prefijo elegido, cuántas cifras tiene que tener el número (sin el prefijo)
const prefijo = formulario.elements.prefijo;
const telefono = formulario.elements.telefono;
const formatos = {
    '+34': { patron: '[6789]([ .\\-]?[0-9]){8}', aviso: '9 cifras, sin el prefijo, por ejemplo 605 47 03 87' },   // España
    '+591': { patron: '[2-7]([ .\\-]?[0-9]){7}', aviso: '8 cifras, sin el prefijo' },                              // Bolivia
};
const formatoGeneral = { patron: '([ .\\-]?[0-9]){4,14}', aviso: 'El número, sin el prefijo' };   // el resto de países

function actualizarTelefono(){
    const formato = formatos[prefijo.value] ?? formatoGeneral;   // ?? como en C#: si no hay formato para ese prefijo, el general
    telefono.pattern = formato.patron;
    telefono.title = formato.aviso;
}
prefijo.addEventListener('change', actualizarTelefono);
actualizarTelefono();

// Envío: con JavaScript, la petición se manda sin salir de la página y se avisa de cómo ha ido.
// Sin JavaScript, el formulario va igual a Web3Forms por su action (y se ve la página de «Success» de Web3Forms)
const estado = formulario.querySelector('.formulario-estado');
let enviando = false;

function avisar(texto, esError){
    estado.hidden = false;
    estado.textContent = texto;
    estado.classList.toggle('error', esError);
}

// El correo que le llega al cliente: en español, en orden y sin lo que se haya dejado vacío.
// Web3Forms pone cada campo con su nombre y su valor; access_key, subject, from_name, email y botcheck son suyos
// (email es el «Responder a»: por eso ese se queda con su nombre en inglés)
const servicios = { local: 'Nuestro local', foodtruck: 'Foodtruck', catering: 'Catering' };
const entregas = { bandejas: 'En bandejas', caja: 'En caja' };

// "2026-11-10" → la fecha de aquí. Con new Date("2026-11-10") sería la medianoche en UTC,
// y en Bolivia (UTC−4) saldría el día 9 (lo mismo que pasaba con toISOString)
function leerFecha(texto){
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, mes - 1, dia);   // los meses empiezan en 0
}

function prepararCorreo(){
    const campos = formulario.elements;
    const servicio = servicios[campos.servicio.value];
    const dia = leerFecha(campos.fecha.value);
    const nombre = campos.nombre.value.trim();
    const correo = {
        access_key: campos.access_key.value,
        subject: `Presupuesto: ${servicio} · ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · ${nombre}`,
        from_name: campos.from_name.value,
        'Servicio': servicio,
    };
    if (!grupoEntrega.disabled && campos.entrega.value) correo['Cómo lo quiere'] = entregas[campos.entrega.value];
    correo['Fecha'] = dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (campos.personas.value) correo['Personas'] = campos.personas.value;
    correo['Nombre'] = nombre;
    correo['Teléfono'] = `${campos.prefijo.value} ${campos.telefono.value.trim()}`;
    // wa.me quiere el número entero, solo cifras: así el cliente le escribe por WhatsApp con un toque
    correo['WhatsApp'] = 'https://wa.me/' + (campos.prefijo.value + campos.telefono.value).replace(/\D/g, '');
    if (campos.email.value) correo.email = campos.email.value;
    if (campos.mensaje.value.trim()) correo['Mensaje'] = campos.mensaje.value.trim();
    correo['Política de privacidad'] = 'Aceptada';
    if (campos.botcheck.checked) correo.botcheck = true;   // si un bot marca el campo trampa, que Web3Forms lo descarte
    return correo;
}

async function enviarFormulario(evento){
    evento.preventDefault();   // el navegador ya ha comprobado los campos obligatorios: si llega aquí, están bien
    if (enviando) return;      // un segundo clic mientras se envía no manda otra petición
    enviando = true;
    avisar('Enviando…', false);
    const datos = JSON.stringify(prepararCorreo());   // objeto → texto JSON, como en el ejemplo de Web3Forms
    try {
        // fetch es como HttpClient.PostAsync de C#: devuelve una Promise, que es la Task de JavaScript
        const respuesta = await fetch(formulario.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: datos,
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.message);   // por ejemplo, una clave que no vale
        avisar('¡Gracias! Te contestamos pronto.', false);
        formulario.reset();
        actualizarCatering();   // reset() no lanza «change»: sin esto, la fecha mínima y el formato
        actualizarTelefono();   // del teléfono se quedarían los del servicio y el país de antes
    } catch (error) {
        console.error('No se ha podido enviar el formulario:', error);
        avisar('No se ha podido enviar. Escríbenos por WhatsApp o llámanos al 605 47 03 87.', true);
    } finally {
        enviando = false;
    }
}
formulario.addEventListener('submit', enviarFormulario);