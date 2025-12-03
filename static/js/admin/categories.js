$(document).ready(function() {
    const API_BASE = '/api';
    let categories = [];
    let filteredCategories = [];
    let editingId = null;
    let deleteId = null;
    
    // Pagination state
    let currentPage = 1;
    let pageSize = 10;

    // Load categories on page load
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
    $('#categoryForm').submit(function(e) {
        e.preventDefault();
        saveCategory();
    });

    // Cancel button
    $('#cancelBtn').click(function() {
        closeFormPanel();
    });

    // Search functionality
    $('#searchCategory').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterCategories(searchTerm);
    });

    // Page size change
    $('#pageSize').on('change', function() {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        renderCategories();
    });

    // Delete modal handlers
    $('#cancelDelete').click(function() {
        closeDeleteModal();
    });

    $('#confirmDelete').click(function() {
        if (deleteId) {
            deleteCategory(deleteId);
        }
    });

    // Load all categories
    function loadCategories() {
        $.ajax({
            url: `${API_BASE}/categories`,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.categories) {
                    categories = response.categories;
                    filteredCategories = categories;
                    currentPage = 1;
                    renderCategories();
                } else {
                    showError('Invalid response format');
                }
            },
            error: function(xhr) {
                showError('Failed to load categories: ' + (xhr.responseJSON?.error || 'Server error'));
            }
        });
    }

    // Render categories table with pagination
    function renderCategories() {
        const tbody = $('#categoriesTableBody');
        tbody.empty();

        if (filteredCategories.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="6" class="empty-state">
                        <h3>No categories found</h3>
                        <p>Create your first category to get started!</p>
                    </td>
                </tr>
            `);
            updatePaginationInfo(0, 0, 0);
            $('#paginationControls').empty();
            return;
        }

        // Sort by order
        const sortedData = [...filteredCategories].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Pagination
        const totalRecords = sortedData.length;
        const totalPages = Math.ceil(totalRecords / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalRecords);
        const paginatedData = sortedData.slice(startIndex, endIndex);

        paginatedData.forEach(category => {
            const menuCount = category.menuCount || 0;
            const statusClass = category.active ? 'active' : 'inactive';
            const statusText = category.active ? 'Active' : 'Inactive';

            const row = `
                <tr class="fade-in">
                    <td>${category.order || 0}</td>
                    <td><strong>${escapeHtml(category.name)}</strong></td>
                    <td>${escapeHtml(category.description || '-')}</td>
                    <td>${menuCount} items</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td style="text-align: center;">
                        <button class="btn btn-warning btn-sm" onclick="editCategory('${category.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="confirmDeleteCategory('${category.id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.append(row);
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
        renderCategories();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter categories
    function filterCategories(searchTerm) {
        if (!searchTerm) {
            filteredCategories = categories;
        } else {
            filteredCategories = categories.filter(cat => 
                cat.name.toLowerCase().includes(searchTerm) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm))
            );
        }
        currentPage = 1;
        renderCategories();
    }

    // Save category (create or update)
    function saveCategory() {
        const formData = {
            name: $('#categoryName').val().trim(),
            description: $('#categoryDescription').val().trim(),
            order: parseInt($('#categoryOrder').val()) || 0,
            active: $('#categoryActive').is(':checked')
        };

        if (!formData.name) {
            showError('Category name is required');
            return;
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_BASE}/categories/${editingId}` : `${API_BASE}/categories`;

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess(editingId ? 'Category updated successfully!' : 'Category created successfully!');
                    closeFormPanel();
                    loadCategories();
                } else {
                    showError(response.error || 'Failed to save category');
                }
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.error || 'Server error';
                showError('Failed to save category: ' + errorMsg);
            }
        });
    }

    // Edit category
    window.editCategory = function(id) {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        editingId = id;
        $('#categoryId').val(id);
        $('#categoryName').val(category.name);
        $('#categoryDescription').val(category.description || '');
        $('#categoryOrder').val(category.order || 0);
        $('#categoryActive').prop('checked', category.active !== false);

        $('#form-title').text('Edit Category');
        $('#submitBtn').text('Update Category');

        // Open the slide panel
        $('#formSlidePanel').addClass('active');
    };

    // Confirm delete category
    window.confirmDeleteCategory = function(id) {
        deleteId = id;
        $('#deleteModal').addClass('show');
    };

    // Delete category
    function deleteCategory(id) {
        $.ajax({
            url: `${API_BASE}/categories/${id}`,
            method: 'DELETE',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess('Category deleted successfully!');
                    closeDeleteModal();
                    loadCategories();
                } else {
                    showError(response.error || 'Failed to delete category');
                    closeDeleteModal();
                }
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.error || xhr.responseJSON?.detail || 'Server error';
                showError('Failed to delete category: ' + errorMsg);
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
        $('#categoryForm')[0].reset();
        $('#categoryId').val('');
        editingId = null;
        $('#form-title').text('Add New Category');
        $('#submitBtn').text('Add Category');
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
