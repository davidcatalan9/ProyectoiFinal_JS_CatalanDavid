// ==========================================
// MÓDULO DE CARGA DE DATOS
// Maneja la carga asíncrona de productos desde JSON
// Con fallback para evitar problemas de CORS con file://
// ==========================================

let productosCache = null;
let categoriasCache = null;
let descuentosCache = null;

// Datos embebidos como fallback para cuando falla fetch (protocolo file://)
const DATOS_FALLBACK = {
    "categorias": [
        { "id": "procesadores", "nombre": "Procesadores", "icono": "bi-cpu", "descripcion": "El cerebro de tu computadora" },
        { "id": "ram", "nombre": "Memoria RAM", "icono": "bi-memory", "descripcion": "Memoria de acceso rápido" },
        { "id": "almacenamiento", "nombre": "Almacenamiento", "icono": "bi-device-ssd", "descripcion": "Discos SSD y HDD" },
        { "id": "gpu", "nombre": "Tarjeta Gráfica", "icono": "bi-gpu-card", "descripcion": "Para gaming y diseño" },
        { "id": "placa", "nombre": "Placa Madre", "icono": "bi-motherboard", "descripcion": "Conecta todos los componentes" },
        { "id": "fuente", "nombre": "Fuente de Poder", "icono": "bi-lightning-charge", "descripcion": "Alimentación estable" },
        { "id": "gabinete", "nombre": "Gabinete", "icono": "bi-pc-display", "descripcion": "Carcasa y refrigeración" },
        { "id": "sistema", "nombre": "Sistema Operativo", "icono": "bi-microsoft", "descripcion": "Software base" }
    ],
    "productos": [
        { "id": "cpu-001", "nombre": "Intel Core i3-12100F", "categoria": "procesadores", "precio": 18000, "descripcion": "4 núcleos, 8 hilos, hasta 4.3 GHz", "imagen": "./img/cpu.png", "specs": { "nucleos": 4, "hilos": 8, "frecuencia": "4.3 GHz", "socket": "LGA1700" }, "gama": "basica" },
        { "id": "cpu-002", "nombre": "Intel Core i5-13400F", "categoria": "procesadores", "precio": 35000, "descripcion": "10 núcleos, 16 hilos, hasta 4.6 GHz", "imagen": "./img/cpu.png", "specs": { "nucleos": 10, "hilos": 16, "frecuencia": "4.6 GHz", "socket": "LGA1700" }, "gama": "media" },
        { "id": "cpu-003", "nombre": "Intel Core i7-13700K", "categoria": "procesadores", "precio": 65000, "descripcion": "16 núcleos, 24 hilos, hasta 5.4 GHz", "imagen": "./img/cpu.png", "specs": { "nucleos": 16, "hilos": 24, "frecuencia": "5.4 GHz", "socket": "LGA1700" }, "gama": "alta" },
        { "id": "cpu-004", "nombre": "AMD Ryzen 5 5600", "categoria": "procesadores", "precio": 28000, "descripcion": "6 núcleos, 12 hilos, hasta 4.4 GHz", "imagen": "./img/cpu.png", "specs": { "nucleos": 6, "hilos": 12, "frecuencia": "4.4 GHz", "socket": "AM4" }, "gama": "media" },
        { "id": "cpu-005", "nombre": "AMD Ryzen 7 5800X3D", "categoria": "procesadores", "precio": 58000, "descripcion": "8 núcleos, 16 hilos, 3D V-Cache", "imagen": "./img/cpu.png", "specs": { "nucleos": 8, "hilos": 16, "frecuencia": "4.5 GHz", "socket": "AM4" }, "gama": "alta" },

        { "id": "ram-001", "nombre": "Kingston 8GB DDR4 3200MHz", "categoria": "ram", "precio": 8500, "descripcion": "1x8GB DDR4, ideal para uso básico", "imagen": "./img/ram.png", "specs": { "capacidad": "8GB", "tipo": "DDR4", "velocidad": "3200MHz" }, "gama": "basica" },
        { "id": "ram-002", "nombre": "Corsair Vengeance 16GB DDR4", "categoria": "ram", "precio": 16000, "descripcion": "2x8GB DDR4 3600MHz, RGB", "imagen": "./img/ram.png", "specs": { "capacidad": "16GB", "tipo": "DDR4", "velocidad": "3600MHz" }, "gama": "media" },
        { "id": "ram-003", "nombre": "G.Skill Trident Z 32GB DDR4", "categoria": "ram", "precio": 32000, "descripcion": "2x16GB DDR4 4000MHz, RGB Premium", "imagen": "./img/ram.png", "specs": { "capacidad": "32GB", "tipo": "DDR4", "velocidad": "4000MHz" }, "gama": "alta" },
        { "id": "ram-004", "nombre": "Corsair Dominator 64GB DDR5", "categoria": "ram", "precio": 75000, "descripcion": "2x32GB DDR5 6000MHz, máximo rendimiento", "imagen": "./img/ram.png", "specs": { "capacidad": "64GB", "tipo": "DDR5", "velocidad": "6000MHz" }, "gama": "premium" },

        { "id": "ssd-001", "nombre": "Kingston A400 240GB SSD", "categoria": "almacenamiento", "precio": 7500, "descripcion": "SSD SATA 240GB, velocidad de lectura 500MB/s", "imagen": "./img/ssd.png", "specs": { "capacidad": "240GB", "tipo": "SSD SATA", "velocidad": "500MB/s" }, "gama": "basica" },
        { "id": "ssd-002", "nombre": "Samsung 970 EVO 500GB NVMe", "categoria": "almacenamiento", "precio": 15000, "descripcion": "NVMe M.2 500GB, lectura 3500MB/s", "imagen": "./img/ssd.png", "specs": { "capacidad": "500GB", "tipo": "NVMe M.2", "velocidad": "3500MB/s" }, "gama": "media" },
        { "id": "ssd-003", "nombre": "Samsung 980 PRO 1TB NVMe", "categoria": "almacenamiento", "precio": 28000, "descripcion": "NVMe M.2 Gen4 1TB, lectura 7000MB/s", "imagen": "./img/ssd.png", "specs": { "capacidad": "1TB", "tipo": "NVMe Gen4", "velocidad": "7000MB/s" }, "gama": "alta" },
        { "id": "ssd-004", "nombre": "WD Blue 2TB HDD", "categoria": "almacenamiento", "precio": 18000, "descripcion": "Disco duro 2TB 7200RPM, almacenamiento masivo", "imagen": "./img/ssd.png", "specs": { "capacidad": "2TB", "tipo": "HDD", "velocidad": "7200RPM" }, "gama": "media" },

        { "id": "gpu-001", "nombre": "NVIDIA GTX 1650", "categoria": "gpu", "precio": 45000, "descripcion": "4GB GDDR6, ideal para gaming 1080p", "imagen": "./img/gpu.png", "specs": { "memoria": "4GB GDDR6", "resolucion": "1080p", "tdp": "75W" }, "gama": "basica" },
        { "id": "gpu-002", "nombre": "NVIDIA RTX 3060", "categoria": "gpu", "precio": 95000, "descripcion": "12GB GDDR6, Ray Tracing, DLSS", "imagen": "./img/gpu.png", "specs": { "memoria": "12GB GDDR6", "resolucion": "1440p", "tdp": "170W" }, "gama": "media" },
        { "id": "gpu-003", "nombre": "NVIDIA RTX 4070", "categoria": "gpu", "precio": 180000, "descripcion": "12GB GDDR6X, Ray Tracing avanzado, DLSS 3", "imagen": "./img/gpu.png", "specs": { "memoria": "12GB GDDR6X", "resolucion": "4K", "tdp": "200W" }, "gama": "alta" },
        { "id": "gpu-004", "nombre": "AMD RX 6700 XT", "categoria": "gpu", "precio": 110000, "descripcion": "12GB GDDR6, excelente para 1440p", "imagen": "./img/gpu.png", "specs": { "memoria": "12GB GDDR6", "resolucion": "1440p", "tdp": "230W" }, "gama": "media" },

        { "id": "placa-001", "nombre": "ASUS Prime B660M", "categoria": "placa", "precio": 25000, "descripcion": "Micro ATX, Socket LGA1700, DDR4", "imagen": "./img/motherboard.png", "specs": { "socket": "LGA1700", "memoria": "DDR4", "formato": "Micro ATX" }, "gama": "basica" },
        { "id": "placa-002", "nombre": "MSI B550 Gaming Plus", "categoria": "placa", "precio": 28000, "descripcion": "ATX, Socket AM4, DDR4, PCIe 4.0", "imagen": "./img/motherboard.png", "specs": { "socket": "AM4", "memoria": "DDR4", "formato": "ATX" }, "gama": "media" },
        { "id": "placa-003", "nombre": "ASUS ROG Strix Z790", "categoria": "placa", "precio": 65000, "descripcion": "ATX, Socket LGA1700, DDR5, RGB", "imagen": "./img/motherboard.png", "specs": { "socket": "LGA1700", "memoria": "DDR5", "formato": "ATX" }, "gama": "alta" },

        { "id": "fuente-001", "nombre": "EVGA 500W 80+ Bronze", "categoria": "fuente", "precio": 12000, "descripcion": "500W, certificación 80+ Bronze", "imagen": "./img/psu.png", "specs": { "potencia": "500W", "certificacion": "80+ Bronze", "modular": "No" }, "gama": "basica" },
        { "id": "fuente-002", "nombre": "Corsair RM750 80+ Gold", "categoria": "fuente", "precio": 22000, "descripcion": "750W, certificación 80+ Gold, modular", "imagen": "./img/psu.png", "specs": { "potencia": "750W", "certificacion": "80+ Gold", "modular": "Sí" }, "gama": "media" },
        { "id": "fuente-003", "nombre": "Seasonic Prime 1000W 80+ Titanium", "categoria": "fuente", "precio": 45000, "descripcion": "1000W, certificación 80+ Titanium, completamente modular", "imagen": "./img/psu.png", "specs": { "potencia": "1000W", "certificacion": "80+ Titanium", "modular": "Total" }, "gama": "premium" },

        { "id": "gabinete-001", "nombre": "Cooler Master Q300L", "categoria": "gabinete", "precio": 15000, "descripcion": "Micro ATX, ventana acrílica", "imagen": "https://placehold.co/600x400/202020/FFF?text=Gabinete", "specs": { "tipo": "Micro ATX", "ventiladores": "1x 120mm", "rgb": "No" }, "gama": "basica" },
        { "id": "gabinete-002", "nombre": "NZXT H510", "categoria": "gabinete", "precio": 25000, "descripcion": "ATX, diseño minimalista, vidrio templado", "imagen": "https://placehold.co/600x400/202020/FFF?text=Gabinete+ATX", "specs": { "tipo": "ATX", "ventiladores": "2x 120mm", "rgb": "No" }, "gama": "media" },
        { "id": "gabinete-003", "nombre": "Corsair iCUE 5000X RGB", "categoria": "gabinete", "precio": 45000, "descripcion": "Full Tower, vidrio templado, 4 fans RGB", "imagen": "https://placehold.co/600x400/202020/FFF?text=Full+Tower+RGB", "specs": { "tipo": "Full Tower", "ventiladores": "4x 120mm RGB", "rgb": "Sí" }, "gama": "alta" },

        { "id": "so-001", "nombre": "Windows 11 Home", "categoria": "sistema", "precio": 25000, "descripcion": "Sistema operativo Windows 11 Home", "imagen": "https://placehold.co/600x400/0078D4/FFF?text=Windows+11", "specs": { "version": "Home", "tipo": "OEM" }, "gama": "basica" },
        { "id": "so-002", "nombre": "Windows 11 Pro", "categoria": "sistema", "precio": 35000, "descripcion": "Sistema operativo Windows 11 Pro", "imagen": "https://placehold.co/600x400/0078D4/FFF?text=Windows+11+Pro", "specs": { "version": "Pro", "tipo": "OEM" }, "gama": "media" },
        { "id": "so-003", "nombre": "Ubuntu 22.04 LTS", "categoria": "sistema", "precio": 0, "descripcion": "Sistema operativo Linux gratuito", "imagen": "https://placehold.co/600x400/E95420/FFF?text=Ubuntu", "specs": { "version": "22.04 LTS", "tipo": "Free" }, "gama": "basica" }
    ],
    "descuentos": [
        { "id": "desc-001", "nombre": "Descuento por volumen", "tipo": "porcentaje", "condicion": "componentes >= 6", "valor": 5, "descripcion": "5% de descuento al seleccionar 6 o más componentes" },
        { "id": "desc-002", "nombre": "Descuento PC Completa", "tipo": "porcentaje", "condicion": "componentes >= 8", "valor": 10, "descripcion": "10% de descuento al armar una PC completa (8 componentes)" },
        { "id": "desc-003", "nombre": "Promo Gamer", "tipo": "porcentaje", "condicion": "tiene_gpu_alta", "valor": 3, "descripcion": "3% adicional al incluir una GPU de gama alta" }
    ]
};

