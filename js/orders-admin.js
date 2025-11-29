// frontend-admin/js/orders-admin.js
console.log('✅ orders-admin.js carregado!');

// Funções para gerenciar pedidos
async function loadOrders() {
    try {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<div class="loading">Carregando pedidos</div>';
        
        const statusFilter = document.getElementById('order-status-filter').value;
        let url = `${window.API_URL}/orders`;
        if (statusFilter !== 'all') {
            url += `?status=${statusFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar pedidos');
        
        const orders = await response.json();
        displayOrders(orders);
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<div class="message error">Erro ao carregar pedidos</div>';
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-products">Nenhum pedido encontrado.</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" data-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Pedido #${order.id.substring(0, 8)}</h3>
                    <div class="order-meta">
                        <strong>Cliente:</strong> ${order.user.name || order.user.email} |
                        <strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString()} |
                        <strong>Total:</strong> R$ ${order.total.toFixed(2)}
                    </div>
                </div>
                <div class="order-actions">
                    <span class="order-status status-${order.status.toLowerCase()}">
                        ${getStatusText(order.status)}
                    </span>
                    <button class="order-details-btn" onclick="openOrderDetail('${order.id}')">
                        Detalhes
                    </button>
                    ${getStatusButtons(order.status, order.id)}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-product">
                        <img src="${item.product.imageUrl}" alt="${item.product.name}" 
                             class="order-item-image"
                             onerror="this.src='https://via.placeholder.com/50x50?text=Produto'">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.product.name}</div>
                            <div class="order-item-quantity">Qtd: ${item.quantity} × R$ ${item.price.toFixed(2)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Pendente',
        'CONFIRMED': 'Confirmado', 
        'SHIPPED': 'Enviado',
        'DELIVERED': 'Entregue',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
}

function getStatusButtons(currentStatus, orderId) {
    const buttons = [];
    
    if (currentStatus === 'PENDING') {
        buttons.push(`
            <button class="order-status-btn confirm" onclick="updateOrderStatus('${orderId}', 'CONFIRMED')">
                Confirmar
            </button>
        `);
    }
    
    if (currentStatus === 'CONFIRMED') {
        buttons.push(`
            <button class="order-status-btn ship" onclick="updateOrderStatus('${orderId}', 'SHIPPED')">
                Marcar como Enviado
            </button>
        `);
    }
    
    if (currentStatus === 'SHIPPED') {
        buttons.push(`
            <button class="order-status-btn deliver" onclick="updateOrderStatus('${orderId}', 'DELIVERED')">
                Marcar como Entregue
            </button>
        `);
    }
    
    if (currentStatus !== 'CANCELLED' && currentStatus !== 'DELIVERED') {
        buttons.push(`
            <button class="order-status-btn cancel" onclick="updateOrderStatus('${orderId}', 'CANCELLED')">
                Cancelar
            </button>
        `);
    }
    
    return buttons.join('');
}

async function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Tem certeza que deseja ${getStatusText(newStatus).toLowerCase()} este pedido?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${window.API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar pedido');
        
        showMessage(`Pedido ${getStatusText(newStatus).toLowerCase()} com sucesso!`, 'success');
        loadOrders();
        
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        showMessage('Erro ao atualizar pedido: ' + error.message, 'error');
    }
}

async function openOrderDetail(orderId) {
    try {
        const response = await fetch(`${window.API_URL}/orders/${orderId}`);
        if (!response.ok) throw new Error('Erro ao carregar detalhes do pedido');
        
        const order = await response.json();
        displayOrderDetail(order);
        
        const modal = document.getElementById('order-detail-modal');
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao abrir detalhes do pedido:', error);
        showMessage('Erro ao carregar detalhes do pedido', 'error');
    }
}

function displayOrderDetail(order) {
    const content = document.getElementById('order-detail-content');
    
    content.innerHTML = `
        <div class="order-detail-section">
            <h4>Informações do Cliente</h4>
            <div class="customer-info">
                <p><strong>Nome:</strong> ${order.user.name || 'Não informado'}</p>
                <p><strong>Email:</strong> ${order.user.email}</p>
                <p><strong>Telefone:</strong> ${order.user.phone || 'Não informado'}</p>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4>Itens do Pedido</h4>
            ${order.items.map(item => `
                <div class="order-item-product">
                    <img src="${item.product.imageUrl}" alt="${item.product.name}" 
                         class="order-item-image"
                         onerror="this.src='https://via.placeholder.com/50x50?text=Produto'">
                    <div class="order-item-info">
                        <div class="order-item-name">${item.product.name}</div>
                        <div class="order-item-quantity">
                            Qtd: ${item.quantity} × R$ ${item.price.toFixed(2)} = 
                            R$ ${(item.quantity * item.price).toFixed(2)}
                        </div>
                    </div>
                </div>
            `).join('')}
            <div class="order-total">
                Total: R$ ${order.total.toFixed(2)}
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4>Status do Pedido</h4>
            <p>Status atual: <span class="order-status status-${order.status.toLowerCase()}">
                ${getStatusText(order.status)}
            </span></p>
            <div class="order-actions" style="margin-top: 1rem;">
                ${getStatusButtons(order.status, order.id)}
            </div>
        </div>
    `;
}

function closeOrderDetailModal() {
    const modal = document.getElementById('order-detail-modal');
    modal.style.display = 'none';
}

// Event Listeners para pedidos
document.addEventListener('DOMContentLoaded', function() {
    const refreshOrdersBtn = document.getElementById('refresh-orders');
    const orderStatusFilter = document.getElementById('order-status-filter');
    const closeOrderDetailModalBtns = document.querySelectorAll('.close-modal[data-modal="order-detail"]');
    
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadOrders);
    }
    
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', loadOrders);
    }
    
    // Fechar modal de detalhes do pedido
    closeOrderDetailModalBtns.forEach(btn => {
        btn.addEventListener('click', closeOrderDetailModal);
    });
    
    // Fechar modal clicando fora
    document.getElementById('order-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeOrderDetailModal();
        }
    });
});

window.loadOrders = loadOrders;
window.openOrderDetail = openOrderDetail;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderDetailModal = closeOrderDetailModal;