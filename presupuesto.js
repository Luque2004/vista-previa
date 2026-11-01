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