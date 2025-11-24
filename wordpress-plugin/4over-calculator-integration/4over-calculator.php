<?php
/**
 * Plugin Name: 4over Calculator Integration
 * Plugin URI: https://v0-businesscardcalculator.vercel.app/
 * Description: Integrates 4over business card calculator with WooCommerce products using category ID mapping
 * Version: 1.0.0
 * Author: raza rizwan
 * Author URI: https://bittanic.com
 * License: GPL v2 or later
 * Text Domain: 4over-calc
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('FOUROVER_CALC_VERSION', '1.0.0');
define('FOUROVER_CALC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FOUROVER_CALC_PLUGIN_URL', plugin_dir_url(__FILE__));

class FourOver_Calculator_Integration {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Check if WooCommerce is active
        if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }

        $this->init_hooks();
    }

    private function init_hooks() {
        // Admin hooks
        add_action('woocommerce_product_options_general_product_data', array($this, 'add_category_id_field'));
        add_action('woocommerce_process_product_meta', array($this, 'save_category_id_field'));

        // Frontend hooks - Display calculator BEFORE the form (not inside it)
        add_action('woocommerce_before_add_to_cart_form', array($this, 'display_calculator'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // AJAX hooks for cart integration
        add_action('wp_ajax_fourover_add_to_cart', array($this, 'ajax_add_to_cart'));
        add_action('wp_ajax_nopriv_fourover_add_to_cart', array($this, 'ajax_add_to_cart'));

        // Admin settings
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // Shortcode
        add_shortcode('fourover_calculator', array($this, 'calculator_shortcode'));

        // Hide cart quantity update controls for calculator items
        add_action('wp_head', array($this, 'hide_cart_quantity_controls'));
    }

    public function woocommerce_missing_notice() {
        ?>
        <div class="error">
            <p><?php _e('4over Calculator Integration requires WooCommerce to be installed and active.', '4over-calc'); ?></p>
        </div>
        <?php
    }

    /**
     * Add custom field for 4over Category ID in product admin
     */
    public function add_category_id_field() {
        global $post;

        echo '<div class="options_group">';

        woocommerce_wp_text_input(array(
            'id' => '_4over_category_id',
            'label' => __('4over Category ID', '4over-calc'),
            'placeholder' => 'e.g., abc123-def456-ghi789',
            'desc_tip' => true,
            'description' => __('Enter the 4over category UUID to enable calculator on this product page. Leave empty to disable calculator.', '4over-calc'),
            'value' => get_post_meta($post->ID, '_4over_category_id', true)
        ));

        woocommerce_wp_checkbox(array(
            'id' => '_4over_calculator_enabled',
            'label' => __('Enable Calculator', '4over-calc'),
            'description' => __('Show 4over calculator on product page', '4over-calc'),
            'value' => get_post_meta($post->ID, '_4over_calculator_enabled', true) ?: 'yes'
        ));

        echo '</div>';
    }

    /**
     * Save custom field
     */
    public function save_category_id_field($post_id) {
        $category_id = isset($_POST['_4over_category_id']) ? sanitize_text_field($_POST['_4over_category_id']) : '';
        update_post_meta($post_id, '_4over_category_id', $category_id);

        $enabled = isset($_POST['_4over_calculator_enabled']) ? 'yes' : 'no';
        update_post_meta($post_id, '_4over_calculator_enabled', $enabled);
    }

    /**
     * Display calculator on product page
     */
    public function display_calculator() {
        global $post;

        $category_id = get_post_meta($post->ID, '_4over_category_id', true);
        $enabled = get_post_meta($post->ID, '_4over_calculator_enabled', true);

        if (empty($category_id) || $enabled === 'no') {
            return;
        }

        $calculator_url = get_option('fourover_calculator_url', 'https://businesscardcalculator.vercel.app');

        ?>
        <div id="fourover-calculator-container" class="fourover-calculator-wrapper" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <!-- <h3 style="display: block !important;"><?php _e('Configure Your Product', '4over-calc'); ?></h3> -->
            <div id="fourover-calculator-iframe-wrapper" style="display: block !important;">
                <iframe
                    id="fourover-calculator-iframe"
                    src="<?php echo esc_url($calculator_url . '?categoryId=' . urlencode($category_id) . '&embedded=true'); ?>"
                    style="width: 100% !important; min-height: 800px !important; height: auto !important; border: none !important; border-radius: 8px !important; display: block !important;"
                    frameborder="0"
                    scrolling="no"
                ></iframe>
            </div>

            <input type="hidden" id="fourover-selected-options" name="fourover_options" value="" />
            <input type="hidden" id="fourover-calculated-price" name="fourover_price" value="" />
            <input type="hidden" id="fourover-product-details" name="fourover_details" value="" />

            <div class="fourover-cart-actions" style="display: flex !important;">
                <button type="button" id="fourover-add-to-cart-btn" class="button alt" disabled style="display: inline-block !important;">
                    <?php _e('Add to Cart', '4over-calc'); ?>
                </button>
                <div id="fourover-price-display" class="fourover-price" style="display: inline-block !important;">
                    <span class="price-label"><?php _e('Price:', '4over-calc'); ?></span>
                    <span class="price-amount">--</span>
                </div>
            </div>
        </div>

        <style>
            .fourover-calculator-wrapper {
               margin: 0px 0 30px;
                /*  padding: 20px;
                background: #f9f9f9;
                border-radius: 8px; */
            }
            .fourover-calculator-wrapper h3 {
                margin-top: 0;
                margin-bottom: 20px;
                font-size: 1.5em;
            }
            #fourover-calculator-iframe {
                /* box-shadow: 0 2px 8px rgba(0,0,0,0.1); */
            }
            .fourover-cart-actions {
                margin-top: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            #fourover-add-to-cart-btn {
                font-size: 16px;
                padding: 12px 30px;
                cursor: pointer;
                background-color: #0071a1;
                color: white;
                border: none;
                border-radius: 4px;
                line-height: 1;
            }
            #fourover-add-to-cart-btn:hover:not(:disabled) {
                background-color: #005a87;
            }
            #fourover-add-to-cart-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background-color: #cccccc;
            }
            .fourover-price {
                font-size: 18px;
                font-weight: bold;
            }
            .fourover-price .price-label {
                color: #666;
                margin-right: 8px;
            }
            .fourover-price .price-amount {
                color: #77a464;
                font-size: 24px;
            }

            /* Hide ONLY WooCommerce default form elements - simple and clean approach */
            .woocommerce-variation-form,
            .single_variation_wrap,
            .woocommerce-product-rating,
            form.cart:not(.fourover-calculator-wrapper form),
            .product .summary .price,
            .product .summary p.price,
            .woocommerce-product-details__short-description {
                display: none !important;
            }

            #fourover-add-to-cart-btn {
                display: inline-block !important;
            }

            #fourover-price-display {
                display: inline-block !important;
            }

            /* Hide calculator internal elements using iframe CSS injection */
            #fourover-calculator-iframe {
                /* Note: We'll hide elements inside iframe via postMessage to the calculator app */
            }
        </style>
        <?php
    }

    /**
     * Enqueue frontend scripts
     */
    public function enqueue_scripts() {
        if (!is_product()) {
            return;
        }

        global $post;
        $category_id = get_post_meta($post->ID, '_4over_category_id', true);

        if (empty($category_id)) {
            return;
        }

        wp_enqueue_script(
            'fourover-calculator',
            FOUROVER_CALC_PLUGIN_URL . 'assets/js/calculator.js',
            array('jquery'),
            FOUROVER_CALC_VERSION,
            true
        );

        wp_localize_script('fourover-calculator', 'fouroverCalc', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fourover_calc_nonce'),
            'productId' => $post->ID,
            'categoryId' => $category_id
        ));
    }

    /**
     * AJAX handler to add configured product to cart
     */
    public function ajax_add_to_cart() {
        check_ajax_referer('fourover_calc_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
        $options = isset($_POST['options']) ? json_decode(stripslashes($_POST['options']), true) : array();
        $details = isset($_POST['details']) ? sanitize_text_field($_POST['details']) : '';

        if (!$product_id || !$price) {
            wp_send_json_error(array('message' => 'Invalid product or price'));
            return;
        }

        // Get the product to check its type
        $product = wc_get_product($product_id);
        if (!$product) {
            wp_send_json_error(array('message' => 'Product not found'));
            return;
        }

        // Add to cart with quantity = 1
        // The price from calculator already includes the total for all quantity
        $cart_item_key = WC()->cart->add_to_cart(
            $product_id,
            1,  // Always 1 - price already includes quantity cost
            0,  // No variation
            array(),  // No variation attributes
            array(
                'fourover_custom_price' => $price,
                'fourover_options' => $options,
                'fourover_details' => $details,
                'unique_key' => md5(microtime() . rand())
            )
        );

        if ($cart_item_key) {
            wp_send_json_success(array(
                'message' => 'Product added to cart',
                'cart_url' => wc_get_cart_url()
            ));
        } else {
            wp_send_json_error(array('message' => 'Failed to add product to cart'));
        }
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            __('4over Calculator Settings', '4over-calc'),
            __('4over Calculator', '4over-calc'),
            'manage_options',
            'fourover-calculator-settings',
            array($this, 'settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('fourover_calculator_settings', 'fourover_calculator_url');
        register_setting('fourover_calculator_settings', 'fourover_auto_add_to_cart');
        register_setting('fourover_calculator_settings', 'fourover_hide_default_price');
    }

    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('4over Calculator Settings', '4over-calc'); ?></h1>

            <form method="post" action="options.php">
                <?php settings_fields('fourover_calculator_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="fourover_calculator_url"><?php _e('Calculator URL', '4over-calc'); ?></label>
                        </th>
                        <td>
                            <input
                                type="url"
                                id="fourover_calculator_url"
                                name="fourover_calculator_url"
                                value="<?php echo esc_attr(get_option('fourover_calculator_url', 'https://businesscardcalculator.vercel.app')); ?>"
                                class="regular-text"
                            />
                            <p class="description"><?php _e('URL of your hosted 4over calculator application', '4over-calc'); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="fourover_auto_add_to_cart"><?php _e('Auto Add to Cart', '4over-calc'); ?></label>
                        </th>
                        <td>
                            <input
                                type="checkbox"
                                id="fourover_auto_add_to_cart"
                                name="fourover_auto_add_to_cart"
                                value="1"
                                <?php checked(get_option('fourover_auto_add_to_cart'), 1); ?>
                            />
                            <label for="fourover_auto_add_to_cart"><?php _e('Automatically add to cart when user configures product', '4over-calc'); ?></label>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="fourover_hide_default_price"><?php _e('Hide Default Price', '4over-calc'); ?></label>
                        </th>
                        <td>
                            <input
                                type="checkbox"
                                id="fourover_hide_default_price"
                                name="fourover_hide_default_price"
                                value="1"
                                <?php checked(get_option('fourover_hide_default_price'), 1); ?>
                            />
                            <label for="fourover_hide_default_price"><?php _e('Hide default WooCommerce price when calculator is active', '4over-calc'); ?></label>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2><?php _e('Usage Instructions', '4over-calc'); ?></h2>
            <ol>
                <li><?php _e('Edit any WooCommerce product', '4over-calc'); ?></li>
                <li><?php _e('Scroll to "4over Category ID" field in Product Data section', '4over-calc'); ?></li>
                <li><?php _e('Enter the 4over category UUID (e.g., from 4over API)', '4over-calc'); ?></li>
                <li><?php _e('Check "Enable Calculator" checkbox', '4over-calc'); ?></li>
                <li><?php _e('Save the product', '4over-calc'); ?></li>
                <li><?php _e('The calculator will appear on the product page', '4over-calc'); ?></li>
            </ol>

            <h3><?php _e('Shortcode Usage', '4over-calc'); ?></h3>
            <p><?php _e('You can also use shortcode to embed calculator anywhere:', '4over-calc'); ?></p>
            <code>[fourover_calculator category_id="YOUR_CATEGORY_ID"]</code>
        </div>
        <?php
    }

    /**
     * Hide cart quantity controls for calculator items
     */
    public function hide_cart_quantity_controls() {
        if (!is_cart() && !is_checkout()) {
            return;
        }
        ?>
        <style type="text/css">
            /* Force hide quantity column - MAXIMUM PRIORITY */
            table.shop_table.cart td.product-quantity,
            table.shop_table.cart th.product-quantity,
            .woocommerce-cart-form table.cart td.product-quantity,
            .woocommerce-cart-form table.cart th.product-quantity,
            .cart-collaterals td.product-quantity,
            td.product-quantity,
            th.product-quantity,
            .product-quantity {
                display: none !important;
                visibility: hidden !important;
                width: 0 !important;
                height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            /* Hide update cart button */
            button[name="update_cart"],
            .button[name="update_cart"],
            input[name="update_cart"] {
                display: none !important;
            }
        </style>
        <script type="text/javascript">
            (function() {
                // Run immediately
                function hideQuantity() {
                    // Remove quantity column
                    var qtyElements = document.querySelectorAll('td.product-quantity, th.product-quantity, .product-quantity');
                    qtyElements.forEach(function(el) {
                        el.style.display = 'none';
                        el.remove();
                    });

                    // Remove update cart button
                    var updateBtn = document.querySelector('button[name="update_cart"]');
                    if (updateBtn) {
                        updateBtn.style.display = 'none';
                        updateBtn.remove();
                    }
                }

                // Run on page load
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', hideQuantity);
                } else {
                    hideQuantity();
                }

                // Run after a short delay as backup
                setTimeout(hideQuantity, 100);
                setTimeout(hideQuantity, 500);
                setTimeout(hideQuantity, 1000);
            })();
        </script>
        <?php
    }

    /**
     * Shortcode handler
     */
    public function calculator_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category_id' => '',
            'height' => '800px'
        ), $atts);

        if (empty($atts['category_id'])) {
            return '<p>Please provide a category_id parameter.</p>';
        }

        $calculator_url = get_option('fourover_calculator_url', 'https://businesscardcalculator.vercel.app');

        ob_start();
        ?>
        <div class="fourover-calculator-shortcode">
            <iframe
                src="<?php echo esc_url($calculator_url . '?categoryId=' . urlencode($atts['category_id']) . '&embedded=true'); ?>"
                style="width: 100%; min-height: <?php echo esc_attr($atts['height']); ?>; border: none; border-radius: 8px;"
                frameborder="0"
            ></iframe>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize plugin
