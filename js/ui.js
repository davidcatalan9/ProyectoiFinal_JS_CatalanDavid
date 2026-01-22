// ==========================================
// MÓDULO DE INTERFAZ DE USUARIO
// Genera y actualiza elementos del DOM dinámicamente
// ==========================================

/**
 * Renderiza las categorías de productos
 */
function renderizarCategorias() {
    const container = document.getElementById('categorias-container');
    if (!container) return;

    const categorias = obtenerCategorias();
    container.innerHTML = '';

    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'categoria-card';
        card.innerHTML = `
            <div class="categoria-icono">${categoria.icono}</div>
            <h3>${categoria.nombre}</h3>
            <p>${categoria.descripcion}</p>
            <button class="btn btn-primary" onclick="mostrarProductosCategoria('${categoria.id}')">
                Ver componentes
            </button>
        `;
        container.appendChild(card);
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
 * Renderiza un grid de productos
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
        const card = document.createElement('div');
        card.className = 'producto-card';

        // Determinar si ya está agregado
        const yaAgregado = cotizadorActual.configuracion[producto.categoria]?.id === producto.id;

        card.innerHTML = `
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                <span class="producto-gama gama-${producto.gama}">${producto.gama}</span>
            </div>
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <div class="producto-specs">
                    ${Object.entries(producto.specs).map(([key, value]) =>
            `<span class="spec-tag">${value}</span>`
        ).join('')}
                </div>
                <div class="producto-footer">
                    <span class="producto-precio">$${producto.precio.toLocaleString('es-AR')}</span>
                    <button 
                        class="btn ${yaAgregado ? 'btn-success' : 'btn-primary'}" 
                        onclick="agregarAlCotizador('${producto.id}')"
                        ${yaAgregado ? 'disabled' : ''}
                    >
                        ${yaAgregado ? '✓ Agregado' : '+ Agregar'}
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
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
        container.innerHTML = '<p class="resumen-vacio">No hay componentes seleccionados</p>';
    } else {
        for (const categoria in resumen.configuracion) {
            const producto = resumen.configuracion[categoria];
            const item = document.createElement('div');
            item.className = 'resumen-item';
            item.innerHTML = `
                <div class="resumen-item-info">
                    <strong>${producto.nombre}</strong>
                    <span class="resumen-item-precio">$${producto.precio.toLocaleString('es-AR')}</span>
                </div>
                <button class="btn-icon" onclick="removerDelCotizador('${categoria}')" title="Eliminar">
                    <span>🗑️</span>
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
                    <span>${desc.nombre}</span>
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
        badge.style.display = resumen.numComponentes > 0 ? 'flex' : 'none';
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
                <ul style="text-align: left; margin: 1rem auto; max-width: 300px;">
                    ${validacion.categoriasFaltantes.map(cat =>
                `<li>${obtenerCategoria(cat)?.nombre || cat}</li>`
            ).join('')}
                </ul>
                <p>¿Deseas continuar de todas formas?</p>
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
        `<li>${prod.nombre} - $${prod.precio.toLocaleString('es-AR')}</li>`
    ).join('');

    Swal.fire({
        title: 'Enviar Cotización',
        html: `
            <div class="modal-cotizacion">
                <div class="resumen-final">
                    <h4>Tu configuración:</h4>
                    <ul style="text-align: left; max-height: 150px; overflow-y: auto;">
                        ${resumenHTML}
                    </ul>
                    <div class="total-modal">
                        <strong>Total:</strong> 
                        <span class="precio-grande">$${resumen.precioFinal.toLocaleString('es-AR')}</span>
                    </div>
                </div>
                <form id="form-contacto-modal" class="form-contacto">
                    <input type="text" id="nombre-modal" placeholder="Nombre completo" required>
                    <input type="email" id="email-modal" placeholder="Email" required>
                    <input type="tel" id="telefono-modal" placeholder="Teléfono (opcional)">
                    <textarea id="comentarios-modal" placeholder="Comentarios adicionales" rows="3"></textarea>
                </form>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar cotización',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        width: '600px',
        didOpen: () => {
            // Precargar datos
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
        <div class="cotizacion-guardada-item">
            <div class="cotizacion-info">
                <strong>${cot.nombre}</strong>
                <small>${new Date(cot.fecha).toLocaleDateString('es-AR')}</small>
                <span class="precio-cotizacion">$${cot.precioFinal.toLocaleString('es-AR')}</span>
            </div>
            <div class="cotizacion-acciones">
                <button onclick="cargarCotizacionGuardada(${cot.id})" class="btn-mini btn-primary">Cargar</button>
                <button onclick="eliminarCotizacionGuardada(${cot.id})" class="btn-mini btn-danger">Eliminar</button>
            </div>
        </div>
    `).join('');

    Swal.fire({
        title: 'Cotizaciones Guardadas',
        html: `<div class="cotizaciones-guardadas">${cotizacionesHTML}</div>`,
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
        <table class="tabla-comparacion">
            <thead>
                <tr>
                    <th>Componente</th>
                    ${comparar.map(cot => `<th>${cot.nombre}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Procesador</strong></td>
                    ${comparar.map(cot => `<td>${cot.configuracion.procesadores?.nombre || '-'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>RAM</strong></td>
                    ${comparar.map(cot => `<td>${cot.configuracion.ram?.nombre || '-'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Almacenamiento</strong></td>
                    ${comparar.map(cot => `<td>${cot.configuracion.almacenamiento?.nombre || '-'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>GPU</strong></td>
                    ${comparar.map(cot => `<td>${cot.configuracion.gpu?.nombre || '-'}</td>`).join('')}
                </tr>
                <tr class="total-row">
                    <td><strong>Total</strong></td>
                    ${comparar.map(cot => `<td><strong>$${cot.precioFinal.toLocaleString('es-AR')}</strong></td>`).join('')}
                </tr>
            </tbody>
        </table>
    `;

    Swal.fire({
        title: 'Comparación de Configuraciones',
        html: tablaHTML,
        width: '900px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#6366f1'
    });
}
