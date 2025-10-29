// LaonLinkAB Main JavaScript - SHMarket Style
// Category-based navigation without showing all products

// ============================================================================
// Google Analytics Tracking Functions
// ============================================================================

function trackEvent(eventName, params) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }
}

function trackProductView(product) {
    trackEvent('view_item', {
        currency: 'EUR',
        value: product.price_eur_markup,
        items: [{
            item_id: product.id,
            item_name: currentLanguage === 'en' ? product.name_en : product.name_kr,
            item_category: product.category_main_en,
            item_category2: product.category_sub_en,
            price: product.price_eur_markup
        }]
    });
}

function trackAddToCart(product, quantity) {
    trackEvent('add_to_cart', {
        currency: 'EUR',
        value: product.price_eur_markup * quantity,
        items: [{
            item_id: product.id,
            item_name: currentLanguage === 'en' ? product.name_en : product.name_kr,
            item_category: product.category_main_en,
            price: product.price_eur_markup,
            quantity: quantity
        }]
    });
}

function trackSearch(searchTerm, resultsCount) {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
}

function trackCategoryView(category, level) {
    trackEvent('view_category', {
        category_name: category,
        category_level: level
    });
}

// ============================================================================
// Global variables
// ============================================================================
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let currentView = 'grid';
let currentLanguage = 'en';
let cart = [];
let currentCategory = null;
let currentSubCategory = null;
let currentSubSubCategory = null;
let recentlyViewed = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Load products
    currentProducts = productsData || [];
    
    // Setup components
    setupCategoryNavigation();
    setupFilters();
    setupEventListeners();
    
    // Load saved data
    loadCart();
    loadRecentlyViewed();
    
    // Show welcome message initially (no products)
    showWelcomeMessage();
    
    // Setup back to top button
    setupBackToTop();
}

// Category Navigation Setup
function setupCategoryNavigation() {
    // Build main navigation
    buildMainNavigation();
    
    // Build category tree in sidebar
    buildCategoryTree();
    
    // Build category dropdown
    buildCategoryDropdown();
    
    // Build footer categories
    buildFooterCategories();
    
    // Build category cards on welcome page
    buildCategoryCards();
}

function buildMainNavigation() {
    const mainNavLinks = document.getElementById('mainNavLinks');
    let navHTML = '';
    
    // Add main category links (limit to first 5)
    let count = 0;
    for (const [catName, catData] of Object.entries(categoriesData)) {
        if (count >= 5) break;
        navHTML += `<a href="#" data-category="${catName}" data-level="main">${catData.name_en}</a>`;
        count++;
    }
    
    mainNavLinks.innerHTML = navHTML;
}

function buildCategoryTree() {
    const categoryTree = document.getElementById('categoryTree');
    let treeHTML = '';
    
    for (const [mainCat, mainData] of Object.entries(categoriesData)) {
        treeHTML += `
            <div class="category-item">
                <a href="#" class="category-link ${Object.keys(mainData.subcategories || {}).length > 0 ? 'has-children' : ''}" 
                   data-category="${mainCat}" data-level="main">
                    ${mainData.name_en}
                </a>
        `;
        
        if (mainData.subcategories && Object.keys(mainData.subcategories).length > 0) {
            treeHTML += '<div class="subcategories">';
            
            for (const [subCat, subData] of Object.entries(mainData.subcategories)) {
                treeHTML += `
                    <div class="category-item">
                        <a href="#" class="category-link subcategory-link ${Object.keys(subData.subcategories || {}).length > 0 ? 'has-children' : ''}" 
                           data-category="${subCat}" data-level="sub" data-parent="${mainCat}">
                            ${subData.name_en}
                        </a>
                `;
                
                if (subData.subcategories && Object.keys(subData.subcategories).length > 0) {
                    treeHTML += '<div class="subcategories">';
                    
                    for (const [subSubCat, subSubData] of Object.entries(subData.subcategories)) {
                        treeHTML += `
                            <div class="category-item">
                                <a href="#" class="category-link subsubcategory-link" 
                                   data-category="${subSubCat}" data-level="subsub" 
                                   data-parent="${subCat}" data-grandparent="${mainCat}">
                                    ${subSubData.name_en}
                                </a>
                            </div>
                        `;
                    }
                    
                    treeHTML += '</div>';
                }
                
                treeHTML += '</div>';
            }
            
            treeHTML += '</div>';
        }
        
        treeHTML += '</div>';
    }
    
    categoryTree.innerHTML = treeHTML;
}