add_action('plugins_loaded', array('FourOver_Calculator_Integration', 'get_instance'));

// Add custom price persistence
add_filter('woocommerce_add_cart_item_data', 'fourover_add_cart_item_data', 10, 3);
function fourover_add_cart_item_data($cart_item_data, $product_id, $variation_id) {
    if (isset($_POST['fourover_price']) && !empty($_POST['fourover_price'])) {
        $cart_item_data['fourover_custom_price'] = floatval($_POST['fourover_price']);
    }
    if (isset($_POST['fourover_options']) && !empty($_POST['fourover_options'])) {
        $cart_item_data['fourover_options'] = sanitize_text_field($_POST['fourover_options']);
    }
    if (isset($_POST['fourover_details']) && !empty($_POST['fourover_details'])) {
        $cart_item_data['fourover_details'] = sanitize_text_field($_POST['fourover_details']);
    }
    return $cart_item_data;
}

// Apply custom price to cart AND FORCE QUANTITY TO 1
add_action('woocommerce_before_calculate_totals', 'fourover_before_calculate_totals', 10, 1);
function fourover_before_calculate_totals($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        if (isset($cart_item['fourover_custom_price'])) {
            // FORCE quantity to 1 - this is critical!
            $cart_item['quantity'] = 1;
            WC()->cart->set_quantity($cart_item_key, 1, false);

            // Set the price - this is the total price for the quantity already
            $cart_item['data']->set_price($cart_item['fourover_custom_price']);
        }
    }
}

