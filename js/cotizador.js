// ==========================================
// CLASE COTIZADOR
// Lógica de negocio principal para el cotizador
// ==========================================

class Cotizador {
    constructor() {
        this.configuracion = {};
        this.precioBase = 0;
        this.descuento = 0;
        this.precioFinal = 0;
        this.descuentosAplicados = [];
    }

    /**
     * Agrega un componente a la configuración
     * @param {Object} producto - Producto a agregar
     */
    agregarComponente(producto) {
        this.configuracion[producto.categoria] = producto;
        this.calcularPrecio();
    }

    /**
     * Remueve un componente de la configuración
     * @param {string} categoria - Categoría del componente a remover
     */
    removerComponente(categoria) {
        delete this.configuracion[categoria];
        this.calcularPrecio();
    }

    /**
     * Calcula el precio total con descuentos
     */
    calcularPrecio() {
        this.precioBase = 0;

        for (const categoria in this.configuracion) {
            this.precioBase += this.configuracion[categoria].precio;
        }

        this.aplicarDescuentos();
        this.precioFinal = this.precioBase - (this.precioBase * this.descuento / 100);
    }

    /**
     * Aplica descuentos según las reglas de negocio
     */
    aplicarDescuentos() {
        this.descuento = 0;
        this.descuentosAplicados = [];

        const numComponentes = Object.keys(this.configuracion).length;

        // Descuento por volumen (5% con 6+ componentes)
        if (numComponentes >= 6) {
            this.descuento += 5;
            this.descuentosAplicados.push({
                nombre: 'Descuento por volumen',
                valor: 5,
                descripcion: '6+ componentes'
            });
        }

        // Descuento PC completa (10% con 8 componentes)
        if (numComponentes >= 8) {
            this.descuento += 5; // 5% adicional (total 10%)
            this.descuentosAplicados.push({
                nombre: 'PC Completa',
                valor: 5,
                descripcion: 'Configuración completa'
            });
        }

        // Descuento gamer (3% con GPU de gama alta)
        if (this.configuracion.gpu && (this.configuracion.gpu.gama === 'alta' || this.configuracion.gpu.gama === 'premium')) {
            this.descuento += 3;
            this.descuentosAplicados.push({
                nombre: 'Promo Gamer',
                valor: 3,
                descripcion: 'GPU de alta gama'
            });
        }
    }

    /**
     * Valida que la configuración esté completa
     * @returns {Object} Objeto con estado de validación y mensajes
     */
    validarConfiguracion() {
        const categoriasRequeridas = ['procesadores', 'ram', 'almacenamiento', 'placa', 'fuente'];
        const categoriasFaltantes = [];

        for (const categoria of categoriasRequeridas) {
            if (!this.configuracion[categoria]) {
                categoriasFaltantes.push(categoria);
            }
        }

        return {
            valida: categoriasFaltantes.length === 0,
            categoriasFaltantes: categoriasFaltantes,
            mensaje: categoriasFaltantes.length === 0
                ? 'Configuración válida'
                : `Faltan componentes: ${categoriasFaltantes.join(', ')}`
        };
    }

    /**
     * Obtiene un resumen de la cotización
     * @returns {Object} Objeto con resumen completo
     */
    obtenerResumen() {
        return {
            configuracion: { ...this.configuracion },
            precioBase: this.precioBase,
            descuento: this.descuento,
            precioFinal: this.precioFinal,
            descuentosAplicados: [...this.descuentosAplicados],
            fecha: new Date().toLocaleDateString('es-AR'),
            numComponentes: Object.keys(this.configuracion).length
        };
    }

    /**
     * Limpia la configuración actual
     */
    limpiar() {
        this.configuracion = {};
        this.precioBase = 0;
        this.descuento = 0;
        this.precioFinal = 0;
        this.descuentosAplicados = [];
    }

    /**
     * Carga una configuración desde un objeto
     * @param {Object} config - Configuración a cargar
     */
    cargarConfiguracion(config) {
        this.configuracion = { ...config };
        this.calcularPrecio();
    }
}
