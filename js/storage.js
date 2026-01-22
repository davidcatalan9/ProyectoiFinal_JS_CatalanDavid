// ==========================================
// MÓDULO DE PERSISTENCIA
// Maneja el guardado y recuperación de datos en LocalStorage
// ==========================================

const STORAGE_KEY_COTIZACIONES = 'cotizaciones_guardadas';
const STORAGE_KEY_ULTIMA = 'ultima_configuracion';

/**
 * Guarda una cotización en LocalStorage
 * @param {string} nombre - Nombre de la cotización
 * @param {Object} cotizacion - Objeto de cotización a guardar
 * @returns {boolean} True si se guardó correctamente
 */
function guardarCotizacion(nombre, cotizacion) {
    try {
        const cotizaciones = cargarCotizaciones();

        const nuevaCotizacion = {
            id: Date.now(),
            nombre: nombre,
            fecha: new Date().toISOString(),
            ...cotizacion
        };

        cotizaciones.push(nuevaCotizacion);
        localStorage.setItem(STORAGE_KEY_COTIZACIONES, JSON.stringify(cotizaciones));

        return true;
    } catch (error) {
        console.error('Error al guardar cotización:', error);
        return false;
    }
}

/**
 * Carga todas las cotizaciones guardadas
 * @returns {Array} Array de cotizaciones
 */
function cargarCotizaciones() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_COTIZACIONES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
        return [];
    }
}

/**
 * Elimina una cotización específica
 * @param {number} id - ID de la cotización a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
function eliminarCotizacion(id) {
    try {
        let cotizaciones = cargarCotizaciones();
        cotizaciones = cotizaciones.filter(cot => cot.id !== id);
        localStorage.setItem(STORAGE_KEY_COTIZACIONES, JSON.stringify(cotizaciones));
        return true;
    } catch (error) {
        console.error('Error al eliminar cotización:', error);
        return false;
    }
}

/**
 * Guarda la última configuración trabajada
 * @param {Object} configuracion - Configuración a guardar
 */
function guardarUltimaConfiguracion(configuracion) {
    try {
        localStorage.setItem(STORAGE_KEY_ULTIMA, JSON.stringify(configuracion));
    } catch (error) {
        console.error('Error al guardar última configuración:', error);
    }
}

/**
 * Recupera la última configuración trabajada
 * @returns {Object|null} Configuración o null
 */
function cargarUltimaConfiguracion() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_ULTIMA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error al cargar última configuración:', error);
        return null;
    }
}

/**
 * Exporta una cotización como archivo JSON
 * @param {Object} cotizacion - Cotización a exportar
 * @param {string} nombre - Nombre del archivo
 */
function exportarCotizacion(cotizacion, nombre) {
    try {
        const dataStr = JSON.stringify(cotizacion, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cotizacion_${nombre}_${Date.now()}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al exportar cotización:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al exportar',
            text: 'No se pudo exportar la cotización',
            confirmButtonColor: '#6366f1'
        });
    }
}

/**
 * Limpia todas las cotizaciones guardadas
 */
function limpiarTodasLasCotizaciones() {
    try {
        localStorage.removeItem(STORAGE_KEY_COTIZACIONES);
        localStorage.removeItem(STORAGE_KEY_ULTIMA);
    } catch (error) {
        console.error('Error al limpiar cotizaciones:', error);
    }
}