// Make calculator products virtual (no shipping needed)
add_filter('woocommerce_product_needs_shipping', 'fourover_disable_shipping_for_calculator', 10, 2);
function fourover_disable_shipping_for_calculator($needs_shipping, $product) {
    // Check if this product is in cart with calculator pricing
    foreach (WC()->cart->get_cart() as $cart_item) {
        if (isset($cart_item['fourover_custom_price']) && $cart_item['product_id'] == $product->get_id()) {
            return false; // No shipping needed
        }
    }
    return $needs_shipping;
}

// Add free shipping method for calculator products
add_filter('woocommerce_package_rates', 'fourover_add_free_shipping', 10, 2);
function fourover_add_free_shipping($rates, $package) {
    // Check if package contains calculator products
    $has_calculator_product = false;

    foreach ($package['contents'] as $item) {
        if (isset($item['fourover_custom_price'])) {
            $has_calculator_product = true;
            break;
        }
    }

    if ($has_calculator_product) {
        // Add a free shipping option
        $rates['free_shipping'] = new WC_Shipping_Rate(
            'free_shipping',
            'Free Shipping (Included in Price)',
            0,
            array(),
            'free_shipping'
        );
    }

    return $rates;
}

// Prevent quantity changes for calculator items - always keep it as 1
add_filter('woocommerce_cart_item_quantity', 'fourover_lock_cart_item_quantity', 10, 3);
function fourover_lock_cart_item_quantity($product_quantity, $cart_item_key, $cart_item) {
    // If this is a calculator item, return quantity as plain text (not editable)
    if (isset($cart_item['fourover_custom_price'])) {
        return '1'; // Just show 1, not editable
    }
    return $product_quantity;
}

