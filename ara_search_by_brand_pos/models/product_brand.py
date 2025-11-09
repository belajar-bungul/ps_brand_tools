from odoo import api, fields, models, _


class ProductBrand(models.Model):
    _inherit = 'product.brand'

    name = fields.Char("Brand Name", required=True)
    description = fields.Text(translate=True)
    partner_id = fields.Many2one(
        "res.partner",
        string="Partner",
        help="Select a partner for this brand if any.",
        ondelete="restrict",
    )
    logo = fields.Binary("Logo File")
    product_ids = fields.One2many(
        "product.template", "product_brand_id", string="Brand Products"
    )
    products_count = fields.Integer(
        string="Number of products", compute="_compute_products_count"
    )

    @api.depends("product_ids")
    def _compute_products_count(self):
        product_model = self.env["product.template"]
        groups = product_model.read_group(
            [("product_brand_id", "in", self.ids)],
            ["product_brand_id"],
            ["product_brand_id"],
            lazy=False,
        )
        data = {group["product_brand_id"][0]: group["__count"] for group in groups}
        for brand in self:
            brand.products_count = data.get(brand.id, 0)

    @api.model
    def _load_pos_data(self, data):
        res = super()._load_pos_data(data) if hasattr(super(), '_load_pos_data') else {'data': [], 'fields': []}

        # Pastikan fields id dan name ada
        if 'id' not in res['fields']:
            res['fields'].append('id')
        if 'name' not in res['fields']:
            res['fields'].append('name')

        # Ambil semua brand yang belum ada di data POS
        brand_ids_set = {brand['id'] for brand in res['data']}
        brands = self.search_read([], fields=res['fields'])
        new_brands = [b for b in brands if b['id'] not in brand_ids_set]

        res['data'].extend(new_brands)
        return res
    
    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields += ['id', 'name']
        return fields