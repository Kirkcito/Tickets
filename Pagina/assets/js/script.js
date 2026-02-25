const url = 'https://script.google.com/macros/s/AKfycbyHa-4GugZb_CJeZFcrFj7Yy7fznOoWJrPdTKFCDAtjGy1MobQsAAYA9PBQRFc0N15u/exec';

let tickets = [];

window.onload = function(){
    ObtenerTickets();
};

function crearTicket() {
    const titulo = document.getElementById('titulo').value;
    const Nombre_Consultante = document.getElementById('Nombre-Consultante').value;
    const descripcion = document.getElementById('descripcion').value;
    const prioridad = document.getElementById('prioridad').value;
    // Validacion basica
    if (!titulo || !Nombre_Consultante ||!descripcion) {
        alert('Por favor, completa el titulo, el nombre del consultante o la descripcion.');
        return;
    }
    // Crear el objeto ticket
    const ticket = {
        id: Date.now(), // Usamos la fecha actual como ID unico
        titulo: titulo,
        Nombre_Usuario : Nombre_Consultante,
        descripcion: descripcion,
        prioridad: prioridad,
        estado: 'Abierto'
    };
    // Agregar al arreglo
    tickets.push(ticket);
    guardarEnGoogleSheets(ticket);
    
    // Limpiar los campos del formulario
    document.getElementById('titulo').value = '';
    document.getElementById('Nombre-Consultante').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('prioridad').value = 'baja';
    // Actualizar la vista localmente
    mostrarTickets();
}

function cerrarTicket(id) {
    // Buscar el ticket por su ID
    const indice = tickets.findIndex(t => t.id === id);
    if (indice !== -1) {
        // Cambiar el estado
        tickets[indice].estado = 'Cerrado';
        mostrarTickets();
    }
}
 
/*Usaremos el async, trabajaremos con una funcion que demorara tiempo al pedirle datos al sv
permitiendonos usar el await para esperar su respuesta.*/
async function ObtenerTickets()
{
    try{
        let response = await fetch(url);   
        let ticketServidor = await response.json();

        console.log("Tickets recibidos:  ",ticketServidor);

        //CARGAMOS LOS DATOS DEL EXCEL A NUESTRO TICKET LOCAL
        //FORMATEANDOLO CON LOS DATOS QUE QUEREMOS.
        tickets = ticketServidor.map(t => ({
            id: t['ID'] || Date.now(),
            titulo: t['Titulo'] || 'Sin título',
            Nombre_Usuario: t['Consultante'] || 'Anónimo',
            descripcion: t['Descripcion'] || 'Sin descripción',
            prioridad: (t['Prioridad'] || 'baja').toLowerCase(),
            estado: t['Estado'] || 'Abierto'
        }))

        mostrarTickets();
    }
    catch(error){
        console.error("Error obtenido al intentar obtener los tickets: ",error);
    }
}

function mostrarTickets() {
    const contenedor = document.getElementById('listaTickets');
    contenedor.innerHTML = ''; // Limpiar el contenedor antes de dibujar
    // Recorrer el arreglo y crear los elementos HTML

    if(tickets.length === 0)
        {
            contenedor.innerHTML = '<p>No se encontraron Tickets</p>'
            return;
        }

    tickets.forEach(ticket => {
        const div = document.createElement('div');
        
        // Asignar clases dinamicas segun prioridad y estado
        const claseEstado = ticket.estado === 'Cerrado' ? 'cerrado' : '';
        div.className = `ticket ${ticket.prioridad} ${claseEstado}`;
        
        // Generar el contenido del ticket
        div.innerHTML = `
            <h3 style="margin-top: 0;">
                <strong>Titulo:</strong> ${ticket.titulo} 
                <small>(${ticket.estado})</small></h3>
            <p>
                <strong>Nombre_Consultante:</strong> 
                ${ticket.Nombre_Usuario}
                </p>
            <p>
                <strong>Descripcion:</strong> 
                ${ticket.descripcion}
                </p>
            <p>
                <strong>Prioridad:</strong> 
                ${ticket.prioridad.toUpperCase()}
                </p>
            <p>
                <strong>Hora:</strong> 
                ${new Date(Number(ticket.id)).toLocaleString()}
                </p> 
            ${ticket.estado === 'Abierto' 
                ? `<button class="btn-cerrar" onclick="cerrarTicket(${ticket.id})">Marcar como Cerrado</button>` 
                : ''}
            `;
        
        // Agregar el ticket a la lista en pantalla
        contenedor.appendChild(div);
    });  
}

function guardarEnGoogleSheets(ticket) {
    
    console.log('Intentando enviar:', ticket);

    // Usamos el metodo tradicional para evitar bloqueos de CORS complejos
    fetch(url, {
        method: 'POST',
        mode: 'no-cors', // Esto evita el error de red inmediato
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket)
    })
    .then(() => {
        // Con no-cors no podemos leer el JSON de respuesta, 
        // pero si llega aqui es que se envio correctamente.
        console.log('Peticion enviada a Google Sheets');
    })
    .catch(error => {
        console.error('Error critico:', error);
        alert('Error de conexion: ' + error.message);
    });
}