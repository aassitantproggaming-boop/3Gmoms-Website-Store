// ==================== FUNGSI GLOBAL ====================

// Ambil produk data (simulasi database)
const products = [
    {
        id: 1,
        name: 'Nasi Goreng',
        price: 15000,
        category: 'lauk',
        description: 'Nasi goreng spesial dengan telur, ayam, dan sayuran pilihan',
        image: 'https://via.placeholder.com/600x600?text=Nasi+Goreng',
        rating: 5.0
    },
    {
        id: 2,
        name: 'Mie Goreng',
        price: 20000,
        category: 'lauk',
        description: 'Mie goreng lezat dengan bumbu khas',
        image: 'https://via.placeholder.com/600x600?text=Mie+Goreng',
        rating: 4.3
    },
    {
        id: 3,
        name: 'Ayam Goreng',
        price: 35000,
        category: 'lauk',
        description: 'Ayam goreng crispy dengan sambal',
        image: 'https://via.placeholder.com/600x600?text=Ayam+Goreng',
        rating: 4.8
    },
    {
        id: 4,
        name: 'Krupuk',
        price: 5000,
        category: 'snack',
        description: 'Krupuk renyah dan gurih',
        image: 'https://via.placeholder.com/600x600?text=Krupuk',
        rating: 4.0
    },
    {
        id: 5,
        name: 'Tahu Goreng',
        price: 15000,
        category: 'lauk',
        description: 'Tahu goreng golden dengan kecap manis',
        image: 'https://via.placeholder.com/600x600?text=Tahu+Goreng',
        rating: 4.4
    },
    {
        id: 6,
        name: 'Bakso',
        price: 30000,
        category: 'lauk',
        description: 'Bakso lezat dengan kuah gurih',
        image: 'https://via.placeholder.com/600x600?text=Bakso',
        rating: 4.6
    },
    {
        id: 7,
        name: 'Jus Jeruk',
        price: 10000,
        category: 'minuman',
        description: 'Jus jeruk segar tanpa gula',
        image: 'https://via.placeholder.com/600x600?text=Jus+Jeruk',
        rating: 4.2
    },
    {
        id: 8,
        name: 'Pisang Goreng',
        price: 8000,
        category: 'snack',
        description: 'Pisang goreng renyah dengan madu',
        image: 'https://via.placeholder.com/600x600?text=Pisang+Goreng',
        rating: 4.7
    }
];

// ==================== CAROUSEL LOGIC ====================
let currentSlide = 0;
let carouselInterval;

function initCarousel() {
    const container = document.getElementById('carouselContainer');
    const indicators = document.getElementById('carouselIndicators');

    if (!container) return;

    // Buat slides
    container.innerHTML = products.map((product, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}">
            <img src="${product.image}" alt="${product.name}">
            <div class="carousel-slide-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            </div>
        </div>
    `).join('');

    // Buat indicators
    indicators.innerHTML = products.map((_, index) => `
        <div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
    `).join('');

    // Auto play
    startCarousel();
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    // Wrap around
    if (n >= slides.length) currentSlide = 0;
    if (n < 0) currentSlide = slides.length - 1;

    // Update slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
    restartCarousel();
}

function prevSlide() {
    currentSlide--;
    showSlide(currentSlide);
    restartCarousel();
}

function goToSlide(n) {
    currentSlide = n;
    showSlide(currentSlide);
    restartCarousel();
}

function startCarousel() {
    carouselInterval = setInterval(() => {
        currentSlide++;
        showSlide(currentSlide);
    }, 5000); // Ganti slide setiap 5 detik
}

function restartCarousel() {
    clearInterval(carouselInterval);
    startCarousel();
}

// Update cart count di navbar
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Format rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Buat rating stars
function createRatingStars(rating) {
    let stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `<span class="product-rating">${stars} ${rating}</span>`;
}

// Tambah ke cart
function addToCart(productId) {
    let product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Tampilkan notifikasi
    showNotification(`${product.name} ditambahkan ke keranjang!`);
}

// Tampilkan notifikasi
function showNotification(message) {
    let notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
    }

    updateCartCount();

    // Inisialisasi carousel
    initCarousel();

    // Tampilkan produk featured di home
    const featuredItems = document.getElementById('featured-items');
    if (featuredItems) {
        featuredItems.innerHTML = products.slice(0, 4).map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    ${createRatingStars(product.rating)}
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${formatRupiah(product.price)}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        🛒 Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `).join('');
    }
});