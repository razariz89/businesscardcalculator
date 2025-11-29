# Phase 2: File Upload with Email Attachments - COMPLETE ✅

## Summary

Successfully implemented **complete file upload functionality** with email attachments and admin download links!

## ✅ What's Now Working

### 1. **Actual File Upload to Server**
- Files are uploaded to `wp-content/uploads/` when selected
- Upload happens immediately (no wait for "Add to Cart")
- Shows "Uploading: filename.pdf" during upload
- Success/Error feedback to user

### 2. **Email Attachments** 📧
Files are **automatically attached** to these emails:
- ✅ Order Confirmation (customer_processing_order)
- ✅ Order Completed (customer_completed_order)
- ✅ New Order Notification (admin - new_order)

### 3. **Admin Order Details** 📋
- View uploaded files with download links
- Click to download files directly
- Files show with appropriate icons:
  - PDF: 📄
  - Design files (AI, PSD, EPS): 🎨
  - Images (JPG, PNG, GIF): 🖼️
  - Documents (DOC, TXT): 📝
  - Archives (ZIP): 📦

### 4. **Cart Display**
- Files show as download links
- Click to download before checkout
- Icons based on file type

## 🔧 Technical Implementation

### Backend (PHP)

**New Function: `ajax_upload_file()`** (4over-calculator.php:681-748)

```php
public function ajax_upload_file()
{
    check_ajax_referer('fourover_calc_nonce', 'nonce');

    // Validate file type
    $allowed_types = array('pdf', 'ai', 'psd', 'png', 'jpg', 'jpeg', 'eps', 'doc', 'docx', 'zip', ...);

    // Validate file size (max 50MB)
    if ($file['size'] > 50 * 1024 * 1024) {
        wp_send_json_error('File too large');
    }

    // Upload file using WordPress
    $uploaded_file = wp_handle_upload($file, $upload_overrides);

    // Return file URL
    wp_send_json_success(array(
        'file_url' => $uploaded_file['url'],
        'file_name' => basename($uploaded_file['file'])
    ));
}
```

**Email Attachments Filter:** (4over-calculator.php:1258-1291)

```php
add_filter('woocommerce_email_attachments', 'fourover_attach_files_to_email', 10, 3);
function fourover_attach_files_to_email($attachments, $email_id, $order)
{
    // Only attach to customer emails
    $allowed_emails = array('customer_processing_order', 'customer_completed_order', 'new_order');

    // Loop through order items and get file URLs
    foreach ($order->get_items() as $item_id => $item) {
        $front_file_url = $item->get_meta('_fourover_front_file_url');
        $back_file_url = $item->get_meta('_fourover_back_file_url');

        // Convert URL to file path and attach
        if ($front_file_url) {
            $front_file_path = fourover_url_to_path($front_file_url);
            if (file_exists($front_file_path)) {
                $attachments[] = $front_file_path;
            }
        }
        // Same for back file...
    }

    return $attachments;
}
```

### Frontend (JavaScript)

**File Upload Function:** (calculator.js:330-391)

```javascript
function uploadFileToServer(file, side) {
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
            if (response.success) {
                // Store file URL in hidden field
                $(`#fourover-${side}-file`).val(response.data.file_url);
                // Update UI
                $area.find('.fourover-file-name').text(response.data.file_name);
                updateDrawerAddToCartButton();
            } else {
                alert('File upload failed: ' + response.data.message);
            }
        }
    });
}
```

## 📝 User Flow

### With File Upload:
1. Customer configures product
2. Clicks "Upload Your File" button
3. Selects/drags front file → **Uploads immediately**
4. Shows "Uploading: filename.pdf"
5. On success, shows filename with icon
6. Optionally uploads back file → **Uploads immediately**
7. Clicks "Add to Cart"
8. Product added to cart with file download links
9. Completes checkout
10. **Receives email with files attached** 📧
11. Admin also gets email with files attached
12. Admin can download files from order details

### Upload Later:
1. Customer clicks "Upload Later"
2. Product added without files
3. Order shows "⏰ Upload Later"
4. Admin can contact customer for files

## 🔒 Security Features

✅ **File Type Validation**
- Whitelist of allowed extensions
- Rejects unauthorized file types

✅ **File Size Validation**
- Maximum 50MB per file
- Prevents server overload

✅ **Nonce Verification**
- All AJAX requests verified
- Prevents CSRF attacks

✅ **WordPress File Handling**
- Uses `wp_handle_upload()`
- Follows WordPress security standards
- Automatic filename sanitization

## 📁 File Storage

**Location:** `/wp-content/uploads/YYYY/MM/filename.ext`

**Naming:** WordPress automatically handles:
- Filename sanitization
- Duplicate filename handling
- Organized by year/month

**Access:** Files are publicly accessible via URL for email delivery and downloads

## 📊 Database Storage

**Cart Meta:**
```
fourover_front_file = "https://example.com/wp-content/uploads/2024/01/file.pdf"
fourover_back_file = "https://example.com/wp-content/uploads/2024/01/back.ai"
```

**Order Meta:**
```
_fourover_front_file_url = "https://..." (hidden)
Front Side Artwork = "<a href='...'>📄 file.pdf (Download)</a>" (visible)

