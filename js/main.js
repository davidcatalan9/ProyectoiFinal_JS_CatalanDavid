

let cotizadorActual = null;


async function inicializarApp() {
    try {

        mostrarLoader(true);


        if (typeof Swal === 'undefined') {
            console.error('SweetAlert2 no está cargado');
            alert('Error: No se pudo cargar una dependencia necesaria (SweetAlert2). Por favor, verifica tu conexión a internet.');
        }


        cotizadorActual = new Cotizador();


        console.log('Iniciando carga de productos...');
        await cargarProductos();
        console.log('Productos cargados correctamente');


        renderizarCategorias();


        configurarEventListeners();


        console.log('Carga completada, ocultando loader');
        mostrarLoader(false);


        const ultimaConfig = cargarUltimaConfiguracion();
        if (ultimaConfig && Object.keys(ultimaConfig).length > 0 && typeof Swal !== 'undefined') {
            try {
                const resultado = await Swal.fire({
                    icon: 'question',
                    title: '¿Continuar con la última configuración?',
                    text: 'Detectamos que dejaste una configuración sin terminar',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'Empezar de nuevo',
                    confirmButtonColor: '#6366f1',
                    cancelButtonColor: '#6b7280',
                    allowOutsideClick: false
                });

                if (resultado.isConfirmed) {
                    cotizadorActual.cargarConfiguracion(ultimaConfig);
                    actualizarResumen();
                }
            } catch (swalError) {
                console.error('Error al mostrar alerta de configuración previa:', swalError);
            }
        }


        if (typeof Swal !== 'undefined') {
            mostrarMensajeBienvenida();
        }

    } catch (error) {
        console.error('Error crítico al inicializar la aplicación:', error);
        alert('Ocurrió un error al cargar la aplicación. Revisa la consola para más detalles.');
    } finally {

        console.log('Finalizando inicialización, ocultando loader');
        mostrarLoader(false);
    }
}


function configurarEventListeners() {

    const btnLimpiar = document.getElementById('btn-limpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarConfiguracion);
    }


    const btnEnviar = document.getElementById('btn-enviar');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', mostrarModalConfirmacion);
    }


    const btnGuardar = document.getElementById('btn-guardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {
            if (cotizadorActual.obtenerResumen().numComponentes === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin componentes',
                    text: 'Debes seleccionar al menos un componente para guardar',
                    confirmButtonColor: '#6366f1'
                });
                return;
            }
            await solicitarNombreCotizacion(cotizadorActual.obtenerResumen());
        });
    }


    const btnVerGuardadas = document.getElementById('btn-ver-guardadas');
    if (btnVerGuardadas) {
        btnVerGuardadas.addEventListener('click', mostrarCotizacionesGuardadas);
    }


    const btnComparar = document.getElementById('btn-comparar');
    if (btnComparar) {
        btnComparar.addEventListener('click', mostrarComparacion);
    }


    window.addEventListener('beforeunload', () => {
        if (cotizadorActual && Object.keys(cotizadorActual.configuracion).length > 0) {
            guardarUltimaConfiguracion(cotizadorActual.configuracion);
        }
    });
}