/**
 * Carga los productos desde el archivo JSON o usa fallback
 * @returns {Promise<Object>} Objeto con productos y categorías
 */
async function cargarProductos() {
    try {
        if (productosCache && categoriasCache) {
            return { productos: productosCache, categorias: categoriasCache, descuentos: descuentosCache };
        }

        // Intentar cargar desde JSON
        try {
            const response = await fetch('./data/productos.json');

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            productosCache = data.productos;
            categoriasCache = data.categorias;
            descuentosCache = data.descuentos;

            console.log('✅ Datos cargados desde JSON');
            return { productos: data.productos, categorias: data.categorias, descuentos: data.descuentos };
        } catch (fetchError) {
            // Si falla fetch (ej: protocolo file://), usar datos embebidos
            console.warn('⚠️ No se pudo cargar JSON, usando datos embebidos:', fetchError.message);

            productosCache = DATOS_FALLBACK.productos;
            categoriasCache = DATOS_FALLBACK.categorias;
            descuentosCache = DATOS_FALLBACK.descuentos;

            console.log('✅ Datos cargados desde fallback embebido');
            return {
                productos: DATOS_FALLBACK.productos,
                categorias: DATOS_FALLBACK.categorias,
                descuentos: DATOS_FALLBACK.descuentos
            };
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'No se pudieron cargar los productos. Por favor, recarga la página.',
                confirmButtonColor: '#6366f1'
            });
        } else {
            alert('Error crítico: No se pudieron cargar los productos y las alertas no funcionan.');
        }
        throw error;
    }
}

/**
 * Filtra productos por categoría
 * @param {string} categoria - ID de la categoría
 * @returns {Array} Array de productos filtrados
 */
function filtrarPorCategoria(categoria) {
    if (!productosCache) {
        console.error('Productos no cargados');
        return [];
    }

    return productosCache.filter(producto => producto.categoria === categoria);
}

/**
 * Busca un producto por su ID
 * @param {string} id - ID del producto
 * @returns {Object|null} Producto encontrado o null
 */
function buscarProductoPorId(id) {
    if (!productosCache) {
        console.error('Productos no cargados');
        return null;
    }

    return productosCache.find(producto => producto.id === id);
}

/**
 * Obtiene información de una categoría
 * @param {string} categoriaId - ID de la categoría
 * @returns {Object|null} Categoría encontrada o null
 */
function obtenerCategoria(categoriaId) {
    if (!categoriasCache) {
        console.error('Categorías no cargadas');
        return null;
    }

    return categoriasCache.find(cat => cat.id === categoriaId);
}

/**
 * Obtiene todas las categorías
 * @returns {Array} Array de categorías
 */
function obtenerCategorias() {
    return categoriasCache || [];
}