function buildCategoryDropdown() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    let gridHTML = '';
    
    for (const [mainCat, mainData] of Object.entries(categoriesData)) {
        gridHTML += `
            <div class="dropdown-category">
                <h4><a href="#" data-category="${mainCat}" data-level="main">${mainData.name_en}</a></h4>
                <ul>
        `;
        
        if (mainData.subcategories) {
            let subCount = 0;
            for (const [subCat, subData] of Object.entries(mainData.subcategories)) {
                if (subCount >= 5) break; // Limit subcategories shown
                gridHTML += `
                    <li><a href="#" data-category="${subCat}" data-level="sub" data-parent="${mainCat}">
                        ${subData.name_en}
                    </a></li>
                `;
                subCount++;
            }
        }
        
        gridHTML += '</ul></div>';
    }
    
    categoriesGrid.innerHTML = gridHTML;
}

function buildFooterCategories() {
    const footerCategories = document.getElementById('footerCategories');
    let footerHTML = '';
    
    let count = 0;
    for (const [catName, catData] of Object.entries(categoriesData)) {
        if (count >= 5) break;
        footerHTML += `<li><a href="#" data-category="${catName}" data-level="main">${catData.name_en}</a></li>`;
        count++;
    }
    
    footerCategories.innerHTML = footerHTML;
}

function buildCategoryCards() {
    const categoryCards = document.getElementById('categoryCards');
    let cardsHTML = '';
    
    // Create cards for main categories
    for (const [catName, catData] of Object.entries(categoriesData)) {
        const productCount = currentProducts.filter(p => p.category_main_en === catName).length;
        const icon = getCategoryIcon(catName);
        
        cardsHTML += `
            <div class="category-card" data-category="${catName}">
                <i class="fas ${icon}"></i>
                <h4>${catData.name_en}</h4>
                <span>${productCount} products</span>
            </div>
        `;
    }
    
    categoryCards.innerHTML = cardsHTML;
    
    // Add click handlers
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            selectCategory(this.dataset.category, 'main');
        });
    });
}

function getCategoryIcon(category) {
    const icons = {
        'PLC': 'fa-microchip',
        'Servo motor/servo driver': 'fa-cogs',
        'Stepping motor/driver/BLDC': 'fa-gear',
        'HMI': 'fa-desktop',
        'INVERTER': 'fa-bolt',
        'SENSOR': 'fa-radar'
    };
    return icons[category] || 'fa-cube';
}

// Setup Filters
function setupFilters() {
    // Manufacturer filter
    const manufacturerFilter = document.getElementById('manufacturerFilter');
    const manufacturers = [...new Set(currentProducts.map(p => p.manufacturer).filter(m => m))];
    
    let filterHTML = '';
    manufacturers.sort().forEach(manufacturer => {
        filterHTML += `
            <label class="filter-option">
                <input type="checkbox" name="manufacturer" value="${manufacturer}">
                <span>${manufacturer}</span>
            </label>
        `;
    });
    
    manufacturerFilter.innerHTML = filterHTML;
}