// Force quantity to always be 1 for calculator items (prevent manual changes)
add_filter('woocommerce_cart_item_quantity', 'fourover_force_quantity_one', 10, 3);
function fourover_force_quantity_one($quantity, $cart_item_key, $cart_item) {
    if (isset($cart_item['fourover_custom_price'])) {
        // Return empty string - quantity column will be hidden by CSS
        return '';
    }
    return $quantity;
}

// Block any attempt to update quantity for calculator items
add_filter('woocommerce_update_cart_action_cart_updated', 'fourover_prevent_quantity_update', 10, 1);
function fourover_prevent_quantity_update($cart_updated) {
    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
        if (isset($cart_item['fourover_custom_price'])) {
            // Force set quantity back to 1
            WC()->cart->set_quantity($cart_item_key, 1, false);
        }
    }
    return $cart_updated;
}

// Display custom options in cart
add_filter('woocommerce_get_item_data', 'fourover_get_item_data', 10, 2);
function fourover_get_item_data($item_data, $cart_item) {
    if (isset($cart_item['fourover_options'])) {
        $options = is_string($cart_item['fourover_options']) ? json_decode($cart_item['fourover_options'], true) : $cart_item['fourover_options'];

        if (is_array($options) && !empty($options)) {
            // Fields to skip from cart display (except quantity - we want to show it)
            $skip_fields = ['product_type', 'product_category', 'size', 'producttype', 'productcategory'];

            foreach ($options as $option_name => $option_value) {
                // Skip unwanted fields
                $option_name_lower = strtolower(str_replace(['_', ' ', '-'], '', $option_name));
                if (in_array($option_name_lower, $skip_fields)) {
                    continue;
                }

                // Format the option name to be readable
                $formatted_name = ucwords(str_replace('_', ' ', $option_name));

                $item_data[] = array(
                    'name' => $formatted_name,
                    'value' => is_array($option_value) ? implode(', ', $option_value) : $option_value,
                    'display' => ''
                );
            }
        }
    }

    if (isset($cart_item['fourover_details'])) {
        $item_data[] = array(
            'name' => __('Configuration Summary', '4over-calc'),
            'value' => $cart_item['fourover_details'],
            'display' => ''
        );
    }

    return $item_data;
}

