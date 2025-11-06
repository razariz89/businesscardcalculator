# 4over Calculator - Complete WooCommerce Integration Guide

## 🎯 Kya Milega Aapko (What You Get)

✅ **Default WooCommerce form completely hidden** - Sirf calculator dikhai dega
✅ **Complete variant information** - Size, coating, quantity, turnaround sab cart me jayega
✅ **Order details** - Customer aur admin dono orders me complete configuration dekh sakte hain
✅ **Category-based auto-selection** - Product me category ID set karo, calculator automatic us category ko select karega
✅ **Custom pricing** - Calculator se jo price aayegi wahi cart me jayegi

---

## 📦 Installation (Step by Step)

### Step 1: Plugin Upload Karo

1. **Plugin Folder Copy Karo**
   ```bash
   cd wordpress-plugin
   zip -r 4over-calculator-plugin.zip 4over-calculator-integration/
   ```

2. **WordPress Admin Me Upload Karo**
   - WordPress Dashboard → Plugins → Add New
   - "Upload Plugin" button click karo
   - `4over-calculator-plugin.zip` select karo
   - "Install Now" → "Activate" click karo

### Step 2: Plugin Settings Configure Karo

1. **Settings Page Pe Jao**
   - WordPress Admin → WooCommerce → 4over Calculator

2. **Calculator URL Set Karo**
   - Calculator URL: `https://v0-businesscardcalculator.vercel.app`
   - Save Changes

### Step 3: Category ID Nikalo

Aapko 4over API se category UUID chahiye. Yahan se nikalo:

**Method 1: Browser Console Se**
1. Open: https://v0-businesscardcalculator.vercel.app
2. Press F12 (Developer Tools open hoga)
3. "Network" tab select karo
4. Calculator me koi category select karo (e.g., "Business Cards")
5. Network tab me `/api/4over/categories` call dhundo
6. Response me `category_uuid` copy karo

**Method 2: Direct API Call**
```bash
curl "https://api.4over.com/printproducts/categories?apikey=bizcard&signature=af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b"
```

Response me `category_uuid` dhundo for your category.

### Step 4: Product Configure Karo

1. **Product Edit Karo**
   - Products → All Products → [Your Product] → Edit

2. **Scroll Down to "Product Data" Section**
   - "4over Category ID" field me category UUID paste karo
   - "Enable Calculator" checkbox check karo
   - Update button click karo

3. **Test Karo**
   - Product page visit karo
   - Calculator load hona chahiye
   - Default WooCommerce form hide hona chahiye

---

## 🔧 How It Works (Kaise Kaam Karta Hai)

### Complete Flow:

