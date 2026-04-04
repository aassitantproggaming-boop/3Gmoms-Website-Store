// ==================== HALAMAN KERANJANG ====================

document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    setupShippingListener();
    calculateTotal();
});

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cart-items-list');

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <h2>🛒 Keranjang Anda Kosong</h2>
                <p>Mulai belanja sekarang!</p>
                <a href="products.html" class="btn btn-primary">Lihat Produk</a>
            </div>
        `;
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>${formatRupiah(item.price)} per item</p>
                <div class="quantity-control">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantityInput(${item.id}, this.value)">
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-price">Subtotal: ${formatRupiah(item.price * item.quantity)}</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let item = cart.find(p => p.id === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        calculateTotal();
        updateCartCount();
    }
}

function updateQuantityInput(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let item = cart.find(p => p.id === productId);

    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        calculateTotal();
        updateCartCount();
    }
}

function removeFromCart(productId) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        calculateTotal();
        updateCartCount();
        showNotification('Produk dihapus dari keranjang');
    }
}

function calculateTotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shipping = parseInt(document.getElementById('shipping-select').value) || 0;
    let tax = Math.floor(subtotal * 0.1);
    let total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = formatRupiah(subtotal);
    document.getElementById('shipping').textContent = formatRupiah(shipping);
    document.getElementById('tax').textContent = formatRupiah(tax);
    document.getElementById('total').textContent = formatRupiah(total);
}

function setupShippingListener() {
    const shippingSelect = document.getElementById('shipping-select');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', calculateTotal);
    }
}

function goToCheckout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }
    window.location.href = 'checkout.html';
}