// Event Listeners
function setupEventListeners() {
    // All categories button
    document.getElementById('allCategoriesBtn').addEventListener('click', function() {
        const dropdown = document.getElementById('categoriesDropdown');
        dropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.category-nav')) {
            document.getElementById('categoriesDropdown').classList.remove('show');
        }
    });
    
    // Category links
    document.addEventListener('click', function(e) {
        if (e.target.dataset.category) {
            e.preventDefault();
            const category = e.target.dataset.category;
            const level = e.target.dataset.level;
            const parent = e.target.dataset.parent;
            const grandparent = e.target.dataset.grandparent;
            
            selectCategory(category, level, parent, grandparent);
            
            // Close dropdown if open
            document.getElementById('categoriesDropdown').classList.remove('show');
        }
    });
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Quick search tags
    document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('searchInput').value = this.dataset.search;
            performSearch();
        });
    });
    
    // View mode
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            displayProducts();
        });
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortProducts(this.value);
    });
    
    // Items per page
    document.getElementById('itemsPerPage').addEventListener('change', function() {
        productsPerPage = parseInt(this.value);
        currentPage = 1;
        displayProducts();
    });
    
    // Price filter
    document.getElementById('applyPriceFilter').addEventListener('click', applyFilters);
    
    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        currentLanguage = this.value;
        displayProducts();
    });
    
    // Modal close
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('productModal');
        if (e.target === modal) closeModal();
    });
    
    // Category tree expand/collapse
    document.querySelectorAll('.category-link.has-children').forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.target === this) {
                // Toggle subcategories dropdown
                const subcategories = this.nextElementSibling;
                if (subcategories && subcategories.classList.contains('subcategories')) {
                    subcategories.classList.toggle('show');
                    this.classList.toggle('expanded');
                }

                // ALSO select this category to show products
                // This was missing - categories with subcategories should still be selectable
                const category = this.dataset.category;
                const level = this.dataset.level;
                const parent = this.dataset.parent;
                const grandparent = this.dataset.grandparent;

                if (category) {
                    selectCategory(category, level, parent, grandparent);
                }
            }
        });
    });
}

// Category Selection
function selectCategory(category, level, parent = null, grandparent = null) {
    // Update current category
    if (level === 'main') {
        currentCategory = category;
        currentSubCategory = null;
        currentSubSubCategory = null;
    } else if (level === 'sub') {
        currentCategory = parent;
        currentSubCategory = category;
        currentSubSubCategory = null;
    } else if (level === 'subsub') {
        currentCategory = grandparent;
        currentSubCategory = parent;
        currentSubSubCategory = category;
    }
    
    // Filter products
    filteredProducts = currentProducts.filter(product => {
        if (level === 'main') {
            return product.category_main_en === category;
        } else if (level === 'sub') {
            return product.category_sub_en === category;
        } else if (level === 'subsub') {
            return product.category_subsub_en === category;
        }
        return false;
    });

    // Track category view in Google Analytics
    trackCategoryView(category, level);

    // Update UI
    updateBreadcrumb();
    highlightActiveCategory(category);
    hideWelcomeMessage();
    currentPage = 1;
    displayProducts();
}

// Update breadcrumb
function updateBreadcrumb() {
    const breadcrumbTrail = document.getElementById('breadcrumbTrail');
    let trail = '';
    
    if (currentCategory) {
        trail = `<a href="#" data-category="${currentCategory}" data-level="main">${currentCategory}</a>`;
        
        if (currentSubCategory) {
            trail += ` <span class="separator">></span> `;
            trail += `<a href="#" data-category="${currentSubCategory}" data-level="sub" data-parent="${currentCategory}">${currentSubCategory}</a>`;
            
            if (currentSubSubCategory) {
                trail += ` <span class="separator">></span> `;
                trail += `<span>${currentSubSubCategory}</span>`;
            }
        }
    } else {
        trail = 'Select a Category';
    }
    
    breadcrumbTrail.innerHTML = trail;
}

// Highlight active category
function highlightActiveCategory(category) {
    // Remove all active classes
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to selected
    document.querySelectorAll(`.category-link[data-category="${category}"]`).forEach(link => {
        link.classList.add('active');
    });
}

// Show/Hide welcome message
function showWelcomeMessage() {
    document.getElementById('welcomeMessage').style.display = 'block';
    document.getElementById('productsContainer').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('resultsCount').textContent = '0';
}

function hideWelcomeMessage() {
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('productsContainer').style.display = 'block';
}

// Search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        showWelcomeMessage();
        return;
    }
    
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

    // Track search in Google Analytics
    trackSearch(searchTerm, filteredProducts.length);

    // Update breadcrumb for search
    document.getElementById('breadcrumbTrail').innerHTML = `Search results for "${searchTerm}"`;

    hideWelcomeMessage();
    currentPage = 1;
    displayProducts();
}

