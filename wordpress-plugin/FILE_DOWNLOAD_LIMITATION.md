# File Download Limitation - Current Status

## Current Implementation

The plugin currently stores **filename information only**, not the actual file uploads.

### What Works Now:
✅ File selection in drawer (drag/drop or device upload)
✅ Filename storage in cart meta
✅ Filename display in cart with file type icons
✅ Filename display in order details (admin & customer)
✅ File type specific icons (PDF 📄, AI 🎨, Images 🖼️, etc.)
✅ Upload Later option

### What Doesn't Work Yet:
❌ Actual file upload to server
❌ File storage in WordPress uploads directory
❌ File download from cart/order details
❌ File preview/thumbnails
❌ File size validation on server

## Why Files Can't Be Downloaded Yet

The current implementation uses JavaScript `File` objects that exist only in the browser memory. When the form is submitted via AJAX, we send only the filename string to the server - not the actual file data.

## What's Needed for File Download (Phase 2)

### 1. File Upload Handling

**Frontend (calculator.js):**
```javascript
function uploadFile(file, side) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'fourover_upload_file');
    formData.append('nonce', fouroverCalc.nonce);
    formData.append('side', side);

    $.ajax({
        url: fouroverCalc.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            // Store the uploaded file URL
            if (response.success) {
                $(`#fourover-${side}-file`).val(response.data.file_url);
            }
        }
    });
}
```

**Backend (4over-calculator.php):**
```php
function fourover_handle_file_upload() {
    check_ajax_referer('fourover_calc_nonce', 'nonce');

    if (!isset($_FILES['file'])) {
        wp_send_json_error('No file uploaded');
        return;
    }

    $file = $_FILES['file'];
    $side = sanitize_text_field($_POST['side']);

    // Validate file type
    $allowed_types = array('pdf', 'ai', 'psd', 'png', 'jpg', 'jpeg');
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($file_ext, $allowed_types)) {
        wp_send_json_error('Invalid file type');
        return;
    }

    // Validate file size (max 50MB)
    if ($file['size'] > 50 * 1024 * 1024) {
        wp_send_json_error('File too large (max 50MB)');
        return;
    }

    // Upload file to WordPress uploads directory
    require_once(ABSPATH . 'wp-admin/includes/file.php');

    $upload_overrides = array(
        'test_form' => false,
        'mimes' => array(
            'pdf' => 'application/pdf',
            'ai' => 'application/postscript',
            'psd' => 'image/vnd.adobe.photoshop',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg'
        )
    );

    $uploaded_file = wp_handle_upload($file, $upload_overrides);

    if (isset($uploaded_file['error'])) {
        wp_send_json_error($uploaded_file['error']);
        return;
    }

    wp_send_json_success(array(
        'file_url' => $uploaded_file['url'],
        'file_path' => $uploaded_file['file']
    ));
}
add_action('wp_ajax_fourover_upload_file', 'fourover_handle_file_upload');
add_action('wp_ajax_nopriv_fourover_upload_file', 'fourover_handle_file_upload');
```

### 2. File Storage

Instead of storing just filenames, store full file URLs:

```php
// In cart item data
$cart_item_data['fourover_front_file_url'] = 'https://example.com/wp-content/uploads/2024/01/file.pdf';
$cart_item_data['fourover_front_file_name'] = 'business-card-front.pdf';
```

### 3. File Display with Download Links

**In cart and order details:**

```php
if (isset($cart_item['fourover_front_file_url']) && !empty($cart_item['fourover_front_file_url'])) {
    $icon = fourover_get_file_icon($cart_item['fourover_front_file_name']);
    $download_link = '<a href="' . esc_url($cart_item['fourover_front_file_url']) . '" download>' .
                     $icon . ' ' . esc_html($cart_item['fourover_front_file_name']) . '</a>';

    $item_data[] = array(
        'name' => __('Front Side Artwork', '4over-calc'),
        'value' => $download_link,
        'display' => ''
    );
}
```

### 4. Admin Order Details with Download Buttons

```php
add_action('woocommerce_admin_order_item_headers', 'fourover_add_order_file_column');
function fourover_add_order_file_column() {
    echo '<th class="fourover-files">Artwork Files</th>';
}

add_action('woocommerce_admin_order_item_values', 'fourover_add_order_file_downloads', 10, 3);
function fourover_add_order_file_downloads($product, $item, $item_id) {
    $front_file = wc_get_order_item_meta($item_id, 'fourover_front_file_url');
    $back_file = wc_get_order_item_meta($item_id, 'fourover_back_file_url');

    echo '<td class="fourover-files">';

    if ($front_file) {
        echo '<a href="' . esc_url($front_file) . '" class="button" download>Download Front</a><br>';
    }

    if ($back_file) {
        echo '<a href="' . esc_url($back_file) . '" class="button" download>Download Back</a>';
    }

    echo '</td>';
}
```

## Implementation Estimate

**Phase 2 - File Upload & Storage:**
- File upload AJAX handler
- Server-side validation (type, size)
- WordPress upload integration
- File URL storage
- Estimated: 4-6 hours

**Phase 3 - Download & Preview:**
- Download links in cart
- Download links in orders
- File preview for images
- Admin file management
- Estimated: 3-4 hours

**Phase 4 - Advanced Features:**
- Progress bars
- Multiple files per side
- File compression
- Integration with 4over API
- Estimated: 6-8 hours

## Current Workaround

For now, customers can:
1. Use "Upload Later" option
2. Email files separately after ordering
3. Upload files through customer portal (if available)

Admin can:
1. See which orders need file uploads ("⏰ Upload Later" indicator)
2. Contact customers to request files
3. Manually associate files with orders

## Security Considerations for Phase 2

- ✅ File type validation (whitelist only)
- ✅ File size limits (max 50MB)
- ✅ Nonce verification
- ✅ Sanitize filenames
- ✅ Generate unique filenames to prevent conflicts
- ✅ Store files outside public directory (optional)
- ✅ Virus scanning (optional, using ClamAV)

## Next Steps

To implement file downloads:
1. Add file upload AJAX handler
2. Update frontend to upload files immediately when selected
3. Store file URLs instead of just filenames
4. Add download links in cart/order displays
5. Add admin file management interface

Would you like me to implement Phase 2 now?
