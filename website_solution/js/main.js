// Main JavaScript for Industrial Parts Store
// Handles product display, filtering, search, and interactions

// Global variables
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let currentView = 'grid';
let currentLanguage = 'en';
let cart = [];
let currentCategory = null;
let currentFilters = {
    minPrice: null,
    maxPrice: null,
    manufacturers: [],
    condition: ['used'],
    search: ''
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Load all products
    currentProducts = productsData || [];
    filteredProducts = [...currentProducts];
    
    // Setup UI components
    setupCategories();
    setupManufacturerFilter();
    setupEventListeners();
    
    // Load cart from localStorage
    loadCart();
    
    // Display initial products
    displayProducts();
    
    // Check for URL parameters (category, search, etc.)
    handleURLParameters();
}

// Setup category navigation
function setupCategories() {
    const mainCategoriesEl = document.getElementById('mainCategories');
    const categoryTreeEl = document.getElementById('categoryTree');
    const footerCategoriesEl = document.getElementById('footerCategories');
    
    // Build main navigation
    let mainNavHTML = '<li><a href="#" data-category="all">All Products</a></li>';
    
    for (const [catName, catData] of Object.entries(categoriesData)) {
        mainNavHTML += `
            <li>
                <a href="#" data-category="${catName}">${catName}</a>
            </li>
        `;
    }
    
    mainCategoriesEl.innerHTML = mainNavHTML;
    
    // Build category tree in sidebar
    let treeHTML = '<ul class="category-list">';
    
    for (const [catName, catData] of Object.entries(categoriesData)) {
        treeHTML += buildCategoryTree(catName, catData);
    }
    
    treeHTML += '</ul>';
    categoryTreeEl.innerHTML = treeHTML;
    
    // Footer categories (just main categories)
    let footerHTML = '';
    for (const catName of Object.keys(categoriesData).slice(0, 5)) {
        footerHTML += `<li><a href="#" data-category="${catName}">${catName}</a></li>`;
    }
    footerCategoriesEl.innerHTML = footerHTML;
}

function buildCategoryTree(name, data, level = 0) {
    let html = `
        <li class="category-level-${level}">
            <a href="#" data-category="${name}" data-level="${level}">
                ${data.name_en || name}
            </a>
    `;
    
    if (data.subcategories && Object.keys(data.subcategories).length > 0) {
        html += '<ul>';
        for (const [subName, subData] of Object.entries(data.subcategories)) {
            html += buildCategoryTree(subName, subData, level + 1);
        }
        html += '</ul>';
    }
    
    html += '</li>';
    return html;
}

// Setup manufacturer filter
function setupManufacturerFilter() {
    const manufacturerFilterEl = document.getElementById('manufacturerFilter');
    
    let html = '';
    manufacturersData.forEach(manufacturer => {
        if (manufacturer) {
            html += `
                <label>
                    <input type="checkbox" value="${manufacturer}" class="manufacturer-filter">
                    ${manufacturer}
                </label>
            `;
        }
    });
    
    manufacturerFilterEl.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Category navigation
    document.addEventListener('click', function(e) {
        if (e.target.dataset.category) {
            e.preventDefault();
            filterByCategory(e.target.dataset.category);
        }
    });
    
    // Filters
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    
    // View mode toggle
    document.querySelectorAll('.view-mode button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-mode button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            displayProducts();
        });
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortProducts(this.value);
    });
    
    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        currentLanguage = this.value;
        displayProducts();
    });
    
    // Modal close
    document.querySelector('.modal .close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('productModal');
        if (e.target === modal) closeModal();
    });
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    currentFilters.search = searchTerm;
    
    if (!searchTerm) {
        filteredProducts = [...currentProducts];
    } else {
        filteredProducts = currentProducts.filter(product => {
            const searchableText = [
                product.name_en,
                product.name_kr,
                product.model_number,
                product.manufacturer,
                product.category_main_en,
                product.category_sub_en
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
    
    currentPage = 1;
    displayProducts();
    updateBreadcrumb('Search: ' + searchTerm);
}

// Category filtering
function filterByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredProducts = [...currentProducts];
        updateBreadcrumb('All Products');
    } else {
        filteredProducts = currentProducts.filter(product => {
            return product.category_main_en === category ||
                   product.category_sub_en === category ||
                   product.category_subsub_en === category;
        });
        updateBreadcrumb(category);
    }
    
    // Highlight active category in sidebar
    document.querySelectorAll('.category-list a').forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.dataset.category === category) {
            link.parentElement.classList.add('active');
        }
    });
    
    currentPage = 1;
    displayProducts();
}

// Apply filters
function applyFilters() {
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    
    const selectedManufacturers = Array.from(document.querySelectorAll('.manufacturer-filter:checked'))
        .map(cb => cb.value);
    
    const selectedConditions = Array.from(document.querySelectorAll('.filter-group input[type="checkbox"]:checked'))
        .map(cb => cb.value)
        .filter(val => ['new', 'used', 'refurbished'].includes(val));
    
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
    currentFilters.manufacturers = selectedManufacturers;
    currentFilters.condition = selectedConditions;
    
    // Start with current category or all products
    let baseProducts = currentCategory && currentCategory !== 'all' 
        ? currentProducts.filter(p => 
            p.category_main_en === currentCategory ||
            p.category_sub_en === currentCategory ||
            p.category_subsub_en === currentCategory)
        : currentProducts;
    
    // Apply filters
    filteredProducts = baseProducts.filter(product => {
        // Price filter
        if (product.price_eur_markup < minPrice || product.price_eur_markup > maxPrice) {
            return false;
        }
        
        // Manufacturer filter
        if (selectedManufacturers.length > 0 && !selectedManufacturers.includes(product.manufacturer)) {
            return false;
        }
        
        // For demo, all products are marked as 'used' since they're from the scraped data
        // In real implementation, you'd have a condition field
        
        return true;
    });
    
    currentPage = 1;
    displayProducts();
}

