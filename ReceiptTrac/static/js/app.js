// ReceiptTrac - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips, dropdowns, etc.
    initApp();
});

function initApp() {
    // Mobile menu toggle if needed
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Êtes-vous sûr? / Are you sure?')) {
                e.preventDefault();
            }
        });
    });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Image preview for upload
function previewImage(input) {
    const preview = document.getElementById('preview');
    const previewDiv = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            previewDiv.style.display = 'block';

            // Add subtle animation
            previewDiv.style.opacity = '0';
            setTimeout(() => {
                previewDiv.style.transition = 'opacity 0.3s';
                previewDiv.style.opacity = '1';
            }, 10);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// Drag and drop functionality
function initDragDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            const fileInput = document.getElementById('receipt');
            fileInput.files = files;
            previewImage(fileInput);
        }
    }
}

// Calculate taxes in real-time on verify page
function initTaxCalculator() {
    const subtotalInput = document.querySelector('input[name="subtotal"]');
    const gstInput = document.querySelector('input[name="tax_gst"]');
    const qstInput = document.querySelector('input[name="tax_qst"]');
    const totalInput = document.querySelector('input[name="total"]');

    if (!subtotalInput || !totalInput) return;

    const GST_RATE = 0.05;
    const QST_RATE = 0.09975;

    function calculateTaxes() {
        const subtotal = parseFloat(subtotalInput.value) || 0;

        if (subtotal > 0) {
            const gst = Math.round(subtotal * GST_RATE * 100) / 100;
            const qstBase = subtotal + gst;
            const qst = Math.round(qstBase * QST_RATE * 100) / 100;
            const total = Math.round((subtotal + gst + qst) * 100) / 100;

            if (!gstInput.value || gstInput.value == "0") {
                gstInput.value = gst.toFixed(2);
            }
            if (!qstInput.value || qstInput.value == "0") {
                qstInput.value = qst.toFixed(2);
            }
            if (!totalInput.value || totalInput.value == "0") {
                totalInput.value = total.toFixed(2);
            }
        }
    }

    subtotalInput.addEventListener('input', calculateTaxes);

    // Also calculate on page load if values are missing
    calculateTaxes();
}

// API helpers for future enhancements
const API = {
    async getReceipts(region = null) {
        const url = new URL('/api/receipts', window.location.origin);
        if (region) url.searchParams.append('region', region);

        const response = await fetch(url);
        return response.json();
    },

    async getStats() {
        const response = await fetch('/api/stats');
        return response.json();
    },

    async deleteReceipt(id) {
        const response = await fetch(`/delete/${id}`, {
            method: 'POST'
        });
        return response.ok;
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initDragDrop();
    initTaxCalculator();
});
