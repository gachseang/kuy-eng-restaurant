const API_URL = '/api';
let categories = [];
let menus = [];
let filteredMenus = [];

// ============ INITIALIZATION ============

$(document).ready(function() {
  loadData();
});

function loadData() {
  // Load both categories and menus
  $.when(
    $.ajax({ url: `${API_URL}/categories`, method: 'GET' }),
    $.ajax({ url: `${API_URL}/menus`, method: 'GET' })
  ).done(function(categoriesRes, menusRes) {
    if (categoriesRes[0].success) {
      categories = categoriesRes[0].categories;
      populateCategoryFilter();
    }
    
    if (menusRes[0].success) {
      menus = menusRes[0].menus;
      // Filter out unavailable items on initial load
      filteredMenus = menus.filter(m => m.available !== false);
      // Create tabs AFTER menus are loaded
      createCategoryTabs();
      displayMenu();
    }
  }).fail(function() {
    $('#menuContainer').html('<p class="error-message">Failed to load menu. Please try refreshing the page.</p>');
  });
}

// ============ CATEGORY TABS ============

function createCategoryTabs() {
  const $tabs = $('#categoryTabs');
  $tabs.empty();

  // Add "All" tab
  $tabs.append(`
    <button class="category-tab active" data-category="">
      All Items
    </button>
  `);

  // Add category tabs
  categories.forEach(category => {
    const count = menus.filter(m => String(m.categoryId) === String(category.id)).length;
    $tabs.append(`
      <button class="category-tab" data-category="${category.id}">
        ${category.name} <span class="tab-count">(${count})</span>
      </button>
    `);
  });

  // Tab click handlers
  $('.category-tab').click(function() {
    $('.category-tab').removeClass('active');
    $(this).addClass('active');
    $('#categoryFilter').val($(this).data('category'));
    filterMenu();
  });
}

// ============ FILTER & DISPLAY ============

function populateCategoryFilter() {
  const $filter = $('#categoryFilter');
  const currentValue = $filter.val();
  
  $filter.empty().append('<option value="">All Categories</option>');
  categories.forEach(cat => {
    $filter.append(`<option value="${cat.id}">${cat.name}</option>`);
  });
  
  if (currentValue) $filter.val(currentValue);
}

function filterMenu() {
  const searchQuery = $('#searchInput').val().toLowerCase();
  const selectedCategory = $('#categoryFilter').val();
  const sortOption = $('#sortFilter').val();

  // Filter menus
  filteredMenus = menus.filter(menu => {
    const matchesSearch = !searchQuery || 
      menu.title.toLowerCase().includes(searchQuery) ||
      menu.description.toLowerCase().includes(searchQuery);
    const matchesCategory = !selectedCategory || String(menu.categoryId) === String(selectedCategory);
    const isAvailable = menu.available !== false; // Only show available items
    return matchesSearch && matchesCategory && isAvailable;
  });

  // Sort menus
  switch(sortOption) {
    case 'price-low':
      filteredMenus.sort((a, b) => {
        const priceA = a.promotionPrice || a.price;
        const priceB = b.promotionPrice || b.price;
        return priceA - priceB;
      });
      break;
    case 'price-high':
      filteredMenus.sort((a, b) => {
        const priceA = a.promotionPrice || a.price;
        const priceB = b.promotionPrice || b.price;
        return priceB - priceA;
      });
      break;
    case 'name':
      filteredMenus.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  displayMenu();
}

function displayMenu() {
  const $container = $('#menuContainer');
  const $emptyState = $('#emptyState');
  
  $container.empty();

  if (filteredMenus.length === 0) {
    $container.hide();
    $emptyState.show();
    return;
  }

  $container.show();
  $emptyState.hide();

  filteredMenus.forEach(menu => {
    const category = categories.find(c => c.id === menu.categoryId);
    const categoryName = category ? category.name : 'Unknown';
    const hasPromotion = menu.promotionPrice && menu.promotionPrice < menu.price;
    const discount = hasPromotion ? Math.round((1 - menu.promotionPrice / menu.price) * 100) : 0;
    const isKHR = menu.currency === 'KHR';
    const hasRange = menu.minPrice !== undefined && menu.maxPrice !== undefined;
    
    // Format prices based on currency and type
    let priceDisplay;
    if (hasRange) {
      // Price range display
      if (isKHR) {
        priceDisplay = `${Math.round(menu.minPrice).toLocaleString('en-US')}៛ - ${Math.round(menu.maxPrice).toLocaleString('en-US')}៛`;
      } else {
        priceDisplay = `$${menu.minPrice.toFixed(2)} - $${menu.maxPrice.toFixed(2)}`;
      }
    } else {
      // Single price or promotion display
      let currentPriceDisplay, promoPriceDisplay, originalPriceDisplay, savingsDisplay;
      if (isKHR) {
        currentPriceDisplay = Math.round(menu.price).toLocaleString('en-US') + '៛';
        if (hasPromotion) {
          promoPriceDisplay = Math.round(menu.promotionPrice).toLocaleString('en-US') + '៛';
          originalPriceDisplay = Math.round(menu.price).toLocaleString('en-US') + '៛';
          savingsDisplay = Math.round(menu.price - menu.promotionPrice).toLocaleString('en-US') + '៛';
        }
      } else {
        currentPriceDisplay = '$' + menu.price.toFixed(2);
        if (hasPromotion) {
          promoPriceDisplay = '$' + menu.promotionPrice.toFixed(2);
          originalPriceDisplay = '$' + menu.price.toFixed(2);
          savingsDisplay = '$' + (menu.price - menu.promotionPrice).toFixed(2);
        }
      }
      priceDisplay = hasPromotion ? 
        `<div class="price-wrapper">
          <span class="original-price">${originalPriceDisplay}</span>
          <span class="promo-price">${promoPriceDisplay}</span>
        </div>
        <span class="savings">Save ${savingsDisplay}</span>` :
        `<span class="current-price">${currentPriceDisplay}</span>`;
    }

    $container.append(`
      <div class="menu-card" data-category="${menu.categoryId}">
        <div class="menu-card-image">
          <img src="${menu.image}" alt="${menu.title}" onerror="this.src='/static/images/default.jpg'">
          ${hasPromotion ? `<span class="discount-badge">-${discount}%</span>` : ''}
          <span class="category-badge">${categoryName}</span>
        </div>
        <div class="menu-card-content">
          <h3 class="menu-title">${menu.title}</h3>
          <p class="menu-description">${menu.description}</p>
          <div class="menu-price-container">
            ${hasRange ? `<span class="price-range">${priceDisplay}</span>` : priceDisplay}
          </div>
        </div>
      </div>
    `);
  });

  // Add animation
  $('.menu-card').each(function(index) {
    $(this).css('animation-delay', `${index * 0.05}s`);
  });
}
