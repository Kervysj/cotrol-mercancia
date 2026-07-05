// ============================================
// VARIABLES GLOBALES
// ============================================
let productos = [];
let productoActual = null;
let contadorCodigo = 1;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    checkTheme();
    document.getElementById('prod-fecha').valueAsDate = new Date();
    actualizarContadores();
    
    // Calcular precio automáticamente
    document.getElementById('prod-precio-compra').addEventListener('input', calcularPrecioVenta);
    document.getElementById('prod-margen').addEventListener('input', calcularPrecioVenta);
});

// ============================================
// MODO OSCURO
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-mode')) {
        btn.textContent = '☀️ Modo Claro';
        localStorage.setItem('theme', 'dark');
    } else {
        btn.textContent = '🌙 Modo Oscuro';
        localStorage.setItem('theme', 'light');
    }
}

function checkTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = '☀️ Modo Claro';
    }
}

// ============================================
// NAVEGACIÓN DE TABS
// ============================================
function cambiarTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'pendientes') renderizarPendientes();
    if (tab === 'historial') renderizarHistorial();
}

// ============================================
// CALCULAR PRECIO DE VENTA
// ============================================
function calcularPrecioVenta() {
    const costo = parseFloat(document.getElementById('prod-precio-compra').value) || 0;
    const margen = parseFloat(document.getElementById('prod-margen').value) || 0;
    
    if (costo > 0 && margen > 0 && margen < 100) {
        const precioVenta = costo / (1 - (margen / 100));
        document.getElementById('prod-precio-venta').value = '$' + precioVenta.toFixed(2);
    } else {
        document.getElementById('prod-precio-venta').value = '';
    }
}

// ============================================
// GENERAR CÓDIGO AUTOMÁTICO
// ============================================
function generarCodigo() {
    const codigo = 'PROD-' + String(contadorCodigo).padStart(3, '0');
    document.getElementById('prod-codigo').value = codigo;
}

// ============================================
// PREVIEW DE FOTO
// ============================================
function previewFoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('foto-img').src = e.target.result;
            document.getElementById('foto-preview').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }
}

function quitarFoto() {
    document.getElementById('prod-foto').value = '';
    document.getElementById('foto-preview').style.display = 'none';
    document.getElementById('foto-img').src = '';
}

// ============================================
// REGISTRAR PRODUCTO
// ============================================
function registrarProducto() {
    const codigo = document.getElementById('prod-codigo').value.trim();
    const fecha = document.getElementById('prod-fecha').value;
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const precioCompra = parseFloat(document.getElementById('prod-precio-compra').value);
    const margen = parseFloat(document.getElementById('prod-margen').value);
    const cantidad = parseInt(document.getElementById('prod-cantidad').value) || 1;
    
    // Validaciones
    if (!codigo || !fecha || !descripcion || !categoria || !precioCompra || !margen) {
        alert('❌ Por favor completa los campos obligatorios (*)');
        return;
    }
    
    if (margen >= 100) {
        alert('❌ El margen debe ser menor al 100%');
        return;
    }
    
    // Calcular precio de venta
    const precioVenta = precioCompra / (1 - (margen / 100));
    
    // Obtener foto
    const fotoInput = document.getElementById('prod-foto');
    let foto = '';
    if (fotoInput.files && fotoInput.files[0]) {
        foto = document.getElementById('foto-img').src;
    }
    
    // Crear producto
    const producto = {
        id: Date.now(),
        codigo: codigo,
        fecha: fecha,
        descripcion: descripcion,
        categoria: categoria,
        talla: document.getElementById('prod-talla').value.trim(),
        color: document.getElementById('prod-color').value.trim(),
        proveedor: document.getElementById('prod-proveedor').value.trim(),
        bulto: document.getElementById('prod-bulto').value ? parseInt(document.getElementById('prod-bulto').value) : null,
        cantidad: cantidad,
        precioCompra: precioCompra,
        margen: margen,
        precioVenta: precioVenta,
        foto: foto,
        notas: document.getElementById('prod-notas').value.trim(),
        estatus: 'pendiente',
        fechaRegistro: new Date().toISOString()
    };
    
    productos.push(producto);
    guardarDatos();
    contadorCodigo++;
    
    // Limpiar formulario
    limpiarFormulario();
    
    alert('✅ Producto registrado correctamente');
    actualizarContadores();
    
    // Ir a pendientes
    document.querySelectorAll('.tab-btn')[1].click();
}

