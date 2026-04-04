// ==================== HALAMAN PRODUK ====================

let filteredProducts = [...products];

document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    setupFilters();
});

function displayProducts(productsToDisplay) {
    const grid = document.getElementById('products-grid');
    
    if (productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Produk tidak ditemukan</p>';
        return;
    }

    grid.innerHTML = productsToDisplay.map(product => `
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

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    // Search dengan DEBOUNCING
    let searchTimeout;
    searchInput.addEventListener('keyup', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterAndSort();
        }, 300);
    });

    categoryFilter.addEventListener('change', filterAndSort);
    sortSelect.addEventListener('change', filterAndSort);
}

function filterAndSort() {
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    const categoryValue = document.getElementById('category-filter').value;
    const sortValue = document.getElementById('sort-select').value;

    // Filter
    filteredProducts = products.filter(product => {
        let matchSearch = product.name.toLowerCase().includes(searchValue) || 
                         product.description.toLowerCase().includes(searchValue);
        let matchCategory = !categoryValue || product.category === categoryValue;
        return matchSearch && matchCategory;
    });

    // Sort
    switch(sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    displayProducts(filteredProducts);
}