// Apply filters
function applyFilters() {
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    
    const checkedManufacturers = Array.from(document.querySelectorAll('input[name="manufacturer"]:checked'))
        .map(cb => cb.value);
    
    const checkedConditions = Array.from(document.querySelectorAll('input[name="condition"]:checked'))
        .map(cb => cb.value);
    
    // Start with current category products or all
    let baseProducts = [];
    if (currentCategory) {
        baseProducts = currentProducts.filter(product => {
            if (currentSubSubCategory) {
                return product.category_subsub_en === currentSubSubCategory;
            } else if (currentSubCategory) {
                return product.category_sub_en === currentSubCategory;
            } else {
                return product.category_main_en === currentCategory;
            }
        });
    } else {
        baseProducts = [...currentProducts];
    }
    
    // Apply filters
    filteredProducts = baseProducts.filter(product => {
        // Price filter
        if (product.price_eur_markup < minPrice || product.price_eur_markup > maxPrice) {
            return false;
        }
        
        // Manufacturer filter
        if (checkedManufacturers.length > 0 && !checkedManufacturers.includes(product.manufacturer)) {
            return false;
        }
        
        // Condition filter (all products are used for now)
        // Add condition logic if needed
        
        return true;
    });
    
    currentPage = 1;
    displayProducts();
}

// Clear filters
function clearFilters() {
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.name !== 'condition' || cb.value !== 'used') {
            cb.checked = false;
        }
    });
    
    // Re-apply category filter only
    if (currentCategory) {
        selectCategory(currentCategory, 'main');
    }
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
    }
    
    displayProducts();
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update count
    resultsCount.textContent = filteredProducts.length;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Set view class
    productsGrid.className = currentView === 'list' ? 'products-list' : 'products-grid';
    
    // Generate HTML
    let html = '';
    pageProducts.forEach(product => {
        html += createProductCard(product);
    });
    
    productsGrid.innerHTML = html || '<p style="text-align: center; padding: 40px;">No products found in this category.</p>';
    
    // Add event listeners to product cards
    setupProductCardEvents();
    
    // Update pagination
    updatePagination();
    
    // Show/hide pagination
    document.getElementById('pagination').style.display = filteredProducts.length > productsPerPage ? 'flex' : 'none';
}

// Create product card
function createProductCard(product) {
    const name = currentLanguage === 'kr' && product.name_kr ? product.name_kr : product.name_en;
    const imageUrl = product.images && product.images[0] 
        ? `images/products/${product.images[0]}` 
        : 'images/no-image.png';
    
    const isNew = false; // You can add logic to determine if product is new
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${name}" class="product-image" onerror="this.src='images/no-image.png'">
                ${isNew ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category_sub_en || product.category_main_en || ''}</div>
                <div class="product-name" title="${name}">${name}</div>
                <div class="product-model">${product.model_number || 'No Model'}</div>
                <div class="product-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <div class="product-actions">
                    <button class="btn-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                    <button class="btn-details" onclick="showProductModal('${product.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup product card events
function setupProductCardEvents() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                showProductModal(this.dataset.productId);
            }
        });
    });
}

