// ==========================================
// MÓDULO DE INTERFAZ DE USUARIO
// Genera y actualiza elementos del DOM dinámicamente
// Compatible con Bootstrap 5
// ==========================================

/**
 * Renderiza las categorías de productos usando Bootstrap 5
 */
function renderizarCategorias() {
    const container = document.getElementById('categorias-container');
    if (!container) return;

    const categorias = obtenerCategorias();
    container.innerHTML = '';

    categorias.forEach(categoria => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="categoria-card h-100">
                <span class="categoria-icono">
                    ${categoria.icono.startsWith('bi-') ? `<i class="bi ${categoria.icono}"></i>` : categoria.icono}
                </span>
                <h3 class="h5 text-white mb-2">${categoria.nombre}</h3>
                <p class="text-secondary small mb-3">${categoria.descripcion}</p>
                <button class="btn btn-primary btn-sm" onclick="mostrarProductosCategoria('${categoria.id}')">
                    <i class="bi bi-box-seam me-1"></i> Ver componentes
                </button>
            </div>
        `;
        container.appendChild(col);
    });
}

/**
 * Muestra los productos de una categoría específica
 * @param {string} categoriaId - ID de la categoría
 */
function mostrarProductosCategoria(categoriaId) {
    const productos = filtrarPorCategoria(categoriaId);
    const categoria = obtenerCategoria(categoriaId);

    if (!productos || productos.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin productos',
            text: 'No hay productos disponibles en esta categoría',
            confirmButtonColor: '#6366f1'
        });
        return;
    }

    renderizarProductos(categoria, productos);

    // Scroll suave a la sección de productos
    document.getElementById('productos-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Renderiza un grid de productos con Bootstrap 5
 * @param {Object} categoria - Categoría actual
 * @param {Array} productos - Array de productos a mostrar
 */
function renderizarProductos(categoria, productos) {
    const container = document.getElementById('productos-grid');
    const titulo = document.getElementById('productos-titulo');

    if (!container || !titulo) return;

    titulo.textContent = `${categoria.icono} ${categoria.nombre}`;
    container.innerHTML = '';

    productos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col';

        // Determinar si ya está agregado
        const yaAgregado = cotizadorActual.configuracion[producto.categoria]?.id === producto.id;

        col.innerHTML = `
            <div class="producto-card h-100 d-flex flex-column">
                <div class="producto-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                    <span class="badge position-absolute top-0 end-0 m-2 gama-${producto.gama}">${producto.gama}</span>
                </div>
                <div class="p-3 flex-grow-1 d-flex flex-column">
                    <h4 class="h6 text-white mb-2">${producto.nombre}</h4>
                    <p class="text-secondary small mb-2">${producto.descripcion}</p>
                    <div class="d-flex flex-wrap gap-1 mb-3">
                        ${Object.entries(producto.specs).map(([key, value]) =>
            `<span class="spec-tag">${value}</span>`
        ).join('')}
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="h5 mb-0 text-info fw-bold">$${producto.precio.toLocaleString('es-AR')}</span>
                        <button 
                            class="btn btn-sm ${yaAgregado ? 'btn-success' : 'btn-primary'}" 
                            onclick="agregarAlCotizador('${producto.id}')"
                            ${yaAgregado ? 'disabled' : ''}
                        >
                            ${yaAgregado ? '<i class="bi bi-check-lg"></i> Agregado' : '<i class="bi bi-plus-lg"></i> Agregar'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });

    // Mostrar la sección de productos
    document.getElementById('productos-section').style.display = 'block';
}

/**
 * Actualiza el resumen de la cotización en el sidebar
 */
