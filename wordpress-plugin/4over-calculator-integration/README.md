# 4over Calculator Integration - WordPress Plugin

WordPress/WooCommerce plugin to integrate the 4over Business Card Calculator with your online store.

## Features

- ✅ Seamless integration with WooCommerce products
- ✅ Custom category ID field for each product
- ✅ Automatic price calculation from calculator
- ✅ Custom product options stored with orders
- ✅ Shortcode support for flexible placement
- ✅ Admin settings panel
- ✅ Responsive iframe integration
- ✅ AJAX add to cart functionality

## Installation

### Method 1: Upload via WordPress Admin

1. Download the `4over-calculator-integration` folder
2. Compress it into a ZIP file
3. In WordPress admin, go to **Plugins → Add New → Upload Plugin**
4. Choose the ZIP file and click **Install Now**
5. Click **Activate Plugin**

### Method 2: Manual Installation

1. Upload the `4over-calculator-integration` folder to `/wp-content/plugins/` directory
2. Activate the plugin through the **Plugins** menu in WordPress
3. Go to **WooCommerce → 4over Calculator** to configure settings

## Configuration

### Plugin Settings

1. Go to **WooCommerce → 4over Calculator**
2. Configure the following settings:

   - **Calculator URL**: Your deployed calculator URL (default: `https://v0-businesscardcalculator.vercel.app`)
   - **Auto Add to Cart**: Enable automatic cart addition
   - **Hide Default Price**: Hide WooCommerce default price when calculator is active

### Product Setup

1. Edit any WooCommerce product
2. Scroll to **Product Data** section
3. Find the **4over Category ID** field
4. Enter the 4over category UUID (e.g., from 4over API)
5. Check **Enable Calculator** checkbox
6. Save the product

**Example Category IDs:**
- Business Cards: Get from your 4over API
- Postcards: Get from your 4over API
- Flyers: Get from your 4over API

## Usage

### Automatic Display on Product Pages

Once configured, the calculator will automatically appear on product pages where:
- Category ID is set
- Calculator is enabled

### Manual Shortcode Usage

You can embed the calculator anywhere using shortcode:

```
[fourover_calculator category_id="YOUR_CATEGORY_UUID"]
```

**With custom height:**
```
[fourover_calculator category_id="YOUR_CATEGORY_UUID" height="1000px"]
```

## How It Works

### Data Flow

```
1. User visits WooCommerce product page
   ↓
2. Plugin loads calculator iframe with category ID
   ↓
3. User configures product in calculator
   ↓
4. Calculator sends data back to WordPress via postMessage
   ↓
5. User clicks "Add to Cart"
   ↓
6. Product added with custom price and configuration
   ↓
7. Configuration stored in order meta
```

### Cart Integration

When a user configures a product:

1. Calculator calculates the final price
2. Configuration details are stored
3. On "Add to Cart", custom price is applied
4. Order shows configuration in line items
5. Admin can see full configuration in order details

## Finding Category IDs

### Method 1: From 4over API

1. Visit your calculator at: `https://v0-businesscardcalculator.vercel.app`
2. Open browser console (F12)
3. Select a category (e.g., "Business Cards")
4. Look for API call to `/api/4over/categories`
5. Find the `category_uuid` for your desired category

### Method 2: Direct API Call

Make a request to:
```
https://api.4over.com/printproducts/categories?apikey=YOUR_KEY&signature=YOUR_SIG
```

Response will contain:
```json
{
  "entities": [
    {
      "category_uuid": "abc-123-def-456",
      "category_name": "Business Cards"
    }
  ]
}
```

## Customization

### Styling the Calculator

Add custom CSS in your theme's `style.css` or via **Appearance → Customize → Additional CSS**:

```css
/* Calculator container */
.fourover-calculator-wrapper {
    margin: 40px 0;
    padding: 30px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
}

/* Calculator heading */
.fourover-calculator-wrapper h3 {
    color: #333;
    font-size: 24px;
}

/* Iframe styling */
#fourover-calculator-iframe {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
```

### Custom Price Display

Filter the price display:

