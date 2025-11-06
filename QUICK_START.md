# 🚀 Quick Start Guide - 4over Calculator WooCommerce Integration

## 5-Minute Setup

### 1️⃣ Create Plugin ZIP (30 seconds)

```bash
cd wordpress-plugin
bash create-plugin-zip.sh
```

**Output:** `4over-calculator-plugin.zip` created

---

### 2️⃣ Install Plugin (1 minute)

1. WordPress Admin → Plugins → Add New
2. Click "Upload Plugin"
3. Choose `4over-calculator-plugin.zip`
4. Click "Install Now"
5. Click "Activate"

✅ Plugin installed!

---

### 3️⃣ Configure Settings (30 seconds)

1. WooCommerce → 4over Calculator
2. Calculator URL: `https://v0-businesscardcalculator.vercel.app`
3. Click "Save Changes"

✅ Settings saved!

---

### 4️⃣ Get Category ID (2 minutes)

**Method 1: Browser Console**
1. Open: https://v0-businesscardcalculator.vercel.app
2. Press `F12` (opens Developer Tools)
3. Click "Network" tab
4. In calculator, select category (e.g., "Business Cards")
5. In Network tab, find `/api/4over/categories`
6. Click it → Preview/Response
7. Find and copy `category_uuid`

**Example:**
```json
{
  "category_uuid": "abc-123-def-456-ghi-789",
  "category_name": "Business Cards"
}
```

Copy: `abc-123-def-456-ghi-789`

---

### 5️⃣ Setup Product (1 minute)

1. Products → All Products → [Your Product] → Edit
2. Scroll to "Product Data" section
3. Find "4over Category ID" field
4. Paste: `abc-123-def-456-ghi-789`
5. Check ✅ "Enable Calculator"
6. Click "Update"

✅ Product configured!

---

### 6️⃣ Test (30 seconds)

1. Visit product page
2. Should see:
   - ✅ Calculator loaded
   - ✅ No default WooCommerce form
   - ✅ Category pre-selected

3. Select options:
   - Size
   - Stock type
   - Coating
   - Quantity

4. Click "Add to Cart"

5. Check cart:
   - ✅ Custom price
   - ✅ All variants visible

**Done! 🎉**

---

## What You Get

### Product Page:
```
┌─────────────────────────────────────┐
│ Business Cards Premium              │
├─────────────────────────────────────┤
│                                     │
│  [Calculator Iframe]                │
│                                     │
│  Size: [3.5" x 2" ▼]               │
│  Stock: [14PT Cardstock ▼]         │
│  Coating: [UV Gloss ▼]             │
│  Quantity: [1000]                   │
│                                     │
│  Price: $89.99                      │
│                                     │
│  [Add to Cart Button]               │
│                                     │
└─────────────────────────────────────┘

❌ No WooCommerce default form
❌ No quantity selector
❌ No variations dropdown
```

### Cart:
```
┌─────────────────────────────────────┐
│ Cart                                │
├─────────────────────────────────────┤
│ Business Cards Premium              │
│ $89.99                              │
│                                     │
│ Size: 3.5" x 2"                     │
│ Stock: 14PT Cardstock               │
│ Coating: UV Gloss                   │
│ Quantity: 1000                      │
│ Turnaround: 4 Business Days         │
│                                     │
│ Configuration Summary: Size: 3.5x2  │
│ | Stock: 14PT | Coating: UV | ...   │
└─────────────────────────────────────┘
```

### Order:
```
┌─────────────────────────────────────┐
│ Order #12345                        │
├─────────────────────────────────────┤
│ Business Cards Premium              │
│ Quantity: 1                         │
│ Total: $89.99                       │
│                                     │
│ Product Configuration:              │
│ • Size: 3.5" x 2"                   │
│ • Stock: 14PT Cardstock             │
│ • Coating: UV Gloss                 │
│ • Quantity: 1000                    │
│ • Turnaround: 4 Business Days       │
│                                     │
│ Configuration Summary: [full text]  │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Calculator not showing?
```bash
# Check these:
- Plugin activated? ✓
- Category ID correct? ✓
- "Enable Calculator" checked? ✓
- Clear browser cache
```

### Default form still visible?
```bash
# Hard refresh:
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Price not updating?
```bash
# Check browser console:
F12 → Console tab
# Look for errors
```

### Need more help?
See: `COMPLETE_INSTALLATION_GUIDE.md`

---

## Multiple Products Setup

Har product ke liye:

```bash
1. Get category ID for product type
2. Edit product
3. Paste category ID
4. Enable calculator
5. Update
```

**Example:**

| Product | Category ID |
|---------|-------------|
| Business Cards | abc-123-def |
| Postcards | xyz-456-ghi |
| Flyers | mno-789-pqr |

---

## Production Checklist

Before going live:

- [ ] Test on staging site
- [ ] Place test order
- [ ] Check customer email
- [ ] Verify admin order view
- [ ] Test on mobile
- [ ] Clear all caches
- [ ] Backup database
- [ ] Monitor error logs

---

## File Reference

```
📁 wordpress-plugin/
├── 4over-calculator-plugin.zip           ← Upload this
├── COMPLETE_INSTALLATION_GUIDE.md        ← Full guide
├── INSTALLATION.md                       ← Previous guide
└── create-plugin-zip.sh                  ← ZIP creator

📁 Project root/
├── QUICK_START.md                        ← This file
├── FINAL_SUMMARY.md                      ← Complete summary
└── WORDPRESS_INTEGRATION_SUMMARY.md      ← Technical overview
```

---

## Quick Commands

```bash
# Create plugin ZIP
cd wordpress-plugin
bash create-plugin-zip.sh

# Check WordPress debug log
tail -f wp-content/debug.log

# Enable WordPress debug (wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

---

## Support

**Documentation:**
- Quick Start: `QUICK_START.md` (this file)
- Complete Guide: `COMPLETE_INSTALLATION_GUIDE.md`
- Summary: `FINAL_SUMMARY.md`

**Debug:**
- Browser Console: F12
- WordPress Logs: `wp-content/debug.log`
- Network Tab: F12 → Network

---

## Success! 🎉

If you see:
- ✅ Calculator on product page
- ✅ No WooCommerce form
- ✅ Variants in cart
- ✅ Details in order

**You're done! Start selling! 🚀**

---

**Version:** 1.0.0
**Status:** Production Ready
**Updated:** 2024