// Show product modal
function showProductModal(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    // Track product view in Google Analytics
    trackProductView(product);

    // Add to recently viewed
    addToRecentlyViewed(product);
    
    const modalTitle = document.getElementById('modalProductTitle');
    const modalContent = document.getElementById('modalContent');
    
    const name = currentLanguage === 'kr' && product.name_kr ? product.name_kr : product.name_en;
    
    modalTitle.textContent = name;
    
    // Generate modal content
    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
        const mainImage = product.images[0];
        imagesHTML = `
            <div class="product-images-section">
                <img src="images/products/${mainImage}" alt="${name}" 
                     class="main-product-image" id="mainProductImage" 
                     onerror="this.src='images/no-image.png'">
                ${product.images.length > 1 ? `
                    <div class="image-thumbnails">
                        ${product.images.map((img, idx) => `
                            <img src="images/products/${img}" alt="${name}" 
                                 class="thumbnail ${idx === 0 ? 'active' : ''}"
                                 onclick="changeMainImage('${img}', this)"
                                 onerror="this.src='images/no-image.png'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Parse specifications
    let specsHTML = '';
    if (product.specifications) {
        try {
            const specs = JSON.parse(product.specifications);
            if (Object.keys(specs).length > 0) {
                specsHTML = `
                    <div class="specifications-section">
                        <h4>Specifications</h4>
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
        } catch (e) {
            console.error('Error parsing specifications:', e);
        }
    }
    
    modalContent.innerHTML = `
        <div class="product-modal-grid">
            ${imagesHTML}
            <div class="product-details-section">
                <h3>${name}</h3>
                <div class="product-meta">
                    <div class="meta-row">
                        <span class="meta-label">Product ID:</span>
                        <span class="meta-value">${product.id}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Model:</span>
                        <span class="meta-value">${product.model_number || 'N/A'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Manufacturer:</span>
                        <span class="meta-value">${product.manufacturer || 'N/A'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${product.category_main_en || 'N/A'}</span>
                    </div>
                </div>
                <div class="modal-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-secondary" onclick="contactForProduct('${product.id}')">
                        <i class="fas fa-envelope"></i> Inquire
                    </button>
                </div>
                ${specsHTML}
            </div>
        </div>
    `;
    
    // Show modal
    document.getElementById('productModal').style.display = 'block';
}

// Change main image in modal
function changeMainImage(imageSrc, thumbElement) {
    document.getElementById('mainProductImage').src = `images/products/${imageSrc}`;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbElement.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Cart functions
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

    // Track add to cart in Google Analytics
    trackAddToCart(product, 1);

    saveCart();
    updateCartUI();
    showNotification(`${product.name_en} added to cart!`);
}

function saveCart() {
    localStorage.setItem('laonlink_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('laonlink_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Recently viewed
function addToRecentlyViewed(product) {
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);
    
    // Add to beginning
    recentlyViewed.unshift(product);
    
    // Keep only last 5
    recentlyViewed = recentlyViewed.slice(0, 5);
    
    // Save and update UI
    saveRecentlyViewed();
    updateRecentlyViewedUI();
}

function saveRecentlyViewed() {
    localStorage.setItem('laonlink_recently_viewed', JSON.stringify(recentlyViewed));
}

function loadRecentlyViewed() {
    const saved = localStorage.getItem('laonlink_recently_viewed');
    if (saved) {
        recentlyViewed = JSON.parse(saved);
        updateRecentlyViewedUI();
    }
}

function updateRecentlyViewedUI() {
    const container = document.getElementById('recentlyViewed');
    
    if (recentlyViewed.length === 0) {
        container.innerHTML = '<p class="empty-message">No items viewed yet</p>';
    } else {
        let html = '<div style="font-size: 12px;">';
        recentlyViewed.forEach(product => {
            html += `
                <div style="margin-bottom: 10px; cursor: pointer;" onclick="showProductModal('${product.id}')">
                    <div style="font-weight: bold;">${product.name_en.substring(0, 30)}...</div>
                    <div style="color: var(--primary-blue);">€${product.price_eur_markup.toFixed(2)}</div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }
}

// Contact for product
function contactForProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    const subject = encodeURIComponent(`Inquiry about ${product.name_en} (ID: ${product.id})`);
    const body = encodeURIComponent(`Hello,\n\nI am interested in the following product:\n\nProduct: ${product.name_en}\nModel: ${product.model_number}\nProduct ID: ${product.id}\n\nPlease provide more information.\n\nThank you.`);
    
    window.location.href = `mailto:peter.ju@laonlink.com?subject=${subject}&body=${body}`;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
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
    
    // Scroll to top of products
    document.querySelector('.product-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Back to top button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Make functions globally available
window.addToCart = addToCart;
window.showProductModal = showProductModal;
window.changeMainImage = changeMainImage;
window.goToPage = goToPage;
window.contactForProduct = contactForProduct;