// Save custom data to order
add_action('woocommerce_checkout_create_order_line_item', 'fourover_checkout_create_order_line_item', 10, 4);
function fourover_checkout_create_order_line_item($item, $cart_item_key, $values, $order) {
    // Save individual options as separate meta data
    if (isset($values['fourover_options'])) {
        $options = is_string($values['fourover_options']) ? json_decode($values['fourover_options'], true) : $values['fourover_options'];

        if (is_array($options) && !empty($options)) {
            // Save each option separately for better visibility in admin
            foreach ($options as $option_name => $option_value) {
                $formatted_name = ucwords(str_replace('_', ' ', $option_name));
                $formatted_value = is_array($option_value) ? implode(', ', $option_value) : $option_value;

                $item->add_meta_data($formatted_name, $formatted_value, true);
            }

            // Also save complete JSON for reference
            $item->add_meta_data('_fourover_options_json', wp_json_encode($options), false);
        }
    }

    // Save custom price
    if (isset($values['fourover_custom_price'])) {
        $item->add_meta_data('_fourover_custom_price', $values['fourover_custom_price'], false);
    }

    // Save configuration summary
    if (isset($values['fourover_details'])) {
        $item->add_meta_data('Configuration Summary', $values['fourover_details'], true);
    }
}

// Display order item meta in admin order view
add_filter('woocommerce_order_item_display_meta_key', 'fourover_order_item_display_meta_key', 10, 3);
function fourover_order_item_display_meta_key($display_key, $meta, $item) {
    // Hide internal meta keys
    if (in_array($meta->key, array('_fourover_options_json', '_fourover_custom_price'))) {
        return '';
    }
    return $display_key;
}

// Display formatted meta in order emails and admin
add_filter('woocommerce_order_item_display_meta_value', 'fourover_order_item_display_meta_value', 10, 3);
function fourover_order_item_display_meta_value($display_value, $meta, $item) {
    // Format the display value if needed
    return esc_html($display_value);
}