```
┌─────────────────────────────────────────┐
│  Product Page (WooCommerce)             │
│  ┌───────────────────────────────────┐ │
│  │ 4over Category ID: abc-123-def    │ │
│  │ Enable Calculator: ✓               │ │
│  └───────────────────────────────────┘ │
│                ↓                        │
│  ┌───────────────────────────────────┐ │
│  │  Calculator (Iframe)              │ │
│  │  - Size: 3.5" x 2"                │ │
│  │  - Stock: 14PT Cardstock          │ │
│  │  - Coating: UV Gloss              │ │
│  │  - Quantity: 1000                 │ │
│  │  - Turnaround: 4 Business Days    │ │
│  │                                    │ │
│  │  Price: $89.99                    │ │
│  └───────────────────────────────────┘ │
│                ↓                        │
│     postMessage API (Data Transfer)    │
│                ↓                        │
│  ┌───────────────────────────────────┐ │
│  │  WordPress receives:              │ │
│  │  {                                │ │
│  │    price: 89.99,                  │ │
│  │    options: {                     │ │
│  │      size: "3.5\" x 2\"",         │ │
│  │      stock: "14PT Cardstock",     │ │
│  │      coating: "UV Gloss",         │ │
│  │      quantity: "1000",            │ │
│  │      turnaround: "4 Business Days"│ │
│  │    },                             │ │
│  │    details: "Size: 3.5x2 | ..."   │ │
│  │  }                                │ │
│  └───────────────────────────────────┘ │
│                ↓                        │
│     User clicks "Add to Cart"          │
│                ↓                        │
│  ┌───────────────────────────────────┐ │
│  │  Cart Item:                       │ │
│  │  - Product: Business Cards        │ │
│  │  - Price: $89.99                  │ │
│  │  - Size: 3.5" x 2"                │ │
│  │  - Stock: 14PT Cardstock          │ │
│  │  - Coating: UV Gloss              │ │
│  │  - Quantity: 1000                 │ │
│  │  - Turnaround: 4 Business Days    │ │
│  └───────────────────────────────────┘ │
│                ↓                        │
│     Checkout → Order Created           │
│                ↓                        │
│  ┌───────────────────────────────────┐ │
│  │  Order (Admin + Customer View):   │ │
│  │  - All variants visible           │ │
│  │  - Configuration details saved    │ │
│  │  - Custom price applied           │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✨ Features Explained

### 1. **Default Form Hidden**

WordPress plugin automatically WooCommerce ki default form ko hide kar deta hai:
- Quantity selector hidden
- Add to cart button hidden
- Product variations hidden
- Default price hidden

Sirf calculator dikhai dega aur calculator ki "Add to Cart" button.

### 2. **Complete Variant Information**

Calculator se ye sab data pass hota hai:

**Cart Me:**
```
Product Name: Business Cards Premium
Price: $89.99

