(function($) {
    'use strict';

    let calculatorData = {
        price: 0,
        options: {},
        details: ''
    };

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
        console.log('📩 Message received from:', event.origin);
        console.log('📩 Message data:', event.data);

        // Verify origin
        const allowedOrigins = [
            'https://v0-businesscardcalculator.vercel.app',
            'https://businesscardcalculator.vercel.app',
            'http://localhost:3000'
        ];

        if (!allowedOrigins.includes(event.origin)) {
            console.warn('⚠️ Message from unauthorized origin:', event.origin);
            console.warn('⚠️ Allowed origins:', allowedOrigins);
            return;
        }

        console.log('✅ Message from authorized calculator:', event.data);

        const data = event.data;

        // Handle different message types
        if (data.type === 'CALCULATOR_DATA') {
            console.log('📊 Handling CALCULATOR_DATA');
            handleCalculatorData(data);
        } else if (data.type === 'ADD_TO_CART') {
            console.log('🛒 Handling ADD_TO_CART');
            handleAddToCart(data);
        } else if (data.type === 'RESIZE_IFRAME') {
            console.log('📏 Handling RESIZE_IFRAME');
            handleIframeResize(data);
        } else {
            console.log('❓ Unknown message type:', data.type);
        }
    });

    function handleCalculatorData(data) {
        console.log('✅ Calculator data received:', data);
        console.log('✅ Price:', data.price);

        // Debug alert - REMOVE THIS AFTER TESTING
        // alert('Price received: $' + data.price);

        calculatorData = {
            price: data.price || 0,
            options: data.options || {},
            details: data.details || '',
            productId: data.productId || '',
            categoryId: data.categoryId || ''
        };

        // Update hidden fields
        $('#fourover-selected-options').val(JSON.stringify(calculatorData.options));
        $('#fourover-calculated-price').val(calculatorData.price);
        $('#fourover-product-details').val(calculatorData.details);

        // Update price display
        updatePriceDisplay(calculatorData.price);

        console.log('✅ Price display updated to:', calculatorData.price);

        // Enable add to cart button if price is available
        if (calculatorData.price > 0) {
            $('#fourover-add-to-cart-btn').prop('disabled', false).text('Add to Cart');
            console.log('✅ Button enabled');
        } else {
            $('#fourover-add-to-cart-btn').prop('disabled', true).text('Configure Options');
            console.log('⚠️ Button disabled - no price');
        }

        // Trigger custom event
        $(document).trigger('fourover_calculator_updated', [calculatorData]);
    }

    function handleAddToCart(data) {
        console.log('Add to cart triggered from calculator:', data);

        const cartData = {
            price: data.price || calculatorData.price,
            options: data.options || calculatorData.options,
            details: data.details || calculatorData.details
        };

        addToCartViaAjax(cartData);
    }

    let lastHeight = 0;
    let resizeTimeout = null;
    let updateCount = 0;
    const MAX_UPDATES = 10; // Prevent infinite loops

    function handleIframeResize(data) {
        if (data.height) {
            // Only update if height changed by more than 10px to avoid micro-adjustments
            const heightDiff = Math.abs(data.height - lastHeight);

            if (heightDiff > 10 && updateCount < MAX_UPDATES) {
                console.log('📏 Resizing iframe to height:', data.height, 'diff:', heightDiff);

                // Clear any pending resize
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }

                // Debounce the resize to avoid jank
                resizeTimeout = setTimeout(function() {
                    $('#fourover-calculator-iframe').css({
                        'height': data.height + 'px',
                        'max-height': '1500px', // Prevent excessive height
                        'overflow': 'hidden'
                    });
                    lastHeight = data.height;
                    updateCount++;

                    // Reset counter after 2 seconds of no updates
                    setTimeout(function() {
                        updateCount = 0;
                    }, 2000);
                }, 100);
            }
        }
    }

    function updatePriceDisplay(price) {
        if (!price) return;

        const formattedPrice = formatPrice(price);
        $('#fourover-price-display .price-amount').text(formattedPrice);
    }

    function formatPrice(price) {
        const currencySymbol = '$';
        return currencySymbol + parseFloat(price).toFixed(2);
    }

    function addToCartViaAjax(data) {
        if (typeof fouroverCalc === 'undefined') {
            console.error('fouroverCalc object not found');
            return;
        }

        const requestData = {
            action: 'fourover_add_to_cart',
            nonce: fouroverCalc.nonce,
            product_id: fouroverCalc.productId,
            price: data.price,
            options: JSON.stringify(data.options),
            details: data.details,
            front_file: $('#fourover-front-file').val() || '',
            back_file: $('#fourover-back-file').val() || '',
            upload_later: $('#fourover-upload-later').val() || ''
        };

        $.ajax({
            url: fouroverCalc.ajaxUrl,
            type: 'POST',
            data: requestData,
            beforeSend: function() {
                $('#fourover-add-to-cart-btn').prop('disabled', true).text('Adding...');
            },
            success: function(response) {
                if (response.success) {
                    if (response.data.cart_url) {
                        window.location.href = response.data.cart_url;
                    } else {
                        showNotice('Product added to cart!', 'success');
                    }
                } else {
                    showNotice(response.data.message || 'Failed to add to cart', 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error:', error);
                showNotice('An error occurred. Please try again.', 'error');
            },
            complete: function() {
                $('#fourover-add-to-cart-btn').prop('disabled', false).text('Add to Cart');
            }
        });
    }

    function showNotice(message, type) {
        const noticeClass = type === 'success' ? 'woocommerce-message' : 'woocommerce-error';
        const notice = $('<div class="' + noticeClass + '">' + message + '</div>');

        $('.woocommerce-notices-wrapper').html(notice);

        $('html, body').animate({
            scrollTop: notice.offset().top - 100
        }, 500);

        setTimeout(function() {
            notice.fadeOut();
        }, 5000);
    }

    // DOM ready
    $(document).ready(function() {
        // Add click handler for custom add to cart button
        $('#fourover-add-to-cart-btn').on('click', function(e) {
            e.preventDefault();

            if (calculatorData.price > 0) {
                addToCartViaAjax(calculatorData);
            } else {
                showNotice('Please configure the product first', 'error');
            }
        });

        // Auto-resize iframe
        function resizeIframe() {
            const iframe = $('#fourover-calculator-iframe');
            if (iframe.length && iframe[0].contentWindow) {
                iframe[0].contentWindow.postMessage({
                    type: 'GET_HEIGHT'
                }, '*');
            }
        }

        // Resize on load
        $('#fourover-calculator-iframe').on('load', function() {
            setTimeout(resizeIframe, 1000);
        });

        // Resize on window resize
        $(window).on('resize', resizeIframe);
    });

    // Send initial data to iframe
    $(window).on('load', function() {
        const iframe = document.getElementById('fourover-calculator-iframe');
        if (iframe && iframe.contentWindow && typeof fouroverCalc !== 'undefined') {
            setTimeout(function() {
                iframe.contentWindow.postMessage({
                    type: 'INIT_CONFIG',
                    categoryId: fouroverCalc.categoryId,
                    productId: fouroverCalc.productId,
                    embedded: true
                }, '*');
            }, 1500);
        }
    });

    // Upload File Drawer Functionality
    let frontFile = null;
    let backFile = null;

    // Open drawer
    $('#fourover-upload-file-btn').on('click', function() {
        $('#fourover-upload-drawer').fadeIn(300);
        $('body').css('overflow', 'hidden');
    });

    // Close drawer
    $('.fourover-drawer-close, .fourover-drawer-overlay').on('click', function() {
        $('#fourover-upload-drawer').fadeOut(300);
        $('body').css('overflow', '');
    });

    // Device upload buttons
    $('.fourover-device-upload').on('click', function() {
        const target = $(this).data('target');
        $(`#fourover-${target}-upload`).click();
    });

    // File input change handlers
    $('#fourover-front-upload').on('change', function(e) {
        handleFileSelect(e.target.files[0], 'front');
    });

    $('#fourover-back-upload').on('change', function(e) {
        handleFileSelect(e.target.files[0], 'back');
    });

    // Drag and drop
    $('.fourover-upload-area').on('dragover', function(e) {
        e.preventDefault();
        $(this).css('border-color', '#4cae4c');
    });

    $('.fourover-upload-area').on('dragleave', function(e) {
        e.preventDefault();
        $(this).css('border-color', '#ccc');
    });

    $('.fourover-upload-area').on('drop', function(e) {
        e.preventDefault();
        $(this).css('border-color', '#ccc');
        const side = $(this).data('side');
        const file = e.originalEvent.dataTransfer.files[0];
        handleFileSelect(file, side);
    });

    // Handle file selection
    function handleFileSelect(file, side) {
        if (!file) return;

        console.log(`File selected for ${side}:`, file.name);

        // Store file
        if (side === 'front') {
            frontFile = file;
        } else {
            backFile = file;
        }

        // Update UI
        const $area = $(`.fourover-upload-area[data-side="${side}"]`);
        $area.find('.fourover-upload-placeholder').hide();
        $area.find('.fourover-file-info').show();
        $area.find('.fourover-file-name').text(file.name);

        // Store file name in hidden field
        $(`#fourover-${side}-file`).val(file.name);

        // Enable Add to Cart if front file is uploaded
        updateDrawerAddToCartButton();
    }

    // Remove file
    $('.fourover-remove-file').on('click', function() {
        const side = $(this).data('side');

        if (side === 'front') {
            frontFile = null;
        } else {
            backFile = null;
        }

        // Reset UI
        const $area = $(`.fourover-upload-area[data-side="${side}"]`);
        $area.find('.fourover-upload-placeholder').show();
        $area.find('.fourover-file-info').hide();
        $(`#fourover-${side}-upload`).val('');
        $(`#fourover-${side}-file`).val('');

        // Update button state
        updateDrawerAddToCartButton();
    });

    // Update drawer Add to Cart button state
    function updateDrawerAddToCartButton() {
        if (frontFile) {
            $('#fourover-drawer-add-to-cart').prop('disabled', false);
        } else {
            $('#fourover-drawer-add-to-cart').prop('disabled', true);
        }
    }

    // Drawer Add to Cart
    $('#fourover-drawer-add-to-cart').on('click', function() {
        console.log('Adding to cart with files:', {front: frontFile, back: backFile});

        // Close drawer
        $('#fourover-upload-drawer').fadeOut(300);
        $('body').css('overflow', '');

        // Add to cart via main button
        addToCartViaAjax(calculatorData);
    });

    // Upload Later
    $('#fourover-upload-later-btn').on('click', function() {
        console.log('Upload later clicked');

        // Mark as upload later
        $('#fourover-upload-later').val('yes');

        // Close drawer
        $('#fourover-upload-drawer').fadeOut(300);
        $('body').css('overflow', '');

        // Add to cart via main button
        addToCartViaAjax(calculatorData);
    });

})(jQuery);
