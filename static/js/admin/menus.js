$(document).ready(function() {
    const API_BASE = '/api';
    let menus = [];
    let filteredMenus = [];
    let categories = [];
    let editingId = null;
    let deleteId = null;
    
    // Pagination state
    let currentPage = 1;
    let pageSize = 12;

    // Load data on page load
    loadCategories();

    // Open form panel
    $('#openFormBtn').click(function() {
        openFormPanel();
    });

    // Close form panel
    $('#closeFormBtn, .slide-panel-overlay').click(function() {
        closeFormPanel();
    });

    // Form submit
    $('#menuForm').submit(function(e) {
        e.preventDefault();
        saveMenu();
    });

    // Cancel button
    $('#cancelBtn').click(function() {
        closeFormPanel();
    });

    // Image preview
    $('#menuImage').change(function() {
        previewImage(this);
    });

    // Price type change handler
    $('#priceType').change(function() {
        const priceType = $(this).val();
        $('.price-fields').hide();
        
        if (priceType === 'single') {
            $('#singlePriceFields').show();
        } else if (priceType === 'range') {
            $('#priceRangeFields').show();
        } else if (priceType === 'promotion') {
            $('#promotionPriceFields').show();
        }
    });

    // Filter by category
    $('#filterCategory').change(function() {
        filterMenus();
    });

    // Search functionality
    $('#searchMenu').on('input', function() {
        filterMenus();
    });

    // Page size change
    $('#pageSize').on('change', function() {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        renderMenus();
    });

    // Delete modal handlers
    $('#cancelDelete').click(function() {
        closeDeleteModal();
    });

    $('#confirmDelete').click(function() {
        if (deleteId) {
            deleteMenu(deleteId);
        }
    });

    // Load categories
    function loadCategories() {
        $.ajax({
            url: `${API_BASE}/categories`,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.categories) {
                    categories = response.categories.filter(c => c.active !== false);
                    renderCategoryOptions();
                    loadMenus(); // Load menus after categories are loaded
                } else {
                    showError('Failed to load categories');
                }
            },
            error: function(xhr) {
                showError('Failed to load categories: ' + (xhr.responseJSON?.error || 'Server error'));
            }
        });
    }

    // Render category options in dropdowns
    function renderCategoryOptions() {
        const select = $('#menuCategory');
        const filter = $('#filterCategory');
        
        select.find('option:not(:first)').remove();
        filter.find('option:not(:first)').remove();

        categories.forEach(category => {
            select.append(`<option value="${category.id}">${escapeHtml(category.name)}</option>`);
            filter.append(`<option value="${category.id}">${escapeHtml(category.name)}</option>`);
        });
    }

    // Load menus
    function loadMenus() {
        $.ajax({
            url: `${API_BASE}/menus`,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.menus) {
                    menus = response.menus;
                    filteredMenus = menus;
                    currentPage = 1;
                    renderMenus();
                } else {
                    showError('Failed to load menus');
                }
            },
            error: function(xhr) {
                showError('Failed to load menus: ' + (xhr.responseJSON?.error || 'Server error'));
            }
        });
    }

    // Render menu items with pagination
    function renderMenus() {
        const grid = $('#menuItemsGrid');
        grid.empty();

        console.log('Rendering menus:', filteredMenus.length, 'items');
        console.log('Categories available:', categories.length);

        if (filteredMenus.length === 0) {
            grid.html(`
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>No menu items found</h3>
                    <p>Create your first menu item to get started!</p>
                </div>
            `);
            updatePaginationInfo(0, 0, 0);
            $('#paginationControls').empty();
            return;
        }

        // Pagination
        const totalRecords = filteredMenus.length;
        const totalPages = Math.ceil(totalRecords / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalRecords);
        const paginatedData = filteredMenus.slice(startIndex, endIndex);

        paginatedData.forEach(menu => {
            const category = categories.find(c => c.id === menu.categoryId);
            const categoryName = category ? category.name : 'Uncategorized';
            
            console.log('Menu:', menu.title, 'Category ID:', menu.categoryId, 'Found:', categoryName);
            
            const isKHR = menu.currency === 'KHR';
            const hasRange = menu.minPrice !== undefined && menu.maxPrice !== undefined;
            const hasPromo = menu.promotionPrice && menu.price && menu.promotionPrice < menu.price;
            
            // Format price with proper currency display
            let priceDisplay, originalPriceDisplay;
            
            if (hasRange) {
                // Price range
                if (isKHR) {
                    priceDisplay = Math.round(menu.minPrice).toLocaleString('en-US') + '៛ - ' + Math.round(menu.maxPrice).toLocaleString('en-US') + '៛';
                } else {
                    priceDisplay = '$' + menu.minPrice.toFixed(2) + ' - $' + menu.maxPrice.toFixed(2);
                }
                originalPriceDisplay = '';
            } else if (hasPromo) {
                // Promotion price
                const displayPrice = menu.promotionPrice;
                if (isKHR) {
                    priceDisplay = Math.round(displayPrice).toLocaleString('en-US') + '៛';
                    originalPriceDisplay = Math.round(menu.price).toLocaleString('en-US') + '៛';
                } else {
                    priceDisplay = '$' + displayPrice.toFixed(2);
                    originalPriceDisplay = '$' + menu.price.toFixed(2);
                }
            } else {
                // Single price
                const displayPrice = menu.price || 0;
                if (isKHR) {
                    priceDisplay = Math.round(displayPrice).toLocaleString('en-US') + '៛';
                } else {
                    priceDisplay = '$' + displayPrice.toFixed(2);
                }
                originalPriceDisplay = '';
            }
            
            const availableBadge = menu.available !== false 
                ? '<span class="badge available">Available</span>' 
                : '<span class="badge unavailable">Unavailable</span>';
            
            const featuredBadge = menu.featured 
                ? '<span class="badge featured">⭐ Featured</span>' 
                : '';

            // Ensure image URL has proper path
            let imageUrl = menu.image || 'https://via.placeholder.com/300x200?text=No+Image';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = '/' + imageUrl;
            }

            const card = `
                <div class="menu-card fade-in">
                    <img src="${imageUrl}" alt="${escapeHtml(menu.title)}" class="menu-card-image" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="menu-card-content">
                        <div class="menu-card-title">${escapeHtml(menu.title)}</div>
                        <div class="menu-card-category">${escapeHtml(categoryName)}</div>
                        <div class="menu-card-description">${escapeHtml(menu.description)}</div>
                        <div class="menu-card-price">
                            <span class="price-regular">${priceDisplay}</span>
                            ${hasPromo ? `<span class="price-original">${originalPriceDisplay}</span>` : ''}
                        </div>
                        <div class="menu-card-badges">
                            ${availableBadge}
                            ${featuredBadge}
                        </div>
                        <div class="menu-card-actions">
                            <button class="btn btn-warning btn-sm" onclick="editMenu('${menu.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteMenu('${menu.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            grid.append(card);
        });

        updatePaginationInfo(startIndex + 1, endIndex, totalRecords);
        renderPaginationControls(totalPages);
    }

    // Update pagination info
    function updatePaginationInfo(start, end, total) {
        $('#showingStart').text(start);
        $('#showingEnd').text(end);
        $('#totalRecords').text(total);
    }

    // Render pagination controls
    function renderPaginationControls(totalPages) {
        const controls = $('#paginationControls');
        controls.empty();

        if (totalPages <= 1) return;

        // Previous button
        controls.append(`
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
                &laquo; Previous
            </button>
        `);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            controls.append(`<button class="pagination-btn" onclick="goToPage(1)">1</button>`);
            if (startPage > 2) {
                controls.append(`<span style="padding: 0 5px;">...</span>`);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            controls.append(`
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i}
                </button>
            `);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                controls.append(`<span style="padding: 0 5px;">...</span>`);
            }
            controls.append(`<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`);
        }

        // Next button
        controls.append(`
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
                Next &raquo;
            </button>
        `);
    }

    // Go to specific page
    window.goToPage = function(page) {
        currentPage = page;
        renderMenus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter menus
    function filterMenus() {
        const categoryFilter = $('#filterCategory').val();
        const searchTerm = $('#searchMenu').val().toLowerCase();

        let filtered = menus;

        if (categoryFilter) {
            filtered = filtered.filter(m => m.categoryId === categoryFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(searchTerm) ||
                m.description.toLowerCase().includes(searchTerm)
            );
        }

        filteredMenus = filtered;
        currentPage = 1;
        renderMenus();
    }

    // Preview image
    function previewImage(input) {
        const preview = $('#imagePreview');
        preview.empty();

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.html(`<img src="${e.target.result}" alt="Preview">`);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Save menu
    function saveMenu() {
        const title = $('#menuTitle').val().trim();
        const categoryId = $('#menuCategory').val();
        const description = $('#menuDescription').val().trim();
        const priceType = $('#priceType').val();
        const currency = $('#menuCurrency').val() || 'KHR';
        const available = $('#menuAvailable').is(':checked');
        const featured = $('#menuFeatured').is(':checked');
        const imageFile = $('#menuImage')[0].files[0];
        
        let price = null, promotionPrice = null, minPrice = null, maxPrice = null;
        
        if (priceType === 'single') {
            price = parseFloat($('#menuPrice').val()) || 0;
        } else if (priceType === 'range') {
            minPrice = parseFloat($('#menuMinPrice').val()) || 0;
            maxPrice = parseFloat($('#menuMaxPrice').val()) || 0;
            if (minPrice >= maxPrice) {
                showError('Max price must be greater than min price');
                return;
            }
        } else if (priceType === 'promotion') {
            price = parseFloat($('#menuRegularPrice').val()) || 0;
            promotionPrice = parseFloat($('#menuPromoPrice').val()) || 0;
            if (promotionPrice >= price) {
                showError('Promotion price must be less than regular price');
                return;
            }
        }

        // Validation
        if (!title) {
            showError('Title is required');
            return;
        }
        if (!categoryId) {
            showError('Category is required');
            return;
        }

        // Upload image first if there's a file
        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);

            $.ajax({
                url: `${API_BASE}/upload`,
                method: 'POST',
                data: uploadFormData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(uploadResponse) {
                    if (uploadResponse.success) {
                        saveMenuData(title, categoryId, description, price, promotionPrice, minPrice, maxPrice, currency, available, featured, uploadResponse.imagePath);
                    } else {
                        showError('Image upload failed: ' + uploadResponse.error);
                    }
                },
                error: function() {
                    showError('Image upload failed');
                }
            });
        } else {
            const currentImage = editingId ? ($('#currentImage').val() || 'static/images/default.jpg') : 'static/images/default.jpg';
            saveMenuData(title, categoryId, description, price, promotionPrice, minPrice, maxPrice, currency, available, featured, currentImage);
        }
    }

    // Save menu data to API
    function saveMenuData(title, categoryId, description, price, promotionPrice, minPrice, maxPrice, currency, available, featured, imagePath) {
        const menuData = {
            title: title,
            categoryId: categoryId,
            description: description,
            currency: currency,
            image: imagePath,
            available: available,
            featured: featured
        };
        
        // Add price fields based on what's provided
        if (minPrice !== null && maxPrice !== null) {
            menuData.minPrice = minPrice;
            menuData.maxPrice = maxPrice;
        } else {
            menuData.price = price;
            if (promotionPrice !== null) {
                menuData.promotionPrice = promotionPrice;
            }
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_BASE}/menus/${editingId}` : `${API_BASE}/menus`;

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(menuData),
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess(editingId ? 'Menu updated successfully!' : 'Menu created successfully!');
                    closeFormPanel();
                    loadMenus();
                } else {
                    showError(response.error || 'Failed to save menu');
                }
            },
            error: function(xhr) {
                showError('Failed to save menu: ' + (xhr.responseJSON?.error || 'Server error'));
            }
        });
    }

    // Edit menu
    window.editMenu = function(id) {
        const menu = menus.find(m => m.id === id);
        if (!menu) return;

        editingId = id;
        $('#menuId').val(id);
        $('#menuTitle').val(menu.title);
        $('#menuCategory').val(menu.categoryId);
        $('#menuDescription').val(menu.description);
        $('#menuCurrency').val(menu.currency || 'KHR');
        $('#menuAvailable').prop('checked', menu.available !== false);
        $('#menuFeatured').prop('checked', menu.featured === true);
        $('#currentImage').val(menu.image || '');
        
        // Determine and set price type
        if (menu.minPrice !== undefined && menu.maxPrice !== undefined) {
            $('#priceType').val('range').trigger('change');
            $('#menuMinPrice').val(menu.minPrice);
            $('#menuMaxPrice').val(menu.maxPrice);
        } else if (menu.promotionPrice && menu.price) {
            $('#priceType').val('promotion').trigger('change');
            $('#menuRegularPrice').val(menu.price);
            $('#menuPromoPrice').val(menu.promotionPrice);
        } else {
            $('#priceType').val('single').trigger('change');
            $('#menuPrice').val(menu.price || 0);
        }

        // Show current image
        if (menu.image) {
            let imageUrl = menu.image;
            if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = '/' + imageUrl;
            }
            $('#imagePreview').html(`<img src="${imageUrl}" alt="Current" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">`);
        }

        $('#form-title').text('Edit Menu Item');
        $('#submitBtn').text('Update Menu Item');

        // Open the slide panel
        $('#formSlidePanel').addClass('active');
    };

    // Confirm delete menu
    window.confirmDeleteMenu = function(id) {
        deleteId = id;
        $('#deleteModal').addClass('show');
    };

    // Delete menu
    function deleteMenu(id) {
        $.ajax({
            url: `${API_BASE}/menus/${id}`,
            method: 'DELETE',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess('Menu deleted successfully!');
                    closeDeleteModal();
                    loadMenus();
                } else {
                    showError(response.error || 'Failed to delete menu');
                    closeDeleteModal();
                }
            },
            error: function(xhr) {
                showError('Failed to delete menu: ' + (xhr.responseJSON?.error || 'Server error'));
                closeDeleteModal();
            }
        });
    }

    // Close delete modal
    function closeDeleteModal() {
        $('#deleteModal').removeClass('show');
        deleteId = null;
    }

    // Open form panel
    function openFormPanel() {
        $('#formSlidePanel').addClass('active');
        resetForm();
    }

    // Close form panel
    function closeFormPanel() {
        $('#formSlidePanel').removeClass('active');
        setTimeout(() => {
            resetForm();
        }, 300);
    }

    // Reset form
    function resetForm() {
        $('#menuForm')[0].reset();
        $('#menuId').val('');
        $('#currentImage').val('');
        $('#imagePreview').empty();
        editingId = null;
        $('#form-title').text('Add New Menu Item');
        $('#submitBtn').text('Add Menu Item');
    }

    // Show success message
    function showSuccess(message) {
        alert(message); // You can replace this with a better notification system
    }

    // Show error message
    function showError(message) {
        alert('Error: ' + message); // You can replace this with a better notification system
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }
});
