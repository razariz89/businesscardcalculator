"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Upload } from "lucide-react"

interface Category {
  category_uuid: string
  category_name: string
}

interface Product {
  product_uuid: string
  product_code: string
  product_description: string
}

interface Option {
  option_uuid: string
  option_name: string
  option_description: string | null
  capi_name: string
  capi_description: string
  option_prices?: string
}

interface OptionGroup {
  product_option_group_uuid: string
  product_option_group_name: string
  minoccurs: string
  maxoccurs: string
  options: Option[]
}

interface PriceData {
  price: number
  turnaround: string
  option_uuid: string
}

export default function BusinessCardCalculator() {
  // Get URL parameters for WordPress integration
  const searchParams = useSearchParams()
  const embeddedMode = searchParams?.get("embedded") === "true"
  const categoryIdFromUrl = searchParams?.get("categoryId") || ""

  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>(categoryIdFromUrl)
  const [productId, setProductId] = useState<string>("")

  const [cartData, setCartData] = useState<any>(null)

  // Add effect to log when sizes change
  useEffect(() => {
    console.log("[v0] Sizes state updated:", sizes)
  }, [sizes])

  // Add effect to log when selectedSize changes
  useEffect(() => {
    console.log("[v0] Selected size updated:", selectedSize)
  }, [selectedSize])

  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [prices, setPrices] = useState<PriceData[]>([])
  const [selectedTurnaround, setSelectedTurnaround] = useState<string>("")

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (categoryId) {
      loadProducts(categoryId)
    }
  }, [categoryId])

  useEffect(() => {
    if (productId) {
      loadOptionGroups(productId)
    }
  }, [productId])

  useEffect(() => {
    if (productId && Object.keys(selectedOptions).length > 0) {
      calculatePrices()
    }
  }, [selectedOptions, productId])

  // Auto-select hidden fields in embedded mode
  useEffect(() => {
    if (embeddedMode && optionGroups.length > 0) {
      const hiddenFieldsInEmbedded = ["Product Type", "Product Category", "Size", "Product Orientation", "Shape"]

      const newSelections: Record<string, string> = {}
      let hasNewSelections = false

      optionGroups.forEach((group) => {
        if (hiddenFieldsInEmbedded.includes(group.product_option_group_name)) {
          // If not already selected, select the first option
          if (!selectedOptions[group.product_option_group_name] && group.options.length > 0) {
            newSelections[group.product_option_group_name] = group.options[0].option_uuid
            hasNewSelections = true
          }
        }
      })

      if (hasNewSelections) {
        setSelectedOptions(prev => ({ ...prev, ...newSelections }))
      }
    }
  }, [embeddedMode, optionGroups])

  // Send iframe height to WordPress for dynamic resizing
  useEffect(() => {
    if (embeddedMode) {
      const sendHeight = () => {
        const height = document.documentElement.scrollHeight
        window.parent.postMessage({
          type: "RESIZE_IFRAME",
          height: height
        }, "*")
      }

      // Send height on mount and when content changes
      sendHeight()

      // Also send after a short delay to account for animations/loading
      const timer = setTimeout(sendHeight, 500)
      return () => clearTimeout(timer)
    }
  }, [embeddedMode, prices, selectedTurnaround, optionGroups])

  // Send calculator data to WordPress when price or options change
  useEffect(() => {
    if (embeddedMode && prices.length > 0 && selectedTurnaround) {
      const selectedPrice = prices.find((p) => p.option_uuid === selectedTurnaround)
      const quantity = getSelectedQuantity()

      // Get readable option names
      const optionDetails: Record<string, string> = {}
      optionGroups.forEach((group) => {
        const selectedOptionId = selectedOptions[group.product_option_group_name]
        const selectedOption = group.options.find((opt) => opt.option_uuid === selectedOptionId)
        if (selectedOption) {
          optionDetails[group.product_option_group_name] = selectedOption.option_description || selectedOption.option_name
        }
      })

      // Create details string
      const detailsParts = [
        selectedSize ? `Size: ${selectedSize}` : "",
        optionDetails["Stock"] ? `Stock: ${optionDetails["Stock"]}` : "",
        optionDetails["Coating"] ? `Coating: ${optionDetails["Coating"]}` : "",
        optionDetails["Colorspec"] ? `Color: ${optionDetails["Colorspec"]}` : "",
        quantity ? `Quantity: ${quantity}` : "",
        selectedPrice?.turnaround ? `Turnaround: ${selectedPrice.turnaround}` : "",
      ].filter(Boolean)

      const data = {
        type: "CALCULATOR_DATA",
        price: selectedPrice?.price || 0,
        options: {
          size: selectedSize,
          stock: optionDetails["Stock"] || "",
          coating: optionDetails["Coating"] || "",
          colorspec: optionDetails["Colorspec"] || "",
          quantity: quantity,
          turnaround: selectedPrice?.turnaround || "",
        },
        details: detailsParts.join(" | "),
        productId: productId,
        categoryId: categoryId,
      }

      console.log("[v0] Sending calculator data to WordPress:", data)
      window.parent.postMessage(data, "*")
    }
  }, [prices, selectedTurnaround, selectedOptions, embeddedMode, selectedSize])

  // Extract sizes when products change
  useEffect(() => {
    console.log("[v0] Size extraction useEffect triggered", {
      allProducts: allProducts.length,
      firstProduct: allProducts.length > 0 ? allProducts[0].product_description : null,
    })

    if (allProducts.length > 0) {
      console.log("[v0] Processing products for size extraction:", allProducts.length)
      const sizeSet = new Set<string>()

      // Log first 5 products to see their format
      allProducts.slice(0, 5).forEach((product, index) => {
        console.log(`[v0] Product ${index}:`, JSON.stringify(product.product_description))
      })

      allProducts.forEach((product, index) => {
        // Extract size from product description (e.g., "2.5 x 2.5" from "2.5 x 2.5 Business Cards - 14pt Premium (Gloss)")
        // Handle different formats: "2.5\" X 2.5\"", "2.5 x 2.5", "2.5X2.5", etc.
        // Also handle newlines at the end of descriptions
        const cleanDescription = product.product_description.trim()
        const sizeMatch = cleanDescription.match(/^([\d.]+["]?\s*[xX]\s*[\d.]+["]?)/)
        if (sizeMatch) {
          // Normalize the size format - make it lowercase and remove extra spaces
          const normalizedSize = sizeMatch[1]
            .toLowerCase() // Make x lowercase
            .replace(/["]/g, "") // Remove quotes
            .replace(/\s+/g, " ") // Normalize spaces
            .replace(/\s*x\s*/g, "x") // Remove spaces around x
            .trim()
          sizeSet.add(normalizedSize)
          if (index < 5) {
            console.log(
              `[v0] Match found for product ${index}:`,
              JSON.stringify(sizeMatch[1]),
              "Normalized:",
              JSON.stringify(normalizedSize),
            )
          }
        } else if (index < 5) {
          console.log(`[v0] No match for product ${index}:`, JSON.stringify(cleanDescription))
        }
      })
      const uniqueSizes = Array.from(sizeSet).sort()
      console.log("[v0] Extracted sizes:", uniqueSizes)
      setSizes(uniqueSizes)

      // Auto-select first size if none selected
      if (!selectedSize && uniqueSizes.length > 0) {
        console.log("[v0] Auto-selecting first size:", uniqueSizes[0])
        setSelectedSize(uniqueSizes[0])
      }

      // Also log the state update
      console.log("[v0] Setting sizes state:", uniqueSizes.length)
    }
  }, [allProducts])

  // Filter products when size changes
  useEffect(() => {
    console.log("[v0] Filter useEffect triggered", {
      allProducts: allProducts.length,
      selectedSize,
      sizes: sizes.length,
      hasSizes: sizes.length > 0,
    })

    if (allProducts.length > 0) {
      if (selectedSize) {
        console.log("[v0] Filtering products by size:", selectedSize)
        // Normalize products to remove duplicates with same size but different formatting
        const normalizedProducts: Record<string, Product> = {}

        allProducts.forEach((product) => {
          // Check if product description starts with the selected size (accounting for different formats)
          const cleanDescription = product.product_description.trim()
          // Normalize the product description the same way we normalize sizes
          const normalizedDesc = cleanDescription
            .toLowerCase() // Make x lowercase
            .replace(/["]/g, "") // Remove quotes
            .replace(/\s+/g, " ") // Normalize spaces
            .replace(/\s*x\s*/g, "x") // Remove spaces around x
            .trim()

          if (normalizedDesc.startsWith(selectedSize)) {
            // Create a key that represents the unique product type (without specific identifiers)
            // This will group similar products together
            const productKey = normalizedDesc
              .replace(/\s*$$.*?$$\s*/g, "") // Remove anything in parentheses
              .replace(/\s*-.*$/g, "") // Remove everything after dash
              .trim()

            // If we haven't seen this product type yet, or if this one seems more generic, use it
            if (
              !normalizedProducts[productKey] ||
              product.product_description.length < normalizedProducts[productKey].product_description.length
            ) {
              normalizedProducts[productKey] = product
            }
          }
        })

        const filtered = Object.values(normalizedProducts)
        console.log("[v0] Filtered products count:", filtered.length)
        setFilteredProducts(filtered)

        // Auto-select first product of selected size
        if (filtered.length > 0 && !productId) {
          console.log("[v0] Auto-selecting first filtered product:", filtered[0].product_uuid)
          setProductId(filtered[0].product_uuid)
        }
      } else {
        // If no size selected, show all products but still normalize them
        console.log("[v0] No size selected, showing all products")

        // Normalize all products to remove duplicates
        const normalizedProducts: Record<string, Product> = {}

        allProducts.forEach((product) => {
          const cleanDescription = product.product_description.trim()
          // Normalize the product description
          const normalizedDesc = cleanDescription
            .toLowerCase()
            .replace(/["]/g, "")
            .replace(/\s+/g, " ")
            .replace(/\s*x\s*/g, "x")
            .trim()

          // Create a key that represents the unique product type
          const productKey = normalizedDesc
            .replace(/\s*$$.*?$$\s*/g, "")
            .replace(/\s*-.*$/g, "")
            .trim()

          // Keep the shortest description for each product type to avoid duplicates
          if (
            !normalizedProducts[productKey] ||
            product.product_description.length < normalizedProducts[productKey].product_description.length
          ) {
            normalizedProducts[productKey] = product
          }
        })

        const filtered = Object.values(normalizedProducts)
        setFilteredProducts(filtered)

        if (filtered.length > 0 && !productId) {
          console.log("[v0] Auto-selecting first product:", filtered[0].product_uuid)
          setProductId(filtered[0].product_uuid)
        }
      }
    } else {
      setFilteredProducts([])
      if (!productId) {
        setProductId("")
      }
    }
  }, [selectedSize, allProducts, productId, sizes])

  const loadCategories = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching categories...")
      const res = await fetch("/api/4over/categories")
      const data = await res.json()
      console.log("[v0] Categories:", data)

      if (data.entities) {
        setCategories(data.entities)
        // Auto-select category from URL if provided, otherwise select Business Cards
        if (!categoryIdFromUrl) {
          const businessCards = data.entities.find((cat: Category) => cat.category_name === "Business Cards")
          if (businessCards) {
            setCategoryId(businessCards.category_uuid)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (catId: string) => {
    try {
      setProductsLoading(true)
      console.log("[v0] Fetching products for category:", catId)
      const res = await fetch(`/api/4over/categories/${catId}/products`)
      const data = await res.json()
      console.log("[v0] Products response:", data)

      if (data.entities) {
        console.log("[v0] Setting all products:", data.entities.length)
        setAllProducts(data.entities)
        // Size filtering will be handled by useEffect
      }
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setProductsLoading(false)
    }
  }

  const loadOptionGroups = async (prodId: string) => {
    try {
      console.log("[v0] Fetching option groups for product:", prodId)
      const res = await fetch(`/api/4over/products/${prodId}/optiongroups`)
      const data = await res.json()
      console.log("[v0] Option groups:", data)

      if (data.entities) {
        setOptionGroups(data.entities)

        const defaults: Record<string, string> = {}
        data.entities.forEach((group: OptionGroup) => {
          if (group.options && group.options.length > 0) {
            if (group.product_option_group_name === "Colorspec") {
              const fullColor = group.options.find((opt) => opt.option_name.includes("4/4"))
              defaults[group.product_option_group_name] = fullColor?.option_uuid || group.options[0].option_uuid
            } else if (group.product_option_group_name === "Runsize") {
              const qty1000 = group.options.find((opt) => opt.option_name === "1000")
              defaults[group.product_option_group_name] = qty1000?.option_uuid || group.options[0].option_uuid
            } else {
              defaults[group.product_option_group_name] = group.options[0].option_uuid
            }
          }
        })

        console.log("[v0] Default selections:", defaults)
        setSelectedOptions(defaults)
      }
    } catch (error) {
      console.error("[v0] Error loading option groups:", error)
    }
  }

  const calculatePrices = async () => {
    try {
      setCalculating(true)
      console.log("[v0] Calculating prices with selections:", selectedOptions)

      const turnaroundGroup = optionGroups.find((g) => g.product_option_group_name === "Turn Around Time")
      const runsizeGroup = optionGroups.find((g) => g.product_option_group_name === "Runsize")
      if (!turnaroundGroup || !runsizeGroup) {
        console.error("[v0] Missing Turn Around Time or Runsize groups")
        return
      }

      const selectedRunsizeOptionId = selectedOptions["Runsize"]
      const selectedRunsizeOption = runsizeGroup.options.find((opt) => opt.option_uuid === selectedRunsizeOptionId)
      const runsizeNumber = Number.parseInt(selectedRunsizeOption?.option_name || "0", 10)
      if (!runsizeNumber) {
        console.error("[v0] Invalid runsize number")
        return
      }

      const colorspecId = selectedOptions["Colorspec"]
      const runsizeId = selectedOptions["Runsize"]

      if (!colorspecId || !runsizeId) {
        console.error("[v0] Missing colorspec or runsize")
        return
      }

      const selectedOptionUuids = Object.entries(selectedOptions)
        .filter(([groupName]) => groupName !== "Turn Around Time")
        .map(([, optionId]) => optionId)

      const selectedColorspecId = selectedOptions["Colorspec"]

      const relevantTurnarounds = (turnaroundGroup.options as any[]).filter((opt: any) => {
        const runsizeOk = !opt.runsize_uuid || opt.runsize_uuid === selectedRunsizeOptionId
        const colorOk = !opt.colorspec_uuid || (selectedColorspecId ? opt.colorspec_uuid === selectedColorspecId : true)
        return runsizeOk && colorOk
      })

      const results = await Promise.all(
        relevantTurnarounds.map(async (turnOption: any) => {
          const payload = {
            productId,
            colorspecId,
            runsizeId,
            turnaroundId: turnOption.option_uuid,
            selectedOptions: selectedOptionUuids,
          }
          try {
            const res = await fetch("/api/4over/price/quote", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || "quote failed")
            return {
              turnaround: turnOption.option_description || turnOption.option_name,
              option_uuid: turnOption.option_uuid,
              price: Number(data.total || 0),
            }
          } catch (e) {
            console.error("[v0] Quote error:", e)
            return null
          }
        }),
      )

      const valid = results.filter(Boolean) as PriceData[]
      setPrices(valid)

      if (valid.length > 0 && !selectedTurnaround) {
        setSelectedTurnaround(valid[0].option_uuid)
      }
    } catch (error) {
      console.error("[v0] Error calculating prices:", error)
    } finally {
      setCalculating(false)
    }
  }

  const handleOptionChange = (groupName: string, optionUuid: string) => {
    console.log("[v0] Option changed:", groupName, "->", optionUuid)
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: optionUuid,
    }))
  }

  const handleAddToCart = () => {
    if (!productId || !selectedTurnaround) {
      alert("Please select all required options")
      return
    }

    const selectedProduct = filteredProducts.find((p) => p.product_uuid === productId)
    const selectedPrice = prices.find((p) => p.option_uuid === selectedTurnaround)
    const quantity = getSelectedQuantity()

    // Get readable option names
    const optionDetails: Record<string, string> = {}
    optionGroups.forEach((group) => {
      const selectedOptionId = selectedOptions[group.product_option_group_name]
      const selectedOption = group.options.find((opt) => opt.option_uuid === selectedOptionId)
      if (selectedOption) {
        optionDetails[group.product_option_group_name] = selectedOption.option_description || selectedOption.option_name
      }
    })

    // Create details string for WordPress
    const detailsParts = [
      selectedSize ? `Size: ${selectedSize}` : "",
      optionDetails["Stock"] ? `Stock: ${optionDetails["Stock"]}` : "",
      optionDetails["Coating"] ? `Coating: ${optionDetails["Coating"]}` : "",
      optionDetails["Colorspec"] ? `Color: ${optionDetails["Colorspec"]}` : "",
      quantity ? `Quantity: ${quantity}` : "",
      selectedPrice?.turnaround ? `Turnaround: ${selectedPrice.turnaround}` : "",
    ].filter(Boolean)

    const data = {
      type: "ADD_TO_CART",
      price: selectedPrice?.price || 0,
      options: {
        size: selectedSize,
        stock: optionDetails["Stock"] || "",
        coating: optionDetails["Coating"] || "",
        colorspec: optionDetails["Colorspec"] || "",
        quantity: quantity,
        turnaround: selectedPrice?.turnaround || "",
      },
      details: detailsParts.join(" | "),
      productId: productId,
      categoryId: categoryId,
    }

    console.log("[v0] Sending add to cart data:", data)

    // Send data to parent window (WordPress)
    if (window.parent !== window) {
      window.parent.postMessage(data, "*")
    } else {
      // If not embedded, show alert
      console.log("[v0] Not embedded, cart data:", data)
      alert(`Added to cart!\nPrice: $${selectedPrice?.price}\nDetails: ${data.details}`)
    }
  }

  const getSelectedQuantity = () => {
    const runsizeGroup = optionGroups.find((g) => g.product_option_group_name === "Runsize")
    if (!runsizeGroup) return "1000"

    const selectedRunsize = runsizeGroup.options.find((opt) => opt.option_uuid === selectedOptions["Runsize"])
    return selectedRunsize?.option_name || "1000"
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-12 w-full bg-gray-100 rounded-lg border border-gray-200"></div>
        </div>
      ))}
      <div className="space-y-3 pt-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-gray-50 rounded-lg border border-gray-200"></div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6">
        <LoadingSkeleton />
      </div>
    )
  }

  const sizeGroup = optionGroups.find((g) => g.product_option_group_name === "Size")
  const stockGroup = optionGroups.find((g) => g.product_option_group_name === "Stock")
  const coatingGroup = optionGroups.find((g) => g.product_option_group_name === "Coating")
  const colorspecGroup = optionGroups.find((g) => g.product_option_group_name === "Colorspec")
  const runsizeGroup = optionGroups.find((g) => g.product_option_group_name === "Runsize")
  const orientationGroup = optionGroups.find((g) => g.product_option_group_name === "Product Orientation")

  const quantity = getSelectedQuantity()
  const selectedProduct = filteredProducts.find((p) => p.product_uuid === productId)

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="space-y-6">
              {/* Hide category dropdown in embedded mode when category is passed via URL */}
              {categories.length > 0 && !embeddedMode && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_uuid} value={cat.category_uuid}>
                          {cat.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size Selection */}
              <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
                <Label htmlFor="size" className="text-base font-semibold text-left">Size</Label>
                {sizes.length > 0 ? (
                  <Select
                    value={selectedSize}
                    onValueChange={(value) => {
                      console.log("[v0] Size selected:", value)
                      setSelectedSize(value)
                    }}
                  >
                    <SelectTrigger id="size" className="h-12 text-base">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 flex items-center justify-center bg-gray-50 rounded-lg border animate-pulse">
                    <span className="text-sm text-muted-foreground">Loading sizes...</span>
                  </div>
                )}
              </div>

              {/* Product Selection */}
              {(productsLoading || filteredProducts.length > 0 || allProducts.length > 0) && (
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Select value={productId || ""} onValueChange={setProductId}>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(filteredProducts.length > 0 ? filteredProducts : allProducts).map((prod) => (
                          <SelectItem key={prod.product_uuid} value={prod.product_uuid || ""}>
                            {prod.product_description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {optionGroups.map((group) => {
                // Skip Turn Around Time - it's handled separately below
                if (group.product_option_group_name === "Turn Around Time") {
                  return null
                }

                // Hide these fields in embedded mode (WordPress handles them)
                const hiddenFieldsInEmbedded = [
                  "Product Type",
                  "Product Category",
                  "Size",
                  "Product Orientation",
                  "Shape"
                ]

                if (embeddedMode && hiddenFieldsInEmbedded.includes(group.product_option_group_name)) {
                  return null
                }

                return (
                  <div key={group.product_option_group_uuid} className="grid grid-cols-[180px_1fr] gap-4 items-center">
                    <Label htmlFor={group.product_option_group_name} className="text-base font-semibold text-left">{group.product_option_group_name}</Label>
                    <Select
                      value={selectedOptions[group.product_option_group_name] || ""}
                      onValueChange={(value) => handleOptionChange(group.product_option_group_name, value)}
                    >
                      <SelectTrigger id={group.product_option_group_name} className="h-12 text-base">
                        <SelectValue placeholder={`Select ${group.product_option_group_name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {group.options.map((option) => (
                          <SelectItem key={option.option_uuid} value={option.option_uuid || ""}>
                            {option.option_description || option.option_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}

              <div className="grid grid-cols-[180px_1fr] gap-4 pt-4">
                <Label className="text-base font-semibold text-left pt-2">Quantity</Label>
                <div className="space-y-3">
                  {calculating ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : prices.length > 0 ? (
                    <RadioGroup value={selectedTurnaround} onValueChange={setSelectedTurnaround}>
                      {prices.map((priceOption: any) => (
                        <div
                          key={priceOption.option_uuid}
                          className="flex items-center justify-between rounded-lg border-2 p-4 hover:border-blue-500 cursor-pointer transition-all data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={priceOption.option_uuid} id={priceOption.option_uuid} className="h-5 w-5" />
                            <div>
                              <Label htmlFor={priceOption.option_uuid} className="cursor-pointer font-semibold text-base">
                                Buy {quantity} pieces
                              </Label>
                              {priceOption.turnaround && (
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {priceOption.turnaround}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground line-through">${(priceOption.price * 1.1).toFixed(2)}</div>
                            <div className="font-bold text-xl">${(priceOption.price / Number.parseInt(quantity)).toFixed(2)}</div>
                            <div className="text-xs font-bold">Total: ${priceOption.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4 bg-gray-50 rounded-lg border">Select all options to see pricing</div>
                  )}
                </div>
              </div>

              {/* Hide buttons in embedded mode - WordPress plugin handles add to cart */}
              {!embeddedMode && (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!productId || !selectedTurnaround || calculating}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    ADD TO CART
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    or <button className="text-primary hover:underline">Start Your Design Online</button>
                  </div>
                </>
              )}
      </div>
    </div>
  )
}
