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
let currentCategory = null;
let currentSubCategory = null;
let currentSubSubCategory = null;
let recentlyViewed = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Load products with validation
    if (typeof productsData === 'undefined' || !Array.isArray(productsData)) {
        console.error('Products data is not loaded or invalid');
        showErrorMessage('Failed to load product catalog. Please refresh the page.');
        return;
    }
    currentProducts = productsData;

    // Validate categories data
    if (typeof categoriesData === 'undefined' || !categoriesData) {
        console.error('Categories data is not loaded or invalid');
        showErrorMessage('Failed to load categories. Please refresh the page.');
        return;
    }

    try {
        // Setup components
        setupCategoryNavigation();
        setupFilters();
        setupEventListeners();

        // Load saved data
        loadRecentlyViewed();

        // Show welcome message initially (no products)
        showWelcomeMessage();

        // Setup back to top button
        setupBackToTop();

        console.log('Website initialized successfully');
    } catch (error) {
        console.error('Error initializing website:', error);
        showErrorMessage('An error occurred while loading the website. Please refresh the page.');
    }
}

// Show error message to user
function showErrorMessage(message) {
    const mainContent = document.querySelector('.product-area');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #c33; margin-bottom: 16px;"></i>
                <h3 style="color: #c33; margin-bottom: 12px;">Error Loading Page</h3>
                <p style="color: #666;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-sync"></i> Refresh Page
                </button>
            </div>
        `;
    }
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
            <div class="category-card" data-category="${catName}" data-level="main">
                <i class="fas ${icon}"></i>
                <h4>${catData.name_en}</h4>
                <span>${productCount} products</span>
            </div>
        `;
    }
    
    categoryCards.innerHTML = cardsHTML;
    
    // Add click handlers
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent generic handler from interfering
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
    // Home link
    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetToHome();
        });
    }

    // All categories button
    const allCategoriesBtn = document.getElementById('allCategoriesBtn');
    if (allCategoriesBtn) {
        allCategoriesBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('categoriesDropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.category-nav')) {
            const dropdown = document.getElementById('categoriesDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });
    
    // Category links
    document.addEventListener('click', function(e) {
        if (e.target.dataset.category) {
            e.preventDefault();

            // Skip if this is a category with children - handled by specific listener below
            if (e.target.classList.contains('has-children')) {
                return;
            }

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
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Quick search tags
    document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            if (searchInput) {
                searchInput.value = this.dataset.search;
                performSearch();
            }
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
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }

    // Items per page
    const itemsPerPage = document.getElementById('itemsPerPage');
    if (itemsPerPage) {
        itemsPerPage.addEventListener('change', function() {
            productsPerPage = parseInt(this.value);
            currentPage = 1;
            displayProducts();
        });
    }

    // Price filter
    const applyPriceFilter = document.getElementById('applyPriceFilter');
    if (applyPriceFilter) {
        applyPriceFilter.addEventListener('click', applyFilters);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Modal close - using event delegation for all modals
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal')) {
            if (e.target.closest('#productModal')) {
                closeModal();
            } else if (e.target.closest('#authModal')) {
                closeAuthModal();
            }
        }

        // Close modal when clicking on backdrop
        if (e.target.id === 'productModal') {
            closeModal();
        }
    });
    
    // Category tree expand/collapse
    document.querySelectorAll('.category-link.has-children').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent generic category listener from firing

            if (e.target === this) {
                // Toggle subcategories dropdown
                const subcategories = this.nextElementSibling;
                if (subcategories && subcategories.classList.contains('subcategories')) {
                    subcategories.classList.toggle('show');
                    this.classList.toggle('expanded');
                }

                // ALSO select this category to show products
                const category = this.dataset.category;
                const level = this.dataset.level;
                const parent = this.dataset.parent;
                const grandparent = this.dataset.grandparent;

                if (category) {
                    selectCategory(category, level, parent, grandparent);
                }

                // Close dropdown if open
                document.getElementById('categoriesDropdown').classList.remove('show');
            }
        });
    });
}

// Category Selection
function selectCategory(category, level, parent = null, grandparent = null) {
    // Validate inputs
    if (!category || !level) {
        console.error('Invalid category selection:', { category, level });
        return;
    }

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
    } else {
        console.error('Invalid category level:', level);
        return;
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
    if (!breadcrumbTrail) {
        console.warn('Breadcrumb element not found');
        return;
    }

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
    const welcomeMessage = document.getElementById('welcomeMessage');
    const productsContainer = document.getElementById('productsContainer');
    const pagination = document.getElementById('pagination');
    const resultsCount = document.getElementById('resultsCount');

    if (welcomeMessage) welcomeMessage.style.display = 'block';
    if (productsContainer) productsContainer.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
    if (resultsCount) resultsCount.textContent = '0';
}

function hideWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const productsContainer = document.getElementById('productsContainer');

    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (productsContainer) productsContainer.style.display = 'block';
}

