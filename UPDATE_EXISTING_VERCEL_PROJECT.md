# Update Existing Vercel Project (v0-businesscardcalculator)

## 🚨 Important Discovery

Aapne abhi jo deploy kiya, wo **NAYA project** ban gaya:
- New: `businesscardcalculator` (latest code ✅)
- Old: `v0-businesscardcalculator` (WordPress me use ho raha)

WordPress plugin me jo URL hai wo **purana** project hai:
```
https://v0-businesscardcalculator.vercel.app/
```

**Solution:** Purane project ko update karna hoga!

---

## 🚀 Option 1: Link to Existing Project (RECOMMENDED)

### Step 1: Remove Current Link
```bash
cd /Users/raza/Projects/businesscardcalculator
rm -rf .vercel
```

### Step 2: Link to Old Project
```bash
vercel link
```

**Prompts:**
1. "Set up ... ?"  → **YES**
2. "Which scope?" → Select your account
3. "Link to existing project?" → **YES**
4. "What's the name?" → Type: **v0-businesscardcalculator**

### Step 3: Deploy
```bash
vercel --prod
```

**Done!** Old URL will be updated! ✅

---

## 🚀 Option 2: Manual Vercel Dashboard

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Find Old Project
- Look for: **v0-businesscardcalculator**
- Click on it

### Step 3: Check Git Connection
- Go to: **Settings → Git**

**If NOT connected to Git:**
- You'll need to use Option 1 (Vercel CLI link)

**If connected to Git:**
- You need to push code to that Git repo

---

## 🚀 Option 3: Update WordPress Plugin URL

Agar purana project update nahi kar sakte, to WordPress me naya URL update karo:

### New Working URL:
```
https://businesscardcalculator-3imwu3sw3-support-5189s-projects.vercel.app
```

### Update WordPress:
1. WordPress Admin → WooCommerce → 4over Calculator
2. Calculator URL: `https://businesscardcalculator-3imwu3sw3-support-5189s-projects.vercel.app`
3. Save Changes

**But this is temporary!** Better to fix main project.

---

## 🎯 Recommended Solution

**Use Option 1 - Link to existing project:**

```bash
cd /Users/raza/Projects/businesscardcalculator

# Remove current project link
rm -rf .vercel

# Link to old project
vercel link
# → YES
# → Select your account
# → YES (link to existing)
# → Type: v0-businesscardcalculator

# Deploy to old project
vercel --prod
```

This will update your original `v0-businesscardcalculator.vercel.app` URL! ✅

---

## 🧪 Test After Update

### Test Calculator:
```
https://v0-businesscardcalculator.vercel.app/?categoryId=08a9625a-4152-40cf-9007-b2bbb349efec&embedded=true
```

**Browser Console (F12):**
- ✅ Should see: `[v0] embeddedMode: true`
- ✅ Should see: `[v0] categoryIdFromUrl: 08a9625a...`
- ✅ Should see: `[v0] Sending calculator data to WordPress`

### Test WordPress:
```
https://bc990.mailprosusa.com/product/business-cards/
```

**Check:**
- ✅ Calculator loads
- ✅ Category pre-selected
- ✅ Options work
- ✅ Price updates
- ✅ Add to cart works

---

## ✅ Quick Commands

```bash
# Navigate to project
cd /Users/raza/Projects/businesscardcalculator

# Remove current link
rm -rf .vercel

# Link to v0-businesscardcalculator
vercel link

# Deploy
vercel --prod
```

---

Ready to run these commands? Let me know! 🚀
