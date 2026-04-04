// ==================== ADMIN DASHBOARD ====================

let allOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    updateStatistics();
    
    // Polling - cek pesanan baru setiap 5 detik
    setInterval(() => {
        loadOrders();
    }, 5000);
});

function loadOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    allOrders = orders;

    const tbody = document.getElementById('orders-tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Belum ada pesanan</td></tr>';
        return;
    }

    // Urutkan dari yang terbaru
    orders.reverse();

    // Cek pesanan baru (ditambahkan dalam 1 menit terakhir)
    const newOrders = orders.filter(order => {
        const orderTime = new Date(order.orderDate).getTime();
        const now = Date.now();
        return (now - orderTime) < 60000; // 1 menit
    });

    // Tampilkan alert jika ada pesanan baru
    if (newOrders.length > 0) {
        showNewOrderAlert(newOrders[0]);
        playNotificationSound();
    }

    tbody.innerHTML = orders.map(order => {
        const total = order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        const finalTotal = total + tax;
        const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID');

        return `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>
                    <strong>${order.name}</strong><br>
                    <small>${order.phone}</small>
                </td>
                <td>
                    ${order.cart.length} item<br>
                    ${order.cart.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
                </td>
                <td><strong>Rp ${finalTotal.toLocaleString()}</strong></td>
                <td>${orderDate}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status === 'pending' ? '⏳ Menunggu' : '✅ Selesai'}
                    </span>
                </td>
                <td>
                    ${order.status === 'pending' ? `
                        <button class="action-btn btn-confirm" onclick="confirmOrder('${order.orderId}')">
                            Konfirmasi
                        </button>
                        <button class="action-btn btn-cancel" onclick="cancelOrder('${order.orderId}')">
                            Batalkan
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function showNewOrderAlert(order) {
    const total = order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const alertDiv = document.getElementById('new-order-alert');
    
    alertDiv.innerHTML = `
        <div class="new-order-alert">
            <strong>🔔 PESANAN BARU DITERIMA!</strong>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Dari:</strong> ${order.name} (${order.phone})</p>
            <p><strong>Total:</strong> Rp ${total.toLocaleString()}</p>
            <p><strong>Produk:</strong> ${order.cart.map(item => `${item.name} (${item.quantity}x)`).join(', ')}</p>
        </div>
    `;

    // Hapus alert setelah 10 detik
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 10000);
}

function playNotificationSound() {
    // Gunakan Web Audio API untuk memutar suara
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateStatistics() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => {
        const total = order.cart.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        return sum + total + tax;
    }, 0);

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    document.getElementById('total-revenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
}

function confirmOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let order = orders.find(o => o.orderId === orderId);

    if (order) {
        order.status = 'completed';
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Kirim notifikasi ke pembeli
        sendCustomerNotification(order, 'confirmed');
        
        loadOrders();
        updateStatistics();
        alert('✅ Pesanan dikonfirmasi!');
    }
}

function cancelOrder(orderId) {
    if (confirm('Yakin ingin membatalkan pesanan ini?')) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        let order = orders.find(o => o.orderId === orderId);

        if (order) {
            order.status = 'cancelled';
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Kirim notifikasi pembatalan ke pembeli
            sendCustomerNotification(order, 'cancelled');
            
            loadOrders();
            updateStatistics();
            alert('❌ Pesanan dibatalkan!');
        }
    }
}

function sendCustomerNotification(order, status) {
    const statusMessage = status === 'confirmed' ? 'telah dikonfirmasi' : 'telah dibatalkan';
    
    const emailData = {
        to_email: order.email,
        subject: `Update Pesanan ${order.orderId}`,
        message: `
Pesanan Anda ${statusMessage}!

Order ID: ${order.orderId}
Status: ${status === 'confirmed' ? '✅ Dikirim Segera' : '❌ Dibatalkan'}

Terima kasih!
3Grecep Store
        `
    };

    fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });
}