function limpiarFormulario() {
    document.getElementById('prod-codigo').value = '';
    document.getElementById('prod-descripcion').value = '';
    document.getElementById('prod-categoria').value = '';
    document.getElementById('prod-talla').value = '';
    document.getElementById('prod-color').value = '';
    document.getElementById('prod-proveedor').value = '';
    document.getElementById('prod-bulto').value = '';
    document.getElementById('prod-cantidad').value = '1';
    document.getElementById('prod-precio-compra').value = '';
    document.getElementById('prod-margen').value = '';
    document.getElementById('prod-precio-venta').value = '';
    document.getElementById('prod-notas').value = '';
    quitarFoto();
    document.getElementById('prod-fecha').valueAsDate = new Date();
}

// ============================================
// RENDERIZAR PENDIENTES
// ============================================
function renderizarPendientes(filtro = '') {
    const lista = document.getElementById('lista-pendientes');
    const empty = document.getElementById('empty-pendientes');
    
    const pendientes = productos.filter(p => 
        p.estatus === 'pendiente' && 
        (p.descripcion.toLowerCase().includes(filtro.toLowerCase()) || 
         p.codigo.toLowerCase().includes(filtro.toLowerCase()))
    );
    
    if (pendientes.length === 0) {
        lista.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    lista.innerHTML = pendientes.map(p => crearTarjetaProducto(p, 'pendiente')).join('');
}

// ============================================
// RENDERIZAR HISTORIAL
// ============================================
function renderizarHistorial(filtro = '') {
    const lista = document.getElementById('lista-historial');
    const empty = document.getElementById('empty-historial');
    
    const historial = productos.filter(p => 
        p.estatus === 'enviado' && 
        (p.descripcion.toLowerCase().includes(filtro.toLowerCase()) || 
         p.codigo.toLowerCase().includes(filtro.toLowerCase()))
    );
    
    if (historial.length === 0) {
        lista.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    lista.innerHTML = historial.map(p => crearTarjetaProducto(p, 'historial')).join('');
}

// ============================================
// CREAR TARJETA DE PRODUCTO
// ============================================
function crearTarjetaProducto(p, tipo) {
    const fechaFormateada = new Date(p.fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    let html = `
    <div class="product-card ${tipo === 'historial' ? 'enviado' : ''}">
        <span class="codigo">${p.codigo}</span>
        ${p.foto ? `<img src="${p.foto}" class="foto-mini" alt="${p.descripcion}">` : ''}
        <h3>${p.descripcion}</h3>
        <div class="meta">
            <span class="tag">${p.categoria}</span>
            ${p.talla ? `<span class="tag">Talla: ${p.talla}</span>` : ''}
            ${p.color ? `<span class="tag">Color: ${p.color}</span>` : ''}
            ${p.bulto ? `<span class="tag">📦 ${p.bulto} unid/caja</span>` : ''}
            <span class="tag">Cantidad: ${p.cantidad}</span>
        </div>
        ${p.proveedor ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">🏪 ${p.proveedor}</div>` : ''}
        <div class="precios">
            <div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">Compra</div>
                <div class="precio-compra">$${p.precioCompra.toFixed(2)}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.8rem; color:var(--text-secondary);">Venta (${p.margen}%)</div>
                <div class="precio-venta">$${p.precioVenta.toFixed(2)}</div>
            </div>
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">📅 ${fechaFormateada}</div>
        <div class="acciones">
            <button class="btn-detalle" onclick="verDetalle(${p.id})">️ Detalle</button>
            ${tipo === 'pendiente' ? 
                `<button class="btn-enviar" onclick="marcarEnviado(${p.id})">✓ Enviado</button>` :
                `<button class="btn-eliminar" onclick="eliminarProducto(${p.id})">🗑️ Eliminar</button>`
            }
        </div>
    </div>
    `;
    
    return html;
}

// ============================================
// ACCIONES
// ============================================
function marcarEnviado(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.estatus = 'enviado';
        producto.fechaEnvio = new Date().toISOString();
        guardarDatos();
        actualizarContadores();
        renderizarPendientes();
        alert('✅ Producto marcado como enviado a tienda');
    }
}

function eliminarProducto(id) {
    if (confirm('¿Seguro que deseas eliminar este producto del historial?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        actualizarContadores();
        renderizarHistorial();
    }
}

function verDetalle(id) {
    productoActual = productos.find(p => p.id === id);
    if (!productoActual) return;
    
    const p = productoActual;
    const fechaFormateada = new Date(p.fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    let html = '';
    
    if (p.foto) {
        html += `<img src="${p.foto}" class="foto-grande" alt="${p.descripcion}">`;
    }
    
    html += `
    <div class="detalle-row"><span class="detalle-label">Código:</span><span class="detalle-value">${p.codigo}</span></div>
    <div class="detalle-row"><span class="detalle-label">Fecha:</span><span class="detalle-value">${fechaFormateada}</span></div>
    <div class="detalle-row"><span class="detalle-label">Descripción:</span><span class="detalle-value">${p.descripcion}</span></div>
    <div class="detalle-row"><span class="detalle-label">Categoría:</span><span class="detalle-value">${p.categoria}</span></div>
    ${p.talla ? `<div class="detalle-row"><span class="detalle-label">Talla:</span><span class="detalle-value">${p.talla}</span></div>` : ''}
    ${p.color ? `<div class="detalle-row"><span class="detalle-label">Color:</span><span class="detalle-value">${p.color}</span></div>` : ''}
    ${p.proveedor ? `<div class="detalle-row"><span class="detalle-label">Proveedor:</span><span class="detalle-value">${p.proveedor}</span></div>` : ''}
    ${p.bulto ? `<div class="detalle-row"><span class="detalle-label">Por bulto/caja:</span><span class="detalle-value">${p.bulto} unidades</span></div>` : ''}
    <div class="detalle-row"><span class="detalle-label">Cantidad:</span><span class="detalle-value">${p.cantidad}</span></div>
    <div class="detalle-row"><span class="detalle-label">Precio Compra:</span><span class="detalle-value" style="color:var(--danger); font-weight:bold;">$${p.precioCompra.toFixed(2)}</span></div>
    <div class="detalle-row"><span class="detalle-label">Margen:</span><span class="detalle-value">${p.margen}%</span></div>
    <div class="detalle-row"><span class="detalle-label">Precio Venta:</span><span class="detalle-value" style="color:var(--success); font-weight:bold; font-size:1.2rem;">$${p.precioVenta.toFixed(2)}</span></div>
    ${p.notas ? `<div class="detalle-row"><span class="detalle-label">Notas:</span><span class="detalle-value">${p.notas}</span></div>` : ''}
    <div class="detalle-row"><span class="detalle-label">Estatus:</span><span class="detalle-value">${p.estatus === 'pendiente' ? '🔴 Pendiente' : '🟢 Enviado'}</span></div>
    `;
    
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-detalle').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal-detalle').classList.remove('active');
    productoActual = null;
}

// ============================================
// COMPARTIR POR TELEGRAM
// ============================================
function compartirTelegram() {
    if (!productoActual) return;
    
    const p = productoActual;
    const texto = crearTextoProducto(p);
    
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// ============================================
// COMPARTIR POR WHATSAPP
// ============================================
function compartirWhatsApp() {
    if (!productoActual) return;
    
    const p = productoActual;
    const texto = crearTextoProducto(p);
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

function crearTextoProducto(p) {
    const fechaFormateada = new Date(p.fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    let texto = `📦 *PRODUCTO*\n\n`;
    texto += ` Código: ${p.codigo}\n`;
    texto += `📅 Fecha: ${fechaFormateada}\n`;
    texto += `📝 Descripción: ${p.descripcion}\n`;
    texto += `🏷️ Categoría: ${p.categoria}\n`;
    
    if (p.talla) texto += `📏 Talla: ${p.talla}\n`;
    if (p.color) texto += `🎨 Color: ${p.color}\n`;
    if (p.proveedor) texto += ` Proveedor: ${p.proveedor}\n`;
    if (p.bulto) texto += ` Por caja: ${p.bulto} unidades\n`;
    texto += `🔢 Cantidad: ${p.cantidad}\n\n`;
    
    texto += `💰 *PRECIOS*\n`;
    texto += `Compra: $${p.precioCompra.toFixed(2)}\n`;
    texto += `Margen: ${p.margen}%\n`;
    texto += `Venta: $${p.precioVenta.toFixed(2)}\n`;
    
    if (p.notas) texto += `\n📝 Notas: ${p.notas}\n`;
    
    return texto;
}

// ============================================
// BÚSQUEDA
// ============================================
function buscarPendientes() {
    const filtro = document.getElementById('buscar-pendientes').value;
    renderizarPendientes(filtro);
}

function buscarHistorial() {
    const filtro = document.getElementById('buscar-historial').value;
    renderizarHistorial(filtro);
}

// ============================================
// CONTADORES Y ALERTAS
// ============================================
function actualizarContadores() {
    const pendientes = productos.filter(p => p.estatus === 'pendiente').length;
    const historial = productos.filter(p => p.estatus === 'enviado').length;
    
    document.getElementById('contador-pendientes').textContent = pendientes;
    document.getElementById('contador-historial').textContent = historial;
    
    // Alerta si historial >= 15
    const alerta = document.getElementById('alerta-historial');
    if (historial >= 15) {
        alerta.style.display = 'flex';
    } else {
        alerta.style.display = 'none';
    }
}

function vaciarHistorial() {
    if (confirm('¿Seguro que deseas vaciar todo el historial? Esta acción no se puede deshacer.')) {
        productos = productos.filter(p => p.estatus === 'pendiente');
        guardarDatos();
        actualizarContadores();
        renderizarHistorial();
        alert('✅ Historial vaciado correctamente');
    }
}

// ============================================
// EXPORTAR HISTORIAL
// ============================================
function exportarHistorial() {
    const historial = productos.filter(p => p.estatus === 'enviado');
    
    if (historial.length === 0) {
        alert('No hay productos en el historial para exportar');
        return;
    }
    
    let csv = 'Código,Fecha,Descripción,Categoría,Talla,Color,Proveedor,Bulto,Cantidad,Precio Compra,Margen,Precio Venta,Notas\n';
    
    historial.forEach(p => {
        csv += `"${p.codigo}","${p.fecha}","${p.descripcion}","${p.categoria}","${p.talla || ''}","${p.color || ''}","${p.proveedor || ''}","${p.bulto || ''}","${p.cantidad}","${p.precioCompra}","${p.margen}","${p.precioVenta.toFixed(2)}","${p.notas || ''}"\n`;
    });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historial_inventario.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    alert('📤 Historial exportado correctamente');
}

// ============================================
// LOCALSTORAGE
// ============================================
function guardarDatos() {
    localStorage.setItem('inventario_productos', JSON.stringify(productos));
    localStorage.setItem('inventario_contador', contadorCodigo);
}

function cargarDatos() {
    const datos = localStorage.getItem('inventario_productos');
    const contador = localStorage.getItem('inventario_contador');
    
    if (datos) {
        productos = JSON.parse(datos);
    }
    if (contador) {
        contadorCodigo = parseInt(contador);
    }
}