// Sort products
function sortProducts(sortBy) {
    switch(sortBy) {
        case 'name-asc':
            filteredProducts.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => (b.name_en || '').localeCompare(a.name_en || ''));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price_eur_markup - b.price_eur_markup);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price_eur_markup - a.price_eur_markup);
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.scraped_at) - new Date(a.scraped_at));
            break;
        default:
            // relevance - no change
    }
    
    displayProducts();
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update results count
    resultsCount.textContent = filteredProducts.length;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Set view class
    productsGrid.className = currentView === 'list' ? 'products-list' : 'products-grid';
    
    // Generate product cards
    let html = '';
    pageProducts.forEach(product => {
        html += createProductCard(product);
    });
    
    productsGrid.innerHTML = html || '<p>No products found.</p>';
    
    // Setup product card click events
    setupProductCardEvents();
    
    // Update pagination
    updatePagination();
}

// Create product card HTML
function createProductCard(product) {
    const name = currentLanguage === 'kr' ? product.name_kr : product.name_en;
    const category = currentLanguage === 'kr' ? product.category_main_kr : product.category_main_en;
    const imageUrl = product.images && product.images[0] 
        ? `images/products/${product.images[0]}` 
        : 'images/no-image.png';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${imageUrl}" alt="${name}" class="product-image" onerror="this.src='images/no-image.png'">
            <div class="product-info">
                <div class="product-category">${category || 'Uncategorized'}</div>
                <h3 class="product-name">${name || 'Product Name'}</h3>
                <div class="product-model">${product.model_number || 'No Model'}</div>
                <div class="product-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-view-details" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup product card events
function setupProductCardEvents() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            addToCart(this.dataset.productId);
        });
    });
    
    // View details buttons
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showProductModal(this.dataset.productId);
        });
    });
    
    // Card click
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            showProductModal(this.dataset.productId);
        });
    });
}

// Show product modal
function showProductModal(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    const name = currentLanguage === 'kr' ? product.name_kr : product.name_en;
    const specs = product.specifications ? JSON.parse(product.specifications) : {};
    
    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
        const mainImage = product.images[0];
        imagesHTML = `
            <div class="product-modal-images">
                <div class="main-image">
                    <img src="images/products/${mainImage}" alt="${name}" id="mainProductImage" onerror="this.src='images/no-image.png'">
                </div>
                ${product.images.length > 1 ? `
                    <div class="image-thumbnails">
                        ${product.images.map((img, idx) => `
                            <img src="images/products/${img}" alt="${name}" 
                                 class="${idx === 0 ? 'active' : ''}"
                                 onclick="changeMainImage('${img}')"
                                 onerror="this.src='images/no-image.png'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    let specsHTML = '';
    if (Object.keys(specs).length > 0) {
        specsHTML = `
            <div class="product-modal-specs">
                <h3>Specifications</h3>
                <table class="specs-table">
                    ${Object.entries(specs).map(([key, value]) => `
                        <tr>
                            <th>${key}</th>
                            <td>${value}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <div class="product-modal-content">
            ${imagesHTML}
            <div class="product-modal-details">
                <h2>${name}</h2>
                <div class="product-modal-meta">
                    <div class="meta-item">
                        <label>Model Number</label>
                        <span>${product.model_number || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <label>Manufacturer</label>
                        <span>${product.manufacturer || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <label>Category</label>
                        <span>${product.category_main_en || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <label>Product ID</label>
                        <span>${product.id}</span>
                    </div>
                </div>
                <div class="product-modal-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <button class="btn-primary" onclick="addToCart('${product.id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                ${specsHTML}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Change main image in modal
function changeMainImage(imageSrc) {
    document.getElementById('mainProductImage').src = `images/products/${imageSrc}`;
    
    // Update active thumbnail
    document.querySelectorAll('.image-thumbnails img').forEach(img => {
        img.classList.remove('active');
        if (img.src.includes(imageSrc)) {
            img.classList.add('active');
        }
    });
}

// Close modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Cart functionality
function addToCart(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Check if already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    
    // Show notification
    showNotification(`${product.name_en} added to cart!`);
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 2000;
            display: none;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Update breadcrumb
function updateBreadcrumb(current) {
    const breadcrumbTrail = document.getElementById('breadcrumbTrail');
    if (current) {
        breadcrumbTrail.innerHTML = ` > ${current}`;
    } else {
        breadcrumbTrail.innerHTML = '';
    }
}

// Pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (startPage > 1) {
        html += `<button onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<button disabled>...</button>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<button disabled>...</button>`;
        html += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle URL parameters
function handleURLParameters() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('category')) {
        filterByCategory(params.get('category'));
    }
    
    if (params.has('search')) {
        document.getElementById('searchInput').value = params.get('search');
        performSearch();
    }
    
    if (params.has('product')) {
        showProductModal(params.get('product'));
    }
}

// Make functions globally available
window.goToPage = goToPage;
window.addToCart = addToCart;
window.changeMainImage = changeMainImage;