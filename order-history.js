// ==================== HALAMAN RIWAYAT PEMBELIAN ====================

document.addEventListener('DOMContentLoaded', function() {
    displayOrders();
});

function displayOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <h2>📋 Belum Ada Pesanan</h2>
                <p>Anda belum pernah melakukan pembelian</p>
                <a href="products.html" class="btn btn-primary">Mulai Belanja</a>
            </div>
        `;
        return;
    }

    // Urutkan dari yang terbaru
    orders.reverse();

    ordersList.innerHTML = orders.map((order, index) => {
        const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID');
        const total = order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        const finalTotal = total + tax;

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">${order.orderId}</span>
                        <p style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">${orderDate}</p>
                    </div>
                    <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                </div>

                <div class="order-items">
                    <p style="font-weight: bold; margin-bottom: 10px;">Produk:</p>
                    ${order.cart.map(item => `
                        <div class="order-item">
                            <span>${item.name} × ${item.quantity}</span>
                            <span>${formatRupiah(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="order-footer">
                    <div>
                        <p><strong>Nama:</strong> ${order.name}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Metode:</strong> ${getPaymentText(order.payment)}</p>
                    </div>
                    <div class="order-total">
                        Total: ${formatRupiah(finalTotal)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ Menunggu Pembayaran',
        'completed': '✅ Selesai',
        'cancelled': '❌ Dibatalkan'
    };
    return statusMap[status] || status;
}

function getPaymentText(payment) {
    const paymentMap = {
        'transfer': '💳 Transfer Bank',
        'ewallet': '📱 E-Wallet',
        'cod': '🚗 Bayar di Tempat'
    };
    return paymentMap[payment] || payment;
}