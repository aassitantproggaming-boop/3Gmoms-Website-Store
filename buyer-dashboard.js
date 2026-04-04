// ==================== BUYER DASHBOARD ====================

document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    loadBuyerProfile();
    loadBuyerStatistics();
    loadBuyerOrders();
    updateAuthUI();
});

function checkLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
    }
}

function loadBuyerProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-phone').textContent = currentUser.phone;
        document.getElementById('profile-date').textContent = new Date(currentUser.createdAt).toLocaleDateString('id-ID');
    }
}

function loadBuyerStatistics() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter orders milik user ini
    const userOrders = allOrders.filter(order => order.email === currentUser.email);
    
    const totalPurchases = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => {
        const total = order.cart.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        return sum + total + tax;
    }, 0);
    const activeOrders = userOrders.filter(o => o.status === 'pending').length;
    const completedPurchases = userOrders.filter(o => o.status === 'completed').length;

    document.getElementById('total-purchases').textContent = totalPurchases;
    document.getElementById('total-spent').textContent = `Rp ${totalSpent.toLocaleString()}`;
    document.getElementById('active-orders').textContent = activeOrders;
    document.getElementById('completed-purchases').textContent = completedPurchases;
}

function loadBuyerOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter orders milik user ini
    const userOrders = allOrders.filter(order => order.email === currentUser.email);
    
    const tbody = document.getElementById('purchases-tbody');

    if (userOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Belum ada pesanan</td></tr>';
        return;
    }

    // Urutkan dari terbaru
    userOrders.reverse();

    tbody.innerHTML = userOrders.map(order => {
        const total = order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        const finalTotal = total + tax;
        const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID');

        return `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.cart.map(item => `${item.name} (${item.quantity}x)`).join(', ')}</td>
                <td><strong>Rp ${finalTotal.toLocaleString()}</strong></td>
                <td>${orderDate}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status === 'pending' ? '⏳ Menunggu' : '✅ Selesai'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}