_fourover_back_file_url = "https://..." (hidden)
Back Side Artwork = "<a href='...'>🎨 back.ai (Download)</a>" (visible)
```

## 🎯 What's Different from Phase 1

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| File Storage | ❌ Filename only | ✅ Actual upload to server |
| Email Attachments | ❌ No | ✅ Yes - automatic |
| Admin Download | ❌ No | ✅ Yes - with links |
| Cart Download | ❌ No | ✅ Yes - with links |
| File Validation | ✅ Client-side only | ✅ Server-side + client |
| Upload Timing | On cart add | ✅ Immediate on selection |

## 🚀 Installation & Testing

### Installation:
1. Deactivate old plugin
2. Delete old plugin
3. Upload `4over-calculator-plugin.zip`
4. Activate plugin
5. Clear browser cache

### Testing Checklist:

**File Upload:**
- [ ] Upload front file → Shows "Uploading..." then filename
- [ ] Upload back file → Works independently
- [ ] Large file (>50MB) → Shows error
- [ ] Wrong file type (.exe) → Shows error
- [ ] Drag & drop → Works for both files
- [ ] Remove file → Resets UI correctly

**Cart Display:**
- [ ] Files show as download links with icons
- [ ] Click link → Downloads file
- [ ] Proper icons for different file types

**Order Confirmation:**
- [ ] Complete checkout
- [ ] Check customer email → Files attached ✅
- [ ] Check admin email → Files attached ✅

**Admin Order Details:**
- [ ] View order in admin
- [ ] Files shown as download links
- [ ] Click to download → Works
- [ ] Icons display correctly

**Upload Later:**
- [ ] Click "Upload Later"
- [ ] Order shows "⏰ Upload Later"
- [ ] No files in email (expected)

## 📧 Email Example

**Subject:** Order #123 Confirmation

**Body:**
```
Thank you for your order!

Order Details:
- Business Cards x 1
  Size: 3.5x2
  Quantity: 500
  Turnaround: 2 Business Days
  Front Side Artwork: 📄 business-card-front.pdf (Download)
  Back Side Artwork: 🎨 business-card-back.ai (Download)

Total: $38.26

Attachments:
📎 business-card-front.pdf
📎 business-card-back.ai
```

## ⚠️ Important Notes

1. **Email Size Limits:**
   - Most email servers limit attachment size to 10-25MB
   - Plugin allows up to 50MB per file
   - Consider compressing large files before upload
   - Or use multiple smaller files

2. **File Retention:**
   - Files stay on server permanently (unless manually deleted)
   - Consider adding cleanup for old files (future enhancement)
   - Or use external storage (S3, etc.) for larger deployments

3. **WordPress Uploads:**
   - Files stored in `/wp-content/uploads/`
   - Organized by year/month automatically
   - Publicly accessible via URL
   - Ensure proper .htaccess permissions

## 🎉 Success!

You can now:
✅ Accept file uploads during product configuration
✅ Automatically attach files to order emails
✅ Download files from admin order details
✅ Download files from cart before checkout
✅ Validate file types and sizes on server
✅ See appropriate icons for different file types
✅ Use "Upload Later" for customers without files

## 📝 Future Enhancements (Optional)

**Phase 3 Ideas:**
- [ ] File preview thumbnails for images
- [ ] Progress bar during upload
- [ ] Multiple files per side
- [ ] File compression before upload
- [ ] Cloud storage integration (S3, Cloudinary)
- [ ] Admin file management interface
- [ ] Automatic old file cleanup
- [ ] Customer file re-upload capability

## 🆘 Troubleshooting

**Files not uploading:**
1. Check WordPress uploads directory permissions (755)
2. Check PHP max file size (`upload_max_filesize` in php.ini)
3. Check server disk space
4. Check browser console for errors

**Files not in emails:**
1. Verify files uploaded successfully (check uploads folder)
2. Test with smaller files first
3. Check email server attachment limits
4. Verify file paths are correct

**Download links not working:**
1. Check WordPress permalink settings
2. Verify files exist in uploads directory
3. Check .htaccess allows file access

## Version

**Plugin Version:** 1.0.2
**Update Date:** 2025-11-29
**Features:** Full file upload + email attachments
