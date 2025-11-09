/** @odoo-module **/
import { patch } from "@web/core/utils/patch"
import { PosStore } from "@point_of_sale/app/store/pos_store"
import { _t } from "@web/core/l10n/translation"

patch(PosStore.prototype, {
    async setup(
        env,
        {
            number_buffer,
            hardware_proxy,
            barcode_reader,
            ui,
            dialog,
            notification,
            printer,
            bus_service,
            pos_data,
            pos_scale,
            action,
            alert,
        }
    ) {
        const result = super.setup(env, {
            number_buffer,
            hardware_proxy,
            barcode_reader,
            ui,
            dialog,
            notification,
            printer,
            bus_service,
            pos_data,
            pos_scale,
            action,
            alert,
        })
        this.searchBrandWord = ""
        return result
    },
})
