
    let tickets = [];
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
        // Actualizar la vista
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
    function mostrarTickets() {
        const contenedor = document.getElementById('listaTickets');
        contenedor.innerHTML = ''; // Limpiar el contenedor antes de dibujar
        // Recorrer el arreglo y crear los elementos HTML
        tickets.forEach(ticket => {
            const div = document.createElement('div');
            
            // Asignar clases dinamicas segun prioridad y estado
            const claseEstado = ticket.estado === 'Cerrado' ? 'cerrado' : '';
            div.className = `ticket ${ticket.prioridad} ${claseEstado}`;
            
            // Generar el contenido del ticket
            div.innerHTML = `
                <h3 style="margin-top: 0;"><strong>Titulo:</strong> ${ticket.titulo} <small>(${ticket.estado})</small></h3>
                <p><strong>Nombre_Consultante:</strong> ${ticket.Nombre_Usuario}</p>
                <p><strong>Descripcion:</strong> ${ticket.descripcion}</p>
                <p><strong>Prioridad:</strong> ${ticket.prioridad.toUpperCase()}</p>
                <p><strong>Hora:</strong> ${ticket.id}</p> 
                ${ticket.estado === 'Abierto' ? `<button class="btn-cerrar" onclick="cerrarTicket(${ticket.id})">Marcar como Cerrado</button>` : ''}
            `;
            
            // Agregar el ticket a la lista en pantalla
            contenedor.appendChild(div);
        });
    }



function guardarEnGoogleSheets(ticket) {
    const url = 'https://script.google.com/macros/s/AKfycbzJcf45t-3ZylHCMz-yM_J3UDt_3KDwimbW9kZFVkh_vauEMg0AgDMKX82isvYx608S/exec'; // Asegurate de que termine en /exec

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