```php
add_filter('woocommerce_get_price_html', 'custom_fourover_price_display', 10, 2);
function custom_fourover_price_display($price, $product) {
    $category_id = get_post_meta($product->get_id(), '_4over_category_id', true);

    if (!empty($category_id)) {
        return '<span class="custom-price">Configure for pricing</span>';
    }

    return $price;
}
```

### Add Custom Fields to Calculator

Extend the calculator data:

```javascript
jQuery(document).on('fourover_calculator_updated', function(e, data) {
    console.log('Calculator data:', data);
    // Add your custom logic here
});
```

## Troubleshooting

### Calculator Not Showing

1. **Check WooCommerce is active**: Plugin requires WooCommerce
2. **Verify category ID**: Make sure valid UUID is entered
3. **Check "Enable Calculator"**: Checkbox must be checked
4. **Clear cache**: Clear browser and WordPress cache

### Price Not Updating

1. **Check browser console**: Look for JavaScript errors
2. **Verify AJAX URL**: Check `fouroverCalc.ajaxUrl` is defined
3. **Test postMessage**: Ensure iframe can communicate with parent

### CORS Issues

If calculator doesn't load:

1. Ensure calculator URL is correct in settings
2. Check browser console for CORS errors
3. Verify calculator allows embedding (X-Frame-Options)

### Iframe Height Issues

The plugin auto-resizes the iframe. If issues occur:

```javascript
// Manually set height
jQuery('#fourover-calculator-iframe').css('min-height', '1200px');
```

## Developer Hooks

### Actions

```php
// Before calculator displays
do_action('fourover_before_calculator', $product_id, $category_id);

// After calculator displays
do_action('fourover_after_calculator', $product_id, $category_id);
```

### Filters

```php
// Modify calculator URL
add_filter('fourover_calculator_url', function($url, $category_id) {
    return $url . '&custom=param';
}, 10, 2);

// Modify cart data before adding
add_filter('fourover_cart_item_data', function($data) {
    $data['custom_field'] = 'value';
    return $data;
});
```

## Advanced Configuration

### Modify Next.js App for Better Integration

Add this to your Next.js calculator to support embedding:

#### Update `components/business-card-calculator.tsx`

Add postMessage communication:

```typescript
// Add after calculating prices
useEffect(() => {
  if (typeof window !== 'undefined' && window.parent !== window) {
    // Send data to parent window (WordPress)
    window.parent.postMessage({
      type: 'CALCULATOR_DATA',
      price: selectedPrice,
      options: selectedOptions,
      details: getProductDetails(),
      productId: productId,
      categoryId: categoryId
    }, '*');
  }
}, [selectedOptions, prices, selectedTurnaround]);

// Listen for messages from parent
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'REQUEST_ADD_TO_CART') {
      // Send current configuration
      window.parent.postMessage({
        type: 'ADD_TO_CART',
        price: getCurrentPrice(),
        options: selectedOptions,
        details: getProductDetails()
      }, '*');
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [selectedOptions]);
```

### Query Parameter Support

Update your calculator to accept `?categoryId=XXX&embedded=true`:

```typescript
// In page.tsx or component
const searchParams = useSearchParams();
const embeddedMode = searchParams.get('embedded') === 'true';
const categoryIdFromUrl = searchParams.get('categoryId');

useEffect(() => {
  if (categoryIdFromUrl) {
    setCategoryId(categoryIdFromUrl);
  }
}, [categoryIdFromUrl]);
```

## Security

- ✅ Nonce verification for AJAX requests
- ✅ Data sanitization for all inputs
- ✅ Origin verification for postMessage
- ✅ Capability checks for admin functions

## Requirements

- WordPress 5.8+
- WooCommerce 5.0+
- PHP 7.4+
- Modern browser with postMessage support

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Enable WordPress debug mode
4. Contact support with error logs

## Changelog

### Version 1.0.0
- Initial release
- Basic calculator integration
- Custom field support
- Shortcode support
- Admin settings panel
- AJAX cart integration

## License

GPL v2 or later

## Credits

Developed for 4over printing products integration.
Calculator: https://v0-businesscardcalculator.vercel.app/