// Reset to home state
function resetToHome() {
    // Reset all category state
    currentCategory = null;
    currentSubCategory = null;
    currentSubSubCategory = null;
    filteredProducts = [];
    currentPage = 1;

    // Clear active category highlights
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });

    // Reset breadcrumb
    updateBreadcrumb();

    // Show welcome message
    showWelcomeMessage();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        showWelcomeMessage();
        return;
    }

    filteredProducts = currentProducts.filter(product => {
        const searchableText = [
            product.name_en || '',
            product.name_kr || '',
            product.model_number || '',
            product.manufacturer || '',
            product.category_main_en || '',
            product.category_sub_en || ''
        ].join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
    });

    // Track search in Google Analytics
    trackSearch(searchTerm, filteredProducts.length);

    // Update breadcrumb for search
    const breadcrumbTrail = document.getElementById('breadcrumbTrail');
    if (breadcrumbTrail) {
        breadcrumbTrail.innerHTML = `Search results for "${searchTerm}"`;
    }

    hideWelcomeMessage();
    currentPage = 1;
    displayProducts();
}

// Apply filters
function applyFilters() {
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    const minPrice = parseFloat(minPriceInput?.value) || 0;
    const maxPrice = parseFloat(maxPriceInput?.value) || Infinity;

    // Validate price range
    if (maxPrice !== Infinity && minPrice > maxPrice) {
        showNotification('Minimum price cannot be greater than maximum price');
        if (minPriceInput) minPriceInput.style.borderColor = '#ff0000';
        if (maxPriceInput) maxPriceInput.style.borderColor = '#ff0000';
        setTimeout(() => {
            if (minPriceInput) minPriceInput.style.borderColor = '';
            if (maxPriceInput) maxPriceInput.style.borderColor = '';
        }, 2000);
        return;
    }

    if (minPrice < 0 || (maxPrice !== Infinity && maxPrice < 0)) {
        showNotification('Price values cannot be negative');
        return;
    }

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

        // Condition filter
        if (checkedConditions.length > 0) {
            // Extract condition from product name or specifications
            const productCondition = getProductCondition(product);
            if (!checkedConditions.includes(productCondition)) {
                return false;
            }
        }

        return true;
    });
    
    currentPage = 1;
    displayProducts();
}

// Helper function to get product condition
function getProductCondition(product) {
    // Check product name for condition keywords
    const name = (product.name_en || product.name_kr || '').toLowerCase();

    if (name.includes('[used]') || name.includes('[중고]') || name.includes('used')) {
        return 'used';
    }

    if (name.includes('[new]') || name.includes('[신품]') || name.includes('new')) {
        return 'new';
    }

    if (name.includes('refurbished') || name.includes('재생')) {
        return 'refurbished';
    }

    // Check specifications
    if (product.specifications) {
        try {
            const specs = JSON.parse(product.specifications);
            const condition = (specs.Condition || specs.condition || '').toLowerCase();
            if (condition.includes('new')) return 'new';
            if (condition.includes('refurbished')) return 'refurbished';
        } catch (e) {
            // Ignore parse errors
        }
    }

    // Default to 'used' since most products in catalog are used
    return 'used';
}

// Clear filters
function clearFilters() {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    // Clear all checkboxes except "used" condition (which is default)
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const isUsedConditionCheckbox = cb.name === 'condition' && cb.value === 'used';
        if (!isUsedConditionCheckbox) {
            cb.checked = false;
        } else {
            cb.checked = true; // Ensure "used" is checked
        }
    });

    // Re-apply category filter only (preserve current level)
    if (currentSubSubCategory) {
        selectCategory(currentSubSubCategory, 'subsub', currentSubCategory, currentCategory);
    } else if (currentSubCategory) {
        selectCategory(currentSubCategory, 'sub', currentCategory);
    } else if (currentCategory) {
        selectCategory(currentCategory, 'main');
    } else {
        // If no category selected, show welcome message
        showWelcomeMessage();
    }

    showNotification('Filters cleared');
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

    if (!productsGrid) {
        console.error('Products grid element not found');
        return;
    }

    // Update count
    if (resultsCount) {
        resultsCount.textContent = filteredProducts.length;
    }
    
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
    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.style.display = filteredProducts.length > productsPerPage ? 'flex' : 'none';
    }
}