function actualizarResumen() {
    const resumen = cotizadorActual.obtenerResumen();
    const container = document.getElementById('resumen-items');
    const totalBase = document.getElementById('total-base');
    const totalDescuento = document.getElementById('total-descuento');
    const totalFinal = document.getElementById('total-final');
    const descuentosContainer = document.getElementById('descuentos-aplicados');

    if (!container) return;

    // Renderizar items
    container.innerHTML = '';

    if (resumen.numComponentes === 0) {
        container.innerHTML = '<p class="text-secondary text-center py-4 mb-0">No hay componentes seleccionados</p>';
    } else {
        for (const categoria in resumen.configuracion) {
            const producto = resumen.configuracion[categoria];
            const item = document.createElement('div');
            item.className = 'resumen-item';
            item.innerHTML = `
                <div class="resumen-item-info">
                    <strong class="text-white">${producto.nombre}</strong>
                    <span class="resumen-item-precio">$${producto.precio.toLocaleString('es-AR')}</span>
                </div>
                <button class="btn btn-link btn-sm text-danger p-0" onclick="removerDelCotizador('${categoria}')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            container.appendChild(item);
        }
    }

    // Actualizar totales
    if (totalBase) totalBase.textContent = `$${resumen.precioBase.toLocaleString('es-AR')}`;
    if (totalDescuento) totalDescuento.textContent = `${resumen.descuento}%`;
    if (totalFinal) totalFinal.textContent = `$${resumen.precioFinal.toLocaleString('es-AR')}`;

    // Mostrar descuentos aplicados
    if (descuentosContainer) {
        if (resumen.descuentosAplicados.length > 0) {
            descuentosContainer.innerHTML = resumen.descuentosAplicados.map(desc =>
                `<div class="descuento-tag">
                    <span><i class="bi bi-tag-fill me-1"></i>${desc.nombre}</span>
                    <strong>-${desc.valor}%</strong>
                </div>`
            ).join('');
            descuentosContainer.style.display = 'block';
        } else {
            descuentosContainer.style.display = 'none';
        }
    }

    // Actualizar contador en el badge
    const badge = document.querySelector('.resumen-badge');
    if (badge) {
        badge.textContent = resumen.numComponentes;
        badge.style.display = resumen.numComponentes > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Muestra el modal de confirmación de cotización
 */
function mostrarModalConfirmacion() {
    const validacion = cotizadorActual.validarConfiguracion();

    if (!validacion.valida) {
        Swal.fire({
            icon: 'warning',
            title: 'Configuración incompleta',
            html: `
                <p>Te faltan algunos componentes esenciales:</p>
                <ul class="list-unstyled text-start mx-auto" style="max-width: 300px;">
                    ${validacion.categoriasFaltantes.map(cat =>
                `<li><i class="bi bi-exclamation-circle text-warning me-2"></i>${obtenerCategoria(cat)?.nombre || cat}</li>`
            ).join('')}
                </ul>
                <p class="mt-3">¿Deseas continuar de todas formas?</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Volver a configurar',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        }).then((result) => {
            if (result.isConfirmed) {
                abrirFormularioContacto();
            }
        });
    } else {
        abrirFormularioContacto();
    }
}

/**
 * Abre el formulario de contacto con la cotización
 */
