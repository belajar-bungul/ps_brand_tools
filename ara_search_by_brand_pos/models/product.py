# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import api, fields, models, _


class ProductProduct(models.Model):
    _inherit = 'product.product'

    product_brand_id = fields.Many2one(
        comodel_name="product.brand",
        related="product_tmpl_id.product_brand_id",
        string="Brand",
        store=True,
        readonly=True,
    )

    x_brand_display = fields.Char(
        compute='_compute_brand_display',
        store=True
    )

    @api.depends('product_brand_id')
    def _compute_brand_display(self):
        for p in self:
            p.x_brand_display = p.product_brand_id.name if p.product_brand_id else ''

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields += ['x_brand_display', 'product_brand_id']
        return fields


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.model
    def _load_pos_data_models(self, config_id):
        data = super()._load_pos_data_models(config_id)
        data += ['product.brand']  # load model brand juga
        return data
