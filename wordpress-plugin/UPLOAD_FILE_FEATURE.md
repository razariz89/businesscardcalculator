# Upload File Feature - Implementation Summary

## Overview
Added NextDayFlyers-style file upload drawer to WordPress plugin for uploading artwork files (front/back) before adding to cart.

## Features Implemented

### 1. Iframe Width Fix
**Problem:** Iframe width inconsistent across sites (507px vs 700px)

**Solution:**
```css
.fourover-calculator-wrapper {
    width: 100% !important;
    max-width: 100% !important;
}

#fourover-calculator-iframe-wrapper {
    width: 100% !important;
    max-width: 100% !important;
}
```

### 2. Upload File Drawer

**Components:**
- **Upload Your File Button** - Opens the drawer
- **Drawer/Modal** - Slides in from right side
- **Front Side Upload** - Required for cart
- **Back Side Upload** - Optional
- **Add to Cart** - Enabled when front file uploaded
- **Upload Later** - Add to cart without files

**User Flow:**

1. **With Files:**
   - Click "Upload Your File"
   - Drawer opens
   - Upload front file (required) → Add to Cart enables
   - Optional: Upload back file
   - Click "Add to Cart" in drawer
   - Files info stored, product added to cart

2. **Without Files (Upload Later):**
   - Click "Upload Your File"
   - Click "Upload Later"
   - Product added to cart without files
   - Hidden field `fourover_upload_later=yes` set

**File Requirements:**
- **Front File:** Required for "Add to Cart" button activation
- **Back File:** Optional
- **Accepted Formats:** .pdf, .ai, .psd, .png, .jpg, .jpeg

### 3. Code Structure

**PHP (4over-calculator.php):**
```php
// Hidden fields for file data
<input type="hidden" id="fourover-front-file" name="fourover_front_file" value="" />
<input type="hidden" id="fourover-back-file" name="fourover_back_file" value="" />
<input type="hidden" id="fourover-upload-later" name="fourover_upload_later" value="" />

// Buttons
<button id="fourover-upload-file-btn">Upload Your File</button>
<button id="fourover-add-to-cart-btn">Add to Cart</button>

// Drawer HTML structure
<div id="fourover-upload-drawer">
    <div class="fourover-drawer-overlay"></div>
    <div class="fourover-drawer-content">
        <!-- Front/Back upload sections -->
        <!-- Drawer actions -->
    </div>
</div>
```

**JavaScript (calculator.js):**
```javascript
// File storage
let frontFile = null;
let backFile = null;

// Open/Close drawer
$('#fourover-upload-file-btn').click() → Open drawer
$('.fourover-drawer-close').click() → Close drawer

// File upload handling
- Device upload button click
- Drag & drop support
- File validation
- UI update (show filename, enable buttons)

// Add to Cart logic
- Requires front file
- Stores file names in hidden fields
- Closes drawer and triggers cart add

// Upload Later logic
- Sets upload_later flag
- Bypasses file requirement
- Adds to cart immediately
```

**CSS Styles:**
```css
/* Drawer positioning */
.fourover-upload-drawer { position: fixed; z-index: 999999; }

/* Drawer animation */
@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

/* Upload areas */
.fourover-upload-area { border: 2px dashed #ccc; }

/* Drag & drop visual feedback */
dragover → border-color: #4cae4c
```

### 4. Responsive Design

**Desktop (≥640px):**
- Labels: Left side
- Fields: Right side
- Drawer: 500px width, slides from right

**Mobile (<640px):**
- Labels: Top
- Fields: Bottom
- Drawer: Full width

### 5. Cart Integration

Files are stored in cart meta:
```php
// In cart item meta
'fourover_front_file' => 'filename.pdf'
'fourover_back_file' => 'filename.ai'
'fourover_upload_later' => 'yes'
```

## Files Modified

1. **4over-calculator.php**
   - Added upload button
   - Added drawer HTML structure
   - Added CSS styles for drawer
   - Added iframe width fixes

2. **calculator.js**
   - Added drawer open/close logic
   - Added file upload handlers
   - Added drag & drop support
   - Added Add to Cart/Upload Later logic

3. **business-card-calculator.tsx**
   - Fixed responsive breakpoints (sm: 640px)
   - Fixed height resizing (no infinite loop)
   - Made pricing cards always inline

## Testing Checklist

- [ ] Upload front file → Add to Cart enables
- [ ] Upload back file → Optional, works
- [ ] Remove file → Resets UI, disables button
- [ ] Drag & drop → Works for both files
- [ ] Upload Later → Bypasses file requirement
- [ ] Drawer close (X button) → Works
- [ ] Drawer close (overlay click) → Works
- [ ] Mobile responsive → Drawer full width
- [ ] Desktop → Drawer 500px, slides right
- [ ] File info displays → Shows filename
- [ ] Cart meta → Files stored correctly

## Plugin Update

**Version:** 1.0.0
**File:** `4over-calculator-plugin.zip`

**Installation:**
1. Deactivate old plugin
2. Delete old plugin
3. Upload new `4over-calculator-plugin.zip`
4. Activate plugin
5. Clear browser cache

## Future Enhancements

- [ ] Actual file upload to server (currently just stores names)
- [ ] File size validation
- [ ] File preview thumbnails
- [ ] Progress bar for uploads
- [ ] Multiple file support
- [ ] Direct integration with 4over API for file submission