function abrirFormularioContacto() {
    const resumen = cotizadorActual.obtenerResumen();

    // Generar HTML del resumen
    const resumenHTML = Object.values(resumen.configuracion).map(prod =>
        `<li class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between">
            <span>${prod.nombre}</span>
            <span class="text-info">$${prod.precio.toLocaleString('es-AR')}</span>
        </li>`
    ).join('');

    Swal.fire({
        title: 'Enviar Cotización',
        html: `
            <div class="text-start">
                <div class="mb-4">
                    <h6 class="text-secondary mb-3">Tu configuración:</h6>
                    <ul class="list-group" style="max-height: 150px; overflow-y: auto;">
                        ${resumenHTML}
                    </ul>
                    <div class="d-flex justify-content-between align-items-center mt-3 p-2 bg-dark rounded">
                        <strong>Total:</strong>
                        <span class="h4 mb-0 text-gradient">$${resumen.precioFinal.toLocaleString('es-AR')}</span>
                    </div>
                </div>
                <form id="form-contacto-modal">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="nombre-modal" placeholder="Nombre completo" required>
                    </div>
                    <div class="mb-3">
                        <input type="email" class="form-control" id="email-modal" placeholder="Email" required>
                    </div>
                    <div class="mb-3">
                        <input type="tel" class="form-control" id="telefono-modal" placeholder="Teléfono (opcional)">
                    </div>
                    <div class="mb-3">
                        <textarea class="form-control" id="comentarios-modal" placeholder="Comentarios adicionales" rows="3"></textarea>
                    </div>
                </form>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-send me-1"></i> Enviar cotización',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        width: '600px',
        didOpen: () => {
            // Precargar datos de ejemplo
            document.getElementById('nombre-modal').value = 'Juan Pérez';
            document.getElementById('email-modal').value = 'juan.perez@ejemplo.com';
            document.getElementById('telefono-modal').value = '1145678901';
            document.getElementById('comentarios-modal').value = '¡Me interesa esta configuración!';
        },
        preConfirm: () => {
            return {
                nombre: document.getElementById('nombre-modal').value,
                email: document.getElementById('email-modal').value,
                telefono: document.getElementById('telefono-modal').value,
                comentarios: document.getElementById('comentarios-modal').value
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            enviarCotizacion({
                formulario: result.value,
                cotizacion: resumen
            });
        }
    });
}

/**
 * Muestra las cotizaciones guardadas
 */
function mostrarCotizacionesGuardadas() {
    const cotizaciones = cargarCotizaciones();

    if (cotizaciones.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin cotizaciones guardadas',
            text: 'Aún no has guardado ninguna cotización',
            confirmButtonColor: '#6366f1'
        });
        return;
    }

    const cotizacionesHTML = cotizaciones.map(cot => `
        <div class="cotizacion-guardada-item d-flex justify-content-between align-items-center gap-3 mb-2">
            <div class="flex-grow-1">
                <strong class="text-white d-block">${cot.nombre}</strong>
                <small class="text-secondary">${new Date(cot.fecha).toLocaleDateString('es-AR')}</small>
                <span class="d-block text-info fw-semibold">$${cot.precioFinal.toLocaleString('es-AR')}</span>
            </div>
            <div class="d-flex gap-2">
                <button onclick="cargarCotizacionGuardada(${cot.id})" class="btn btn-primary btn-sm">
                    <i class="bi bi-download"></i> Cargar
                </button>
                <button onclick="eliminarCotizacionGuardada(${cot.id})" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    Swal.fire({
        title: '<i class="bi bi-folder2-open me-2"></i>Cotizaciones Guardadas',
        html: `<div class="cotizaciones-guardadas" style="max-height: 400px; overflow-y: auto;">${cotizacionesHTML}</div>`,
        width: '700px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#6366f1'
    });
}

/**
 * Muestra la comparación de múltiples configuraciones
 */
function mostrarComparacion() {
    const cotizaciones = cargarCotizaciones();

    if (cotizaciones.length < 2) {
        Swal.fire({
            icon: 'info',
            title: 'Necesitas más cotizaciones',
            text: 'Guarda al menos 2 configuraciones para compararlas',
            confirmButtonColor: '#6366f1'
        });
        return;
    }

    // Tomar las últimas 3 cotizaciones
    const comparar = cotizaciones.slice(-3);

    const tablaHTML = `
        <div class="table-responsive">
            <table class="table table-dark table-bordered tabla-comparacion">
                <thead>
                    <tr>
                        <th>Componente</th>
                        ${comparar.map(cot => `<th>${cot.nombre}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong><i class="bi bi-cpu me-2"></i>Procesador</strong></td>
                        ${comparar.map(cot => `<td>${cot.configuracion.procesadores?.nombre || '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong><i class="bi bi-memory me-2"></i>RAM</strong></td>
                        ${comparar.map(cot => `<td>${cot.configuracion.ram?.nombre || '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong><i class="bi bi-device-hdd me-2"></i>Almacenamiento</strong></td>
                        ${comparar.map(cot => `<td>${cot.configuracion.almacenamiento?.nombre || '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong><i class="bi bi-gpu-card me-2"></i>GPU</strong></td>
                        ${comparar.map(cot => `<td>${cot.configuracion.gpu?.nombre || '-'}</td>`).join('')}
                    </tr>
                    <tr class="table-primary">
                        <td><strong>Total</strong></td>
                        ${comparar.map(cot => `<td><strong class="text-info">$${cot.precioFinal.toLocaleString('es-AR')}</strong></td>`).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    Swal.fire({
        title: '<i class="bi bi-arrow-left-right me-2"></i>Comparación de Configuraciones',
        html: tablaHTML,
        width: '900px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#6366f1'
    });
}