function agregarAlCotizador(productoId) {
    const producto = buscarProductoPorId(productoId);

    if (!producto) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Producto no encontrado',
            confirmButtonColor: '#6366f1'
        });
        return;
    }


    const componenteExistente = cotizadorActual.configuracion[producto.categoria];

    if (componenteExistente) {
        Swal.fire({
            icon: 'question',
            title: '¿Reemplazar componente?',
            html: `Ya tienes seleccionado:<br><strong>${componenteExistente.nombre}</strong><br><br>¿Deseas reemplazarlo por:<br><strong>${producto.nombre}</strong>?`,
            showCancelButton: true,
            confirmButtonText: 'Sí, reemplazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        }).then((result) => {
            if (result.isConfirmed) {
                cotizadorActual.agregarComponente(producto);
                actualizarResumen();


                const categoria = obtenerCategoria(producto.categoria);
                const productos = filtrarPorCategoria(producto.categoria);
                renderizarProductos(categoria, productos);

                Swal.fire({
                    icon: 'success',
                    title: 'Componente reemplazado',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    } else {
        cotizadorActual.agregarComponente(producto);
        actualizarResumen();


        const categoria = obtenerCategoria(producto.categoria);
        const productos = filtrarPorCategoria(producto.categoria);
        renderizarProductos(categoria, productos);


        Swal.fire({
            icon: 'success',
            title: 'Componente agregado',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}


function removerDelCotizador(categoria) {
    const producto = cotizadorActual.configuracion[categoria];

    if (!producto) return;

    Swal.fire({
        icon: 'warning',
        title: '¿Eliminar componente?',
        text: `¿Deseas eliminar ${producto.nombre}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
    }).then((result) => {
        if (result.isConfirmed) {
            cotizadorActual.removerComponente(categoria);
            actualizarResumen();


            const productosTitulo = document.getElementById('productos-titulo');
            if (productosTitulo && productosTitulo.textContent.includes(obtenerCategoria(categoria)?.nombre)) {
                const cat = obtenerCategoria(categoria);
                const productos = filtrarPorCategoria(categoria);
                renderizarProductos(cat, productos);
            }

            Swal.fire({
                icon: 'success',
                title: 'Componente eliminado',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}


function limpiarConfiguracion() {
    if (Object.keys(cotizadorActual.configuracion).length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin componentes',
            text: 'No hay componentes para limpiar',
            confirmButtonColor: '#6366f1'
        });
        return;
    }

    Swal.fire({
        icon: 'warning',
        title: '¿Limpiar todo?',
        text: 'Se eliminarán todos los componentes seleccionados',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
    }).then((result) => {
        if (result.isConfirmed) {
            cotizadorActual.limpiar();
            actualizarResumen();


            document.getElementById('productos-section').style.display = 'none';

            Swal.fire({
                icon: 'success',
                title: 'Configuración limpiada',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}


function cargarCotizacionGuardada(id) {
    const cotizaciones = cargarCotizaciones();
    const cotizacion = cotizaciones.find(cot => cot.id === id);

    if (!cotizacion) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Cotización no encontrada',
            confirmButtonColor: '#6366f1'
        });
        return;
    }

    Swal.fire({
        icon: 'question',
        title: '¿Cargar esta configuración?',
        text: 'La configuración actual se reemplazará',
        showCancelButton: true,
        confirmButtonText: 'Sí, cargar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280'
    }).then((result) => {
        if (result.isConfirmed) {
            cotizadorActual.cargarConfiguracion(cotizacion.configuracion);
            actualizarResumen();


            Swal.close();

            Swal.fire({
                icon: 'success',
                title: 'Configuración cargada',
                text: `Se cargó la configuración "${cotizacion.nombre}"`,
                timer: 2000,
                showConfirmButton: false
            });


            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}


function eliminarCotizacionGuardada(id) {
    Swal.fire({
        icon: 'warning',
        title: '¿Eliminar cotización?',
        text: 'Esta acción no se puede deshacer',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
    }).then((result) => {
        if (result.isConfirmed) {
            const eliminado = eliminarCotizacion(id);

            if (eliminado) {

                mostrarCotizacionesGuardadas();

                Swal.fire({
                    icon: 'success',
                    title: 'Cotización eliminada',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    });
}


function mostrarLoader(mostrar) {
    const loader = document.getElementById('loader');
    if (loader) {
        if (mostrar) {
            loader.classList.remove('d-none');
            loader.classList.add('d-flex');
        } else {
            loader.classList.remove('d-flex');
            loader.classList.add('d-none');
        }
    }
}


function mostrarMensajeBienvenida() {
    const yaVisto = sessionStorage.getItem('bienvenida_vista');

    if (!yaVisto) {
        Swal.fire({
            icon: 'info',
            title: '¡Bienvenido al Cotizador!',
            html: `
                <p>Arma tu computadora ideal seleccionando componentes.</p>
                <p>Obtén descuentos automáticos y guarda tus configuraciones.</p>
            `,
            confirmButtonText: 'Comenzar',
            confirmButtonColor: '#6366f1'
        });

        sessionStorage.setItem('bienvenida_vista', 'true');
    }
}


document.addEventListener('DOMContentLoaded', inicializarApp);
