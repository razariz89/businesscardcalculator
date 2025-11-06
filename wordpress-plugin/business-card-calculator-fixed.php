<?php
/**
 * Plugin Name: Business Card Calculator Fixed
 * Plugin URI: https://v0-businesscardcalculator.vercel.app/
 * Description: Embed the 4over Business Card Calculator on WooCommerce product pages
 * Version: 1.0.1
 * Author: Raza
 * License: GPL v2 or later
 * Text Domain: business-card-calculator
 */

if (!defined('ABSPATH')) {
    exit;
}

// Add custom field to WooCommerce product
add_action('woocommerce_product_options_general_product_data', 'bcc_add_custom_field');
function bcc_add_custom_field() {
    woocommerce_wp_text_input([
        'id' => '_4over_category_id',
        'label' => __('4over Category ID', 'business-card-calculator'),
        'placeholder' => '08a9625a-4152-40cf-9007-b2bbb349efec',
        'description' => __('Enter the 4over category UUID to load products in the calculator', 'business-card-calculator'),
        'desc_tip' => true,
    ]);
}

// Save custom field
add_action('woocommerce_process_product_meta', 'bcc_save_custom_field');
function bcc_save_custom_field($post_id) {
    $category_id = isset($_POST['_4over_category_id']) ? sanitize_text_field($_POST['_4over_category_id']) : '';
    update_post_meta($post_id, '_4over_category_id', $category_id);
}

// Replace product form with calculator
add_action('woocommerce_before_add_to_cart_form', 'bcc_display_calculator', 5);
function bcc_display_calculator() {
    global $product;

    $category_id = get_post_meta($product->get_id(), '_4over_category_id', true);

    if (!$category_id) {
        return;
    }

    // Hide default form
    echo '<style>
        .woocommerce-variation-form,
        .single_variation_wrap,
        .woocommerce-product-rating,
        .woocommerce-product-details__short-description,
        form.cart {
            display: none !important;
        }
    </style>';

    $product_id = $product->get_id();
    $product_name = $product->get_name();

    // Display calculator with embedded parameter
    // Use your Git-connected URL
    $calculator_url = 'https://businesscardcalculator.vercel.app/?categoryId=' . urlencode($category_id) . '&embedded=true';

    echo '<div class="bcc-calculator-wrapper" style="margin: 20px 0;" data-product-id="' . esc_attr($product_id) . '" data-product-name="' . esc_attr($product_name) . '">';
    echo '<iframe
        id="bcc-calculator-iframe"
        src="' . esc_url($calculator_url) . '"
        width="100%"
        height="1200"
        frameborder="0"
        style="border: 1px solid #ddd; border-radius: 4px;"
        title="Business Card Calculator">
    </iframe>';
    echo '</div>';

    echo '<script>
    window.addEventListener("message", function(event) {
        console.log("Message received:", event.data);

        if (event.data.type === "ADD_TO_CART") {
            const cartData = event.data;
            const productId = document.querySelector(".bcc-calculator-wrapper").getAttribute("data-product-id");

            console.log("Adding to cart:", cartData);

            // Send AJAX request to add to cart
            fetch("' . esc_url(admin_url('admin-ajax.php')) . '", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    action: "bcc_add_to_cart",
                    product_id: productId,
                    price: cartData.price || 0,
                    options: JSON.stringify(cartData.options || {}),
                    details: cartData.details || "",
                    nonce: "' . wp_create_nonce('bcc_add_to_cart') . '"
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("AJAX response:", data);
                if (data.success) {
                    // Redirect to cart
                    window.location.href = "' . esc_url(wc_get_cart_url()) . '";
                } else {
                    alert("Error: " + (data.data.message || "Failed to add to cart"));
                }
            })
            .catch(error => {
                console.error("AJAX error:", error);
                alert("Error adding to cart");
            });
        }
    });
    </script>';
}

// AJAX handler to add to cart
add_action('wp_ajax_bcc_add_to_cart', 'bcc_add_to_cart_handler');
add_action('wp_ajax_nopriv_bcc_add_to_cart', 'bcc_add_to_cart_handler');
function bcc_add_to_cart_handler() {
    check_ajax_referer('bcc_add_to_cart', 'nonce');

    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
    $options = isset($_POST['options']) ? json_decode(stripslashes($_POST['options']), true) : [];
    $details = isset($_POST['details']) ? sanitize_text_field(stripslashes($_POST['details'])) : '';

    if (!$product_id || !$price) {
        wp_send_json_error(['message' => 'Invalid product or price']);
        return;
    }

    // Add to cart with custom data
    $cart_item_key = WC()->cart->add_to_cart($product_id, 1, 0, [], [
        'bcc_price' => $price,
        'bcc_options' => $options,
        'bcc_details' => $details
    ]);

    if ($cart_item_key) {
        wp_send_json_success(['message' => 'Added to cart']);
    } else {
        wp_send_json_error(['message' => 'Failed to add to cart']);
    }
}

// Set custom price in cart
add_action('woocommerce_before_calculate_totals', 'bcc_set_custom_price');
function bcc_set_custom_price($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item) {
        if (isset($cart_item['bcc_price'])) {
            $cart_item['data']->set_price($cart_item['bcc_price']);
        }
    }
}

// Display cart item data
add_filter('woocommerce_get_item_data', 'bcc_display_cart_item_data', 10, 2);
function bcc_display_cart_item_data($item_data, $cart_item) {
    if (isset($cart_item['bcc_options']) && is_array($cart_item['bcc_options'])) {
        foreach ($cart_item['bcc_options'] as $key => $value) {
            $item_data[] = [
                'name' => ucfirst(str_replace('_', ' ', $key)),
                'value' => is_array($value) ? implode(', ', $value) : $value,
                'display' => ''
            ];
        }
    }

    if (isset($cart_item['bcc_details'])) {
        $item_data[] = [
            'name' => __('Configuration Summary', 'business-card-calculator'),
            'value' => $cart_item['bcc_details'],
            'display' => ''
        ];
    }

    return $item_data;
}

// Save to order meta
add_action('woocommerce_checkout_create_order_line_item', 'bcc_save_order_item_meta', 10, 4);
function bcc_save_order_item_meta($item, $cart_item_key, $values, $order) {
    if (isset($values['bcc_options']) && is_array($values['bcc_options'])) {
        foreach ($values['bcc_options'] as $key => $value) {
            $formatted_key = ucfirst(str_replace('_', ' ', $key));
            $formatted_value = is_array($value) ? implode(', ', $value) : $value;
            $item->add_meta_data($formatted_key, $formatted_value, true);
        }
    }

    if (isset($values['bcc_price'])) {
        $item->add_meta_data('_bcc_custom_price', $values['bcc_price'], false);
    }

    if (isset($values['bcc_details'])) {
        $item->add_meta_data('Configuration Summary', $values['bcc_details'], true);
    }
}
