// ==========================================
// MÓDULO DE FORMULARIOS
// Maneja validación y procesamiento de formularios
// ==========================================

/**
 * Precarga datos de ejemplo en el formulario
 */
function precargarDatosFormulario() {
    const formContacto = document.getElementById('form-contacto');

    if (formContacto) {
        const datosEjemplo = {
            nombre: 'Juan Pérez',
            email: 'juan.perez@ejemplo.com',
            telefono: '1145678901',
            comentarios: '¡Me interesa esta configuración!'
        };

        formContacto.querySelector('#nombre').value = datosEjemplo.nombre;
        formContacto.querySelector('#email').value = datosEjemplo.email;
        formContacto.querySelector('#telefono').value = datosEjemplo.telefono;
        formContacto.querySelector('#comentarios').value = datosEjemplo.comentarios;
    }
}

/**
 * Valida los datos del formulario
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Resultado de validación
 */
function validarFormulario(formData) {
    const errores = [];

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 3) {
        errores.push('El nombre debe tener al menos 3 caracteres');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errores.push('El email no es válido');
    }

    // Validar teléfono (opcional pero si existe debe ser válido)
    if (formData.telefono) {
        const telefonoRegex = /^[0-9]{10,15}$/;
        if (!telefonoRegex.test(formData.telefono.replace(/\s/g, ''))) {
            errores.push('El teléfono debe tener entre 10 y 15 dígitos');
        }
    }

    return {
        valido: errores.length === 0,
        errores: errores
    };
}

/**
 * Procesa el envío de la cotización
 * @param {Object} datos - Datos del formulario y cotización
 */
async function enviarCotizacion(datos) {
    try {
        // Validar formulario
        const validacion = validarFormulario(datos.formulario);

        if (!validacion.valido) {
            await Swal.fire({
                icon: 'error',
                title: 'Errores en el formulario',
                html: validacion.errores.map(err => `• ${err}`).join('<br>'),
                confirmButtonColor: '#6366f1'
            });
            return false;
        }

        // Validar que haya una configuración
        if (!datos.cotizacion || datos.cotizacion.numComponentes === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Sin componentes',
                text: 'Debes seleccionar al menos un componente para enviar la cotización',
                confirmButtonColor: '#6366f1'
            });
            return false;
        }

        // Simular envío (en un caso real, aquí iría un fetch a un servidor)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mostrar confirmación
        const result = await Swal.fire({
            icon: 'success',
            title: '¡Cotización enviada!',
            html: `
                <p>Hemos recibido tu cotización, <strong>${datos.formulario.nombre}</strong>.</p>
                <p>Te contactaremos a <strong>${datos.formulario.email}</strong> a la brevedad.</p>
                <hr>
                <p><strong>Total:</strong> $${datos.cotizacion.precioFinal.toLocaleString('es-AR')}</p>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#6366f1',
            showCancelButton: true,
            cancelButtonText: 'Guardar cotización',
            cancelButtonColor: '#8b5cf6'
        });

        // Si el usuario clickea "Guardar cotización"
        if (result.dismiss === Swal.DismissReason.cancel) {
            await solicitarNombreCotizacion(datos.cotizacion);
        }

        return true;
    } catch (error) {
        console.error('Error al enviar cotización:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar la cotización. Por favor, intenta nuevamente.',
            confirmButtonColor: '#6366f1'
        });
        return false;
    }
}

/**
 * Solicita un nombre para guardar la cotización
 * @param {Object} cotizacion - Cotización a guardar
 */
async function solicitarNombreCotizacion(cotizacion) {
    const { value: nombre } = await Swal.fire({
        title: 'Guardar cotización',
        input: 'text',
        inputLabel: 'Nombre de la configuración',
        inputPlaceholder: 'Ej: PC Gaming 2026',
        inputValue: `Configuración ${new Date().toLocaleDateString('es-AR')}`,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        confirmButtonColor: '#6366f1',
        inputValidator: (value) => {
            if (!value || value.trim().length < 3) {
                return 'El nombre debe tener al menos 3 caracteres';
            }
        }
    });

    if (nombre) {
        const guardado = guardarCotizacion(nombre, cotizacion);

        if (guardado) {
            await Swal.fire({
                icon: 'success',
                title: 'Cotización guardada',
                text: `La configuración "${nombre}" se guardó correctamente`,
                timer: 2000,
                showConfirmButton: false
            });

            // Actualizar lista de cotizaciones guardadas
            mostrarCotizacionesGuardadas();
        }
    }
}
