# Quick Installation Guide - 4over Calculator WordPress Plugin

## Step-by-Step Installation (Urdu + English)

### Step 1: Plugin Upload Karna

**English:** Upload the plugin to WordPress
**Urdu:** Plugin ko WordPress mein upload karna

1. `4over-calculator-integration` folder ko ZIP file mein compress karo
2. WordPress admin panel mein jao
3. **Plugins → Add New → Upload Plugin** par click karo
4. ZIP file select karo aur **Install Now** click karo
5. Plugin install hone ke baad **Activate** click karo

---

### Step 2: Plugin Settings Configure Karna

**English:** Configure plugin settings
**Urdu:** Plugin ki settings set karna

1. WordPress admin mein **WooCommerce → 4over Calculator** par jao
2. **Calculator URL** field mein apni live calculator URL dalo:
   ```
   https://v0-businesscardcalculator.vercel.app
   ```
3. **Save Changes** click karo

---

### Step 3: Category ID Find Karna

**English:** Find the 4over Category ID
**Urdu:** 4over Category ID dhoondhna

#### Method 1: Browser Console Se

1. Apni calculator website kholo: https://v0-businesscardcalculator.vercel.app
2. Browser console kholo (F12 key press karo)
3. **Network** tab par jao
4. "Business Cards" ya koi category select karo
5. API call `/api/4over/categories` dhoodho
6. Response mein `category_uuid` copy karo

**Example Response:**
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

#### Method 2: Direct API Call

Browser mein yeh URL kholo (apni API key ke saath):
```
https://api.4over.com/printproducts/categories?apikey=bizcard&signature=af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b
```

---

### Step 4: Product Configure Karna

**English:** Configure WooCommerce product with calculator
**Urdu:** WooCommerce product mein calculator add karna

1. **Products → All Products** par jao
2. Koi product edit karo (ya nayi product banao)
3. **Product Data** section mein scroll karo
4. **4over Category ID** field mein category UUID paste karo
5. **Enable Calculator** checkbox check karo
6. **Publish** ya **Update** button click karo

**Screenshot Location:**
```
Product Data Section
  → General Tab
    → 4over Category ID: [abc-123-def-456]
    → ✓ Enable Calculator
```

---

### Step 5: Test Karna

**English:** Test the integration
**Urdu:** Integration test karna

1. Product page kholo jo aapne configure kiya
2. Calculator show hona chahiye
3. Options select karo (size, coating, etc.)
4. Pricing automatically calculate hogi
5. **Add to Cart** button click karo
6. Cart mein check karo - custom price show hoga

---

## Common Issues & Solutions
## Aam Masle aur Unke Hal

### Issue 1: Calculator Show Nahi Ho Raha

**Problem:** Product page par calculator nazar nahi aa raha

**Solution:**
- Check karo ke **Enable Calculator** checkbox checked hai
- Category ID correctly entered hai
- WooCommerce plugin active hai
- Browser cache clear karo

---

### Issue 2: Price Update Nahi Ho Rahi

**Problem:** Options select karne par price update nahi ho rahi

**Solution:**
1. Browser console kholo (F12)
2. Errors check karo
3. Ensure karo ke calculator URL correct hai settings mein
4. Page refresh karo

---

### Issue 3: Add to Cart Kaam Nahi Kar Raha

**Problem:** Add to cart button click karne par kuch nahi ho raha

**Solution:**
- Console mein JavaScript errors check karo
- WordPress debug mode enable karo:
  ```php
  // wp-config.php mein add karo
  define('WP_DEBUG', true);
  define('WP_DEBUG_LOG', true);
  ```
- Debug log check karo: `wp-content/debug.log`

---

## Shortcode Usage
## Shortcode Kaise Use Kare

Agar aap calculator ko kisi aur page par embed karna chahte hain:

```
[fourover_calculator category_id="YOUR_CATEGORY_UUID"]
```

**With custom height:**
```
[fourover_calculator category_id="YOUR_CATEGORY_UUID" height="1000px"]
```

**Example in WordPress Editor:**
```
[fourover_calculator category_id="abc-123-def-456" height="900px"]
```

---

## File Structure
## Plugin Files Ka Structure

```
4over-calculator-integration/
├── 4over-calculator.php          (Main plugin file)
├── assets/
│   └── js/
│       └── calculator.js          (Frontend JavaScript)
├── README.md                      (Detailed documentation)
└── INSTALLATION.md                (Yeh file)
```

---

## Advanced Configuration
## Advanced Settings

### Hide Default WooCommerce Price

Agar aap default price hide karna chahte hain:

1. **WooCommerce → 4over Calculator** par jao
2. **Hide Default Price** checkbox check karo
3. Save Changes

### Custom Styling

Calculator ka appearance change karne ke liye:

**Appearance → Customize → Additional CSS** mein yeh code add karo:

```css
/* Calculator container styling */
.fourover-calculator-wrapper {
    background: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Calculator heading */
.fourover-calculator-wrapper h3 {
    color: #2c3e50;
    font-size: 24px;
    margin-bottom: 20px;
}

/* Iframe styling */
#fourover-calculator-iframe {
    border-radius: 8px;
}
```

---

## Next.js App Update (Already Done)
## Next.js App Updates (Ho Chuki Hain)

Aapki Next.js app ko automatically update kar diya gaya hai:

✅ URL parameters support (`?categoryId=XXX&embedded=true`)
✅ PostMessage communication with WordPress
✅ Auto-resize iframe
✅ Cart data communication

Bas Vercel par deploy karo:

```bash
git add .
git commit -m "Add WordPress integration support"
git push
```

Vercel automatically deploy kar dega!

---

## Testing Checklist
## Test Karne Ki List

- [ ] Plugin successfully activated
- [ ] Settings page accessible
- [ ] Calculator URL saved properly
- [ ] Category ID entered in product
- [ ] Calculator showing on product page
- [ ] Options selectable
- [ ] Price calculating correctly
- [ ] Add to cart working
- [ ] Custom price showing in cart
- [ ] Order contains configuration details

---

## Support & Help

**Plugin Issues:**
- Check WordPress debug log
- Enable browser console
- Review README.md for detailed docs

**Calculator Issues:**
- Check Vercel deployment
- Verify API connectivity
- Test calculator standalone first

**Integration Issues:**
- Verify postMessage is working (console.log)
- Check CORS settings
- Test iframe embedding

---

## Quick Reference - Category IDs

Yahan apne common category IDs note karo:

```
Business Cards:     _____________________
Postcards:          _____________________
Flyers:             _____________________
Brochures:          _____________________
Banners:            _____________________
```

---

## Contact

Plugin Issues: Check debug logs
Calculator Issues: Check browser console
4over API Issues: Contact 4over support

**Calculator Live URL:** https://v0-businesscardcalculator.vercel.app/

---

## Updates Deploy Karna

Jab aap Next.js app update karo:

1. Changes karo locally
2. Test karo: `npm run dev`
3. Git commit karo:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
4. Vercel automatically deploy karega
5. WordPress mein kuch change ki zaroorat nahi!

**Done! Aapka integration ready hai!** 🎉
