

class Cotizador {
    constructor() {
        this.configuracion = {};
        this.precioBase = 0;
        this.descuento = 0;
        this.precioFinal = 0;
        this.descuentosAplicados = [];
    }


    agregarComponente(producto) {
        this.configuracion[producto.categoria] = producto;
        this.calcularPrecio();
    }


    removerComponente(categoria) {
        delete this.configuracion[categoria];
        this.calcularPrecio();
    }


    calcularPrecio() {
        this.precioBase = 0;

        for (const categoria in this.configuracion) {
            this.precioBase += this.configuracion[categoria].precio;
        }

        this.aplicarDescuentos();
        this.precioFinal = this.precioBase - (this.precioBase * this.descuento / 100);
    }


    aplicarDescuentos() {
        this.descuento = 0;
        this.descuentosAplicados = [];

        const numComponentes = Object.keys(this.configuracion).length;


        if (numComponentes >= 6) {
            this.descuento += 5;
            this.descuentosAplicados.push({
                nombre: 'Descuento por volumen',
                valor: 5,
                descripcion: '6+ componentes'
            });
        }


        if (numComponentes >= 8) {
            this.descuento += 5;
            this.descuentosAplicados.push({
                nombre: 'PC Completa',
                valor: 5,
                descripcion: 'Configuración completa'
            });
        }


        if (this.configuracion.gpu && (this.configuracion.gpu.gama === 'alta' || this.configuracion.gpu.gama === 'premium')) {
            this.descuento += 3;
            this.descuentosAplicados.push({
                nombre: 'Promo Gamer',
                valor: 3,
                descripcion: 'GPU de alta gama'
            });
        }
    }


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


    limpiar() {
        this.configuracion = {};
        this.precioBase = 0;
        this.descuento = 0;
        this.precioFinal = 0;
        this.descuentosAplicados = [];
    }


    cargarConfiguracion(config) {
        this.configuracion = { ...config };
        this.calcularPrecio();
    }
}
