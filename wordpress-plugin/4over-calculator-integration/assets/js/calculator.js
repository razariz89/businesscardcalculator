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

    function handleIframeResize(data) {
        if (data.height) {
            console.log('📏 Resizing iframe to height:', data.height);
            $('#fourover-calculator-iframe').css({
                'height': data.height + 'px',
                'min-height': 'auto'
            });
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
            details: data.details
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

})(jQuery);