// Create product card
function createProductCard(product) {
    if (!product) {
        console.warn('Invalid product data');
        return '';
    }

    const name = currentLanguage === 'kr' && product.name_kr ? product.name_kr : (product.name_en || 'Unknown Product');
    const imageUrl = product.images && product.images[0]
        ? `images/products/${product.images[0]}`
        : 'images/no-image.png';

    const isNew = false; // You can add logic to determine if product is new
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${name}" class="product-image" loading="lazy"
                     onerror="this.src='images/no-image.png'; this.classList.add('loaded');"
                     onload="this.classList.add('loaded');">
                ${isNew ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category_sub_en || product.category_main_en || ''}</div>
                <div class="product-name" title="${name}">${name}</div>
                <div class="product-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <div class="product-actions">
                    <button class="btn-details" onclick="showProductModal('${product.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-cart" onclick="contactForProduct('${product.id}')">
                        <i class="fas fa-envelope"></i> Inquire
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
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found');
        return;
    }

    // Track product view in Google Analytics
    trackProductView(product);

    // Add to recently viewed
    addToRecentlyViewed(product);

    const modalTitle = document.getElementById('modalProductTitle');
    const modalContent = document.getElementById('modalContent');
    const productModal = document.getElementById('productModal');

    if (!modalTitle || !modalContent || !productModal) {
        console.error('Modal elements not found');
        showNotification('Unable to display product details');
        return;
    }

    const name = currentLanguage === 'kr' && product.name_kr ? product.name_kr : (product.name_en || 'Unknown Product');
    
    modalTitle.textContent = name;
    
    // Generate modal content
    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
        const mainImage = product.images[0];
        imagesHTML = `
            <div class="product-images-section">
                <img src="images/products/${mainImage}" alt="${name}"
                     class="main-product-image" id="mainProductImage"
                     onerror="this.src='images/no-image.png'"
                     onload="this.style.opacity=1;">
                ${product.images.length > 1 ? `
                    <div class="image-thumbnails">
                        ${product.images.map((img, idx) => `
                            <img src="images/products/${img}" alt="${name}" loading="lazy"
                                 class="thumbnail ${idx === 0 ? 'active' : ''}"
                                 onclick="changeMainImage('${img}', this)"
                                 onerror="this.src='images/no-image.png'"
                                 onload="this.style.opacity=1;">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Show placeholder if no images
        imagesHTML = `
            <div class="product-images-section">
                <img src="images/no-image.png" alt="${name}"
                     class="main-product-image"
                     onload="this.style.opacity=1;">
            </div>
        `;
    }
    
    // Parse specifications
    let specsHTML = '';
    if (product.specifications) {
        try {
            const specs = JSON.parse(product.specifications);

            // Filter out empty or meaningless specs (where both key and value are just "-")
            const validSpecs = Object.entries(specs).filter(([key, value]) => {
                const k = key.trim();
                const v = String(value).trim();
                // Skip if key is "-" or empty, or if value is "-", "N/A", or empty
                return k !== '-' && k !== '' && v !== '-' && v !== '' && v !== 'N/A';
            });

            if (validSpecs.length > 0) {
                specsHTML = `
                    <div class="specifications-section">
                        <h4>Specifications</h4>
                        <table class="specs-table">
                            ${validSpecs.map(([key, value]) => `
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
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${product.category_main_en || 'N/A'}</span>
                    </div>
                </div>
                <div class="modal-price">
                    ${product.price_eur_markup > 0 ? `€${product.price_eur_markup.toFixed(2)}` : 'Contact for Price'}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="contactForProduct('${product.id}')">
                        <i class="fas fa-envelope"></i> Request Quote
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
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.style.display = 'none';
    }
}

// ============================================================================
// SHOPPING CART - NOT IMPLEMENTED
// Site uses inquiry-based ordering via "Request Quote" button
// ============================================================================

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

    if (!container) {
        console.warn('Recently viewed container not found');
        return;
    }

    if (!recentlyViewed || recentlyViewed.length === 0) {
        container.innerHTML = '<p class="empty-message">No items viewed yet</p>';
    } else {
        let html = '<div style="font-size: 12px;">';
        recentlyViewed.forEach(product => {
            if (!product) return;

            const productName = (product.name_en || product.name_kr || 'Unknown Product').substring(0, 30);
            const productPrice = product.price_eur_markup > 0 ? product.price_eur_markup.toFixed(2) : 'N/A';
            const productId = product.id || '';

            html += `
                <div style="margin-bottom: 10px; cursor: pointer;" onclick="showProductModal('${productId}')">
                    <div style="font-weight: bold;">${productName}...</div>
                    <div style="color: var(--primary-blue);">€${productPrice}</div>
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
    if (!product) {
        console.error('Product not found for inquiry:', productId);
        showNotification('Product not found');
        return;
    }

    const productName = product.name_en || product.name_kr || 'Unknown Product';
    const modelNumber = product.model_number || 'N/A';

    const subject = encodeURIComponent(`Inquiry about ${productName} (ID: ${product.id})`);
    const body = encodeURIComponent(`Hello,\n\nI am interested in the following product:\n\nProduct: ${productName}\nModel: ${modelNumber}\nProduct ID: ${product.id}\n\nPlease provide more information.\n\nThank you.`);

    try {
        window.location.href = `mailto:peter.ju@laonlink.com?subject=${subject}&body=${body}`;
    } catch (error) {
        console.error('Error opening email client:', error);
        showNotification('Unable to open email client. Please contact peter.ju@laonlink.com directly.');
    }
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
    const productArea = document.querySelector('.product-area');
    if (productArea) {
        productArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Back to top button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) {
        console.warn('Back to top button not found');
        return;
    }

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
window.showProductModal = showProductModal;
window.changeMainImage = changeMainImage;
window.goToPage = goToPage;
window.contactForProduct = contactForProduct;
window.showNotification = showNotification;
