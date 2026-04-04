// Di awal file checkout.js, ganti DOMContentLoaded section dengan:
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('❌ Anda harus login terlebih dahulu!');
        window.location.href = 'index.html';
        return;
    }
    
    // Pre-fill form dengan data user
    document.getElementById('name').value = currentUser.name;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('phone').value = currentUser.phone;
    
    displayCheckoutItems();
    displayCheckoutSummary();
    setupFormSubmit();
    updateAuthUI();
});


// ==================== HALAMAN CHECKOUT ====================

document.addEventListener('DOMContentLoaded', function() {
    displayCheckoutItems();
    displayCheckoutSummary();
    setupFormSubmit();
});

function displayCheckoutItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItemsDiv = document.getElementById('checkout-items');

    checkoutItemsDiv.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>${formatRupiah(item.price * item.quantity)}</span>
        </div>
    `).join('');
}

function displayCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shipping = 0; // Default gratis
    let tax = Math.floor(subtotal * 0.1);
    let total = subtotal + shipping + tax;

    document.getElementById('checkout-subtotal').textContent = formatRupiah(subtotal);
    document.getElementById('checkout-shipping').textContent = formatRupiah(shipping);
    document.getElementById('checkout-tax').textContent = formatRupiah(tax);
    document.getElementById('checkout-total').textContent = formatRupiah(total);
}

function setupFormSubmit() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validasi form
        if (!validateForm()) return;

        // Ambil data form
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postal: document.getElementById('postal').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            cart: JSON.parse(localStorage.getItem('cart')) || [],
            orderDate: new Date().toISOString(),
            status: 'pending'
        };

        // Generate Order ID
        const orderId = 'ORD-' + Date.now();
        formData.orderId = orderId;

        // Simpan order ke localStorage
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(formData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Hapus cart
        localStorage.removeItem('cart');
        updateCartCount();

        // Tampilkan pesan sukses dan arahkan
        alert(`✅ Pesanan berhasil dibuat!\n\nNomor Pesanan: ${orderId}\n\nTerima kasih telah berbelanja!`);
        window.location.href = 'order-history.html';
    });
}

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postal = document.getElementById('postal').value.trim();
    const errorDiv = document.getElementById('error-message');

    errorDiv.classList.remove('show');
    errorDiv.innerHTML = '';

    // Validasi nama
    if (!name) {
        showError('❌ Nama lengkap harus diisi!');
        return false;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('❌ Email tidak valid!');
        return false;
    }

    // Validasi nomor HP
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(phone)) {
        showError('❌ Nomor HP tidak valid (gunakan format 0821... atau +62...)');
        return false;
    }

    // Validasi alamat
    if (!address || address.length < 10) {
        showError('❌ Alamat harus diisi dengan lengkap (minimal 10 karakter)!');
        return false;
    }

    // Validasi kota
    if (!city) {
        showError('❌ Kota/Kabupaten harus diisi!');
        return false;
    }

    // Validasi kode pos
    if (!postal || !/^\d{5}$/.test(postal)) {
        showError('❌ Kode pos harus 5 digit!');
        return false;
    }

    return true;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = message;
    errorDiv.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}