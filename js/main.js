// ==========================================
// ARCHIVO PRINCIPAL
// Orquesta la aplicación y maneja eventos globales
// ==========================================

let cotizadorActual = null;

/**
 * Inicializa la aplicación
 */
async function inicializarApp() {
    try {
        // Mostrar loader
        mostrarLoader(true);

        // Crear instancia del cotizador
        cotizadorActual = new Cotizador();

        // Cargar datos
        await cargarProductos();

        // Renderizar categorías
        renderizarCategorias();

        // Cargar última configuración si existe
        const ultimaConfig = cargarUltimaConfiguracion();
        if (ultimaConfig && Object.keys(ultimaConfig).length > 0) {
            const resultado = await Swal.fire({
                icon: 'question',
                title: '¿Continuar con la última configuración?',
                text: 'Detectamos que dejaste una configuración sin terminar',
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Empezar de nuevo',
                confirmButtonColor: '#6366f1',
                cancelButtonColor: '#6b7280'
            });

            if (resultado.isConfirmed) {
                cotizadorActual.cargarConfiguracion(ultimaConfig);
                actualizarResumen();
            }
        }

        // Configurar event listeners
        configurarEventListeners();

        // Ocultar loader
        mostrarLoader(false);

        // Mostrar mensaje de bienvenida
        mostrarMensajeBienvenida();

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        mostrarLoader(false);
    }
}

/**
 * Configura todos los event listeners de la aplicación
 */
function configurarEventListeners() {
    // Botón de limpiar configuración
    const btnLimpiar = document.getElementById('btn-limpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarConfiguracion);
    }

    // Botón de enviar cotización
    const btnEnviar = document.getElementById('btn-enviar');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', mostrarModalConfirmacion);
    }

    // Botón de guardar cotización
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

    // Botón de ver cotizaciones guardadas
    const btnVerGuardadas = document.getElementById('btn-ver-guardadas');
    if (btnVerGuardadas) {
        btnVerGuardadas.addEventListener('click', mostrarCotizacionesGuardadas);
    }

    // Botón de comparar
    const btnComparar = document.getElementById('btn-comparar');
    if (btnComparar) {
        btnComparar.addEventListener('click', mostrarComparacion);
    }

    // Guardar configuración antes de salir
    window.addEventListener('beforeunload', () => {
        if (cotizadorActual && Object.keys(cotizadorActual.configuracion).length > 0) {
            guardarUltimaConfiguracion(cotizadorActual.configuracion);
        }
    });
}

/**
 * Agrega un producto al cotizador
 * @param {string} productoId - ID del producto
 */
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

    // Verificar si ya hay un componente de esa categoría
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

                // Volver a renderizar los productos de esta categoría para actualizar el estado
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

        // Volver a renderizar los productos de esta categoría
        const categoria = obtenerCategoria(producto.categoria);
        const productos = filtrarPorCategoria(producto.categoria);
        renderizarProductos(categoria, productos);

        // Efecto visual
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

/**
 * Remueve un componente del cotizador
 * @param {string} categoria - Categoría del componente
 */
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

            // Si la sección de productos muestra esta categoría, actualizar
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

/**
 * Limpia toda la configuración actual
 */
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

            // Ocultar sección de productos
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

/**
 * Carga una cotización guardada
 * @param {number} id - ID de la cotización
 */
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

            // Cerrar el modal de cotizaciones guardadas
            Swal.close();

            Swal.fire({
                icon: 'success',
                title: 'Configuración cargada',
                text: `Se cargó la configuración "${cotizacion.nombre}"`,
                timer: 2000,
                showConfirmButton: false
            });

            // Scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

/**
 * Elimina una cotización guardada
 * @param {number} id - ID de la cotización
 */
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
                // Actualizar la lista
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

/**
 * Muestra/oculta el loader
 * @param {boolean} mostrar - True para mostrar, false para ocultar
 */
function mostrarLoader(mostrar) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = mostrar ? 'flex' : 'none';
    }
}

/**
 * Muestra mensaje de bienvenida
 */
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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);
