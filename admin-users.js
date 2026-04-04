// ==================== ADMIN USERS MANAGEMENT ====================

let selectedBuyer = null;
let selectedSeller = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    loadBuyersList();
    loadSellersList();
    updateAuthUI();
});

function checkAdminLogin() {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
        window.location.href = 'index.html';
    }
}

function switchUserTab(tab) {
    const buyersTab = document.getElementById('buyers-tab');
    const sellersTab = document.getElementById('sellers-tab');
    const buttons = document.querySelectorAll('.user-tabs .tab-btn');

    if (tab === 'buyers') {
        buyersTab.classList.remove('hidden');
        sellersTab.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        buyersTab.classList.add('hidden');
        sellersTab.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

// ==================== PEMBELI ====================
function loadBuyersList() {
    const buyers = JSON.parse(localStorage.getItem('buyers')) || [];
    const tbody = document.getElementById('buyers-tbody');

    if (buyers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Belum ada pembeli terdaftar</td></tr>';
        return;
    }

    tbody.innerHTML = buyers.map((buyer, index) => {
        const createdDate = new Date(buyer.createdAt).toLocaleDateString('id-ID');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const buyerOrders = orders.filter(o => o.email === buyer.email);

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${buyer.name}</strong></td>
                <td>${buyer.username}</td>
                <td>${buyer.email}</td>
                <td>${buyer.phone}</td>
                <td>${createdDate}</td>
                <td>${buyerOrders.length} pesanan</td>
                <td>
                    <button class="action-btn btn-confirm" onclick="viewBuyerDetail('${buyer.id}')">👁️ Lihat</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewBuyerDetail(buyerId) {
    const buyers = JSON.parse(localStorage.getItem('buyers')) || [];
    const buyer = buyers.find(b => b.id === buyerId);

    if (!buyer) return;

    selectedBuyer = buyer;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const buyerOrders = orders.filter(o => o.email === buyer.email);
    
    const totalSpent = buyerOrders.reduce((sum, order) => {
        const total = order.cart.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        return sum + total + tax;
    }, 0);

    // Isi detail
    document.getElementById('detail-buyer-name').textContent = buyer.name;
    document.getElementById('detail-buyer-username').textContent = buyer.username;
    document.getElementById('detail-buyer-email').textContent = buyer.email;
    document.getElementById('detail-buyer-phone').textContent = buyer.phone;
    document.getElementById('detail-buyer-date').textContent = new Date(buyer.createdAt).toLocaleDateString('id-ID');
    document.getElementById('detail-buyer-orders').textContent = buyerOrders.length;
    document.getElementById('detail-buyer-total').textContent = `Rp ${totalSpent.toLocaleString()}`;

    // Riwayat pembelian
    const ordersList = document.getElementById('detail-buyer-orders-list');
    if (buyerOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Belum ada pembelian</p>';
    } else {
        ordersList.innerHTML = buyerOrders.map(order => {
            const total = order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = Math.floor(total * 0.1);
            const finalTotal = total + tax;
            const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID');

            return `
                <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                    <strong>${order.orderId}</strong> - ${orderDate}<br>
                    <small>Total: Rp ${finalTotal.toLocaleString()}</small><br>
                    <small>Status: ${order.status === 'pending' ? '⏳ Menunggu' : '✅ Selesai'}</small>
                </div>
            `;
        }).join('');
    }

    document.getElementById('buyerDetailModal').classList.add('show');
}

function closeBuyerDetailModal() {
    document.getElementById('buyerDetailModal').classList.remove('show');
    selectedBuyer = null;
}

function deleteBuyer() {
    if (!selectedBuyer) return;

    if (confirm(`Yakin ingin menghapus akun pembeli "${selectedBuyer.name}"?\nSemua data pembelian akan tetap tersimpan.`)) {
        if (confirm('Tekan OK untuk mengkonfirmasi penghapusan')) {
            let buyers = JSON.parse(localStorage.getItem('buyers')) || [];
            buyers = buyers.filter(b => b.id !== selectedBuyer.id);
            localStorage.setItem('buyers', JSON.stringify(buyers));

            showNotification('✅ Akun pembeli berhasil dihapus!');
            closeBuyerDetailModal();
            loadBuyersList();
        }
    }
}

// ==================== PENJUAL ====================
function loadSellersList() {
    const sellers = JSON.parse(localStorage.getItem('sellers')) || [];
    const tbody = document.getElementById('sellers-tbody');

    if (sellers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Belum ada penjual terdaftar</td></tr>';
        return;
    }

    tbody.innerHTML = sellers.map((seller, index) => {
        const createdDate = new Date(seller.createdAt).toLocaleDateString('id-ID');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${seller.storeName}</strong></td>
                <td>${seller.name}</td>
                <td>${seller.username}</td>
                <td>${seller.email}</td>
                <td>${seller.phone}</td>
                <td>${seller.address.substring(0, 20)}...</td>
                <td>${createdDate}</td>
                <td>
                    <button class="action-btn btn-confirm" onclick="viewSellerDetail('${seller.id}')">👁️ Lihat</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewSellerDetail(sellerId) {
    const sellers = JSON.parse(localStorage.getItem('sellers')) || [];
    const seller = sellers.find(s => s.id === sellerId);

    if (!seller) return;

    selectedSeller = seller;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const totalOrders = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => {
        const total = order.cart.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        const tax = Math.floor(total * 0.1);
        return sum + total + tax;
    }, 0);

    // Isi detail
    document.getElementById('detail-seller-storename').textContent = seller.storeName;
    document.getElementById('detail-seller-name').textContent = seller.name;
    document.getElementById('detail-seller-username').textContent = seller.username;
    document.getElementById('detail-seller-email').textContent = seller.email;
    document.getElementById('detail-seller-phone').textContent = seller.phone;
    document.getElementById('detail-seller-address').textContent = seller.address;
    document.getElementById('detail-seller-date').textContent = new Date(seller.createdAt).toLocaleDateString('id-ID');
    document.getElementById('detail-seller-orders').textContent = totalOrders;
    document.getElementById('detail-seller-revenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;

    document.getElementById('sellerDetailModal').classList.add('show');
}

function closeSellerDetailModal() {
    document.getElementById('sellerDetailModal').classList.remove('show');
    selectedSeller = null;
}

function deleteSeller() {
    if (!selectedSeller) return;

    if (confirm(`Yakin ingin menghapus akun penjual "${selectedSeller.storeName}"?\nSemua data penjualan akan tetap tersimpan.`)) {
        if (confirm('Tekan OK untuk mengkonfirmasi penghapusan')) {
            let sellers = JSON.parse(localStorage.getItem('sellers')) || [];
            sellers = sellers.filter(s => s.id !== selectedSeller.id);
            localStorage.setItem('sellers', JSON.stringify(sellers));

            showNotification('✅ Akun penjual berhasil dihapus!');
            closeSellerDetailModal();
            loadSellersList();
        }
    }
}