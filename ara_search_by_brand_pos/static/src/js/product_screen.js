/** @odoo-module **/
import { patch } from "@web/core/utils/patch"
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen"

patch(ProductScreen.prototype, {
    get searchWord() {
        return this.pos.searchProductWord.trim()
    },

    get searchBrand() {
        return this.pos.searchBrandWord.trim()
    },

    get productsToDisplay() {
        let list = this.products

        // 1️⃣ Filter by Brand dulu
        if (this.searchBrand !== "") {
            const brandWord = this.searchBrand.toLowerCase()
            if (!this._searchTriggered) {
                this.pos.setSelectedCategory(0)
                this._searchTriggered = true
            }
            list = list.filter(p => {
                const brandName = (p.x_brand_display || "").toLowerCase()
                return brandName.includes(brandWord)
            })
        }

        // 2️⃣ Filter by product name / barcode / default_code
        if (this.searchWord !== "") {
            if (!this._searchTriggered) {
                this.pos.setSelectedCategory(0)
                this._searchTriggered = true
            }

            const word = this.searchWord.toLowerCase()

            if (this.searchBrand !== "") {
                list = list.filter(p => {
                    const name = (p.display_name || "").toLowerCase()
                    const code = (p.default_code || "").toString().toLowerCase()
                    const barcode = (p.barcode || "").toString().toLowerCase()
                    return (
                        name.includes(word) ||
                        code.includes(word) ||
                        barcode.includes(word)
                    )
                })
            } else {
                list = this.addMainProductsToDisplay(
                    this.getProductsBySearchWord(this.searchWord)
                )
            }
        }

        // 3️⃣ Kalau tidak ada search, pakai kategori
        if (this.searchBrand === "" && this.searchWord === "") {
            this._searchTriggered = false
            if (this.pos.selectedCategory?.id) {
                list = this.getProductsByCategory(this.pos.selectedCategory)
            } else {
                list = this.products
            }
        }

        // 4️⃣ Exclude produk tertentu
        const excludedProductIds = [
            this.pos.config.tip_product_id?.id,
            ...this.pos.hiddenProductIds,
            ...this.pos.session._pos_special_products_ids,
        ]

        const filteredList = []
        for (const product of list) {
            if (filteredList.length >= 100) break
            if (
                !excludedProductIds.includes(product.id) &&
                product.canBeDisplayed
            ) {
                filteredList.push(product)
            }
        }

        // 5️⃣ Urutkan kalau tidak pakai search
        return this.searchWord !== "" || this.searchBrand !== ""
            ? filteredList
            : filteredList.sort((a, b) =>
                  a.display_name.localeCompare(b.display_name)
              )
    },
})