Size: 3.5" x 2"
Stock: 14PT Cardstock
Coating: UV Gloss
Quantity: 1000
Turnaround: 4 Business Days
Configuration Summary: Size: 3.5x2 | Stock: 14PT | ...
```

**Order Me (Same Format):**
Admin aur customer emails me same details show hongi.

### 3. **Category Auto-Selection**

Jab product page load hoga:
1. Plugin category ID check karega
2. Calculator ko iframe me load karega with URL parameter
3. Calculator automatic us category ko select kar lega
4. User directly product options choose kar sakta hai

### 4. **Custom Pricing**

Calculator se jo price calculate hoga exactly wahi price cart me jayega:
- WooCommerce ka default price override ho jayega
- Cart total correctly calculate hoga
- Order me correct price save hoga

---

## 🧪 Testing Checklist

### Pre-Installation Testing:
- [ ] WooCommerce installed and active?
- [ ] PHP version 7.4 or higher?
- [ ] WordPress 5.8 or higher?

### Post-Installation Testing:
- [ ] Plugin activated successfully?
- [ ] Settings page accessible (WooCommerce → 4over Calculator)?
- [ ] Calculator URL saved correctly?

### Product Configuration Testing:
- [ ] Category ID field visible in product edit screen?
- [ ] Enable calculator checkbox working?
- [ ] Product saves without errors?

### Frontend Testing:
- [ ] Product page loads without errors?
- [ ] Default WooCommerce form is hidden?
- [ ] Calculator iframe loads?
- [ ] Calculator shows correct category?
- [ ] Options are selectable?
- [ ] Price updates when options change?

### Cart Testing:
- [ ] "Add to Cart" button enabled after selecting options?
- [ ] Clicking "Add to Cart" adds product to cart?
- [ ] Cart redirects properly?
- [ ] Custom price shows in cart?
- [ ] All variants visible in cart (Size, Stock, Coating, etc.)?
- [ ] Configuration summary visible?

### Checkout & Order Testing:
- [ ] Checkout page loads with correct price?
- [ ] Order can be placed successfully?
- [ ] Order confirmation shows all variant details?
- [ ] Admin order view shows all configuration?
- [ ] Order email includes variant information?

### Browser Testing:
- [ ] Works in Chrome?
- [ ] Works in Firefox?
- [ ] Works in Safari?
- [ ] Works on mobile devices?

---

## 🐛 Troubleshooting (Common Issues)

### Issue 1: Calculator Not Loading

**Symptoms:**
- Iframe not visible
- Page shows nothing where calculator should be

**Solutions:**
1. Check browser console (F12) for errors
2. Verify calculator URL is correct in settings
3. Check category ID is correctly entered
4. Clear browser cache
5. Check if ad-blocker is interfering

**Debug Code:**
```javascript
// Add to browser console
console.log('Category ID:', fouroverCalc.categoryId);
console.log('Product ID:', fouroverCalc.productId);
```

### Issue 2: Default WooCommerce Form Still Showing

**Symptoms:**
- Both calculator and WooCommerce form visible
- Confused user experience

**Solutions:**
1. Check "Enable Calculator" is checked
2. Hard refresh page (Ctrl+Shift+R)
3. Check theme CSS isn't overriding plugin CSS
4. Add this to your theme's CSS:
```css
body.fourover-calculator-active div.product form.cart {
    display: none !important;
}
```

### Issue 3: Price Not Updating

**Symptoms:**
- Calculator shows price but cart shows different price
- Price not showing at all

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify postMessage is working:
```javascript
window.addEventListener('message', function(e) {
    console.log('Message received:', e.data);
});
```
3. Check calculator domain is whitelisted in calculator.js
4. Clear cart and try again

### Issue 4: Variants Not Showing in Cart

**Symptoms:**
- Product added to cart but no variant details
- Only price visible

**Solutions:**
1. Check calculator is sending correct data format
2. Verify options are being captured:
```javascript
console.log(jQuery('#fourover-selected-options').val());
```
3. Check PHP error logs: `wp-content/debug.log`
4. Enable WordPress debug mode:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Issue 5: CORS Errors

**Symptoms:**
- Console shows "blocked by CORS policy"
- Calculator not communicating with WordPress

**Solutions:**
1. Verify calculator URL in settings matches actual deployment
2. Check Vercel deployment is successful
3. Ensure calculator origin is whitelisted in `calculator.js`:
```javascript
const allowedOrigins = [
    'https://v0-businesscardcalculator.vercel.app',
    'http://localhost:3000'  // Add your domain here
];
```

### Issue 6: Add to Cart Button Disabled

**Symptoms:**
- Button remains greyed out
- Can't add product to cart

**Solutions:**
1. Check if price is greater than 0
2. Verify calculator data is received:
```javascript
console.log(calculatorData);
```
3. Check browser console for JavaScript errors
4. Try selecting different options in calculator

---

## 🎨 Customization Options

### Custom Styling

**Change Calculator Container Style:**
```css
.fourover-calculator-wrapper {
    background: #ffffff;  /* White background */
    padding: 30px;
    border: 1px solid #ddd;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

**Change Add to Cart Button:**
```css
#fourover-add-to-cart-btn {
    background-color: #ff6600 !important;  /* Orange button */
    font-size: 18px;
    padding: 15px 40px;
}
```

**Change Price Display:**
```css
.fourover-price .price-amount {
    color: #ff0000;  /* Red price */
    font-size: 28px;
}
```

### Custom Functionality

**Auto-redirect to Checkout:**

Add this to your theme's functions.php or create a custom plugin:

```php
add_filter('woocommerce_add_to_cart_redirect', 'fourover_redirect_to_checkout');
function fourover_redirect_to_checkout($url) {
    global $post;
    $has_calculator = get_post_meta($post->ID, '_4over_calculator_enabled', true);

    if ($has_calculator === 'yes') {
        return wc_get_checkout_url();  // Redirect to checkout instead of cart
    }

    return $url;
}
```

**Minimum Order Requirement:**

```php
add_action('woocommerce_check_cart_items', 'fourover_minimum_order_check');
function fourover_minimum_order_check() {
    $minimum = 50;  // Minimum order amount

    if (WC()->cart->subtotal < $minimum) {
        wc_add_notice(
            sprintf('Minimum order amount is $%s. Your current order is $%s.',
                $minimum,
                WC()->cart->subtotal
            ),
            'error'
        );
    }
}
```

**Hide Other Products (Only Show Calculator Products):**

```php
add_action('pre_get_posts', 'fourover_filter_shop_products');
function fourover_filter_shop_products($query) {
    if (!is_admin() && $query->is_main_query() && is_shop()) {
        $meta_query = array(
            array(
                'key' => '_4over_calculator_enabled',
                'value' => 'yes',
                'compare' => '='
            )
        );
        $query->set('meta_query', $meta_query);
    }
}
```

---

## 📱 Mobile Responsiveness

Plugin automatically mobile responsive hai, but agar customize karna ho:

```css
@media (max-width: 768px) {
    .fourover-calculator-wrapper {
        padding: 15px;
    }

    #fourover-calculator-iframe {
        min-height: 600px;  /* Smaller height for mobile */
    }

    .fourover-cart-actions {
        flex-direction: column;
        align-items: stretch;
    }

    #fourover-add-to-cart-btn {
        width: 100%;
        margin-bottom: 10px;
    }
}
```

---

## 🚀 Production Deployment

### Pre-Launch Checklist:

1. **Test on Staging Site:**
   - [ ] Complete installation
   - [ ] Test all features
   - [ ] Place test orders
   - [ ] Verify emails
   - [ ] Check admin order view

2. **Backup Everything:**
   - [ ] Database backup
   - [ ] WordPress files backup
   - [ ] WooCommerce settings export

3. **Performance Check:**
   - [ ] Page load speed acceptable?
   - [ ] Calculator loads quickly?
   - [ ] No JavaScript errors?

4. **Security Review:**
   - [ ] API keys secure?
   - [ ] No sensitive data exposed?
   - [ ] HTTPS enabled?

5. **Launch:**
   - [ ] Install plugin on production
   - [ ] Configure settings
   - [ ] Test with real product
   - [ ] Monitor error logs
   - [ ] Test complete purchase flow

### Post-Launch Monitoring:

```php
// Add to functions.php for error logging
add_action('fourover_calculator_error', 'log_fourover_errors', 10, 2);
function log_fourover_errors($error_type, $error_message) {
    error_log("4over Calculator Error [{$error_type}]: {$error_message}");
}
```

---

## 📞 Support & Help

### Documentation Files:
- `COMPLETE_INSTALLATION_GUIDE.md` - This file (complete guide)
- `wordpress-plugin/4over-calculator-integration/README.md` - Technical documentation
- `WORDPRESS_INTEGRATION_SUMMARY.md` - Project overview

### Debug Mode:

Enable WordPress debug to see detailed errors:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);  // Don't show errors on frontend
```

Check logs at: `wp-content/debug.log`

### Browser Console:

Check JavaScript errors:
1. Press F12
2. Go to "Console" tab
3. Look for red error messages

### Common Error Messages:

**"fouroverCalc object not found"**
- Solution: Check if calculator.js is loaded properly

**"Failed to add product to cart"**
- Solution: Check WooCommerce is active and working

**"Invalid product or price"**
- Solution: Verify calculator is sending correct price data

---

## 🎉 Success!

Agar sab kuch sahi configure hua hai to:

✅ Product page pe sirf calculator dikhai dega
✅ Users options select kar sakte hain
✅ Price automatically calculate hoga
✅ Cart me sare variants details show honge
✅ Orders me complete configuration save hoga
✅ Customers aur admin dono complete details dekh sakte hain

**Your 4over Calculator is now fully integrated with WooCommerce! 🚀**

---

## Next Steps

1. **Deploy Updated Calculator to Vercel** (agar changes kiye ho)
2. **Test Thoroughly** on staging site
3. **Train Your Team** on how to use it
4. **Create Sample Products** with different categories
5. **Monitor Orders** to ensure everything is working
6. **Collect Customer Feedback**
7. **Optimize** based on usage patterns

**Good luck! 🎊**
