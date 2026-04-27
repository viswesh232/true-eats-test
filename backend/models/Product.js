const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    slug:         { type: String, unique: true },
    description:  { type: String, required: true },
    price:        { type: Number, required: true }, // base price
    category:     { type: String, required: true },
    images:       { type: [String], default: [] },  // array of URLs or local paths
    isAvailable:  { type: Boolean, default: true },
    ingredients:  { type: String, default: '' },
    shelfLife:    { type: String, default: '' },
    instructions: { type: String, default: '' },
    weights: [{
        weight: { type: String, required: true },
        price:  { type: Number, required: true }
    }],
}, { timestamps: true });

productSchema.pre('save', async function(next) {
    if (this.isModified('name') || !this.slug) {
        let baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let newSlug = baseSlug;
        
        if (this.isNew || this.isModified('name')) {
            const ProductModel = mongoose.models.Product || mongoose.model('Product');
            let slugExists = await ProductModel.exists({ slug: newSlug, _id: { $ne: this._id } });
            let count = 1;
            while (slugExists) {
                newSlug = `${baseSlug}-${count}`;
                slugExists = await ProductModel.exists({ slug: newSlug, _id: { $ne: this._id } });
                count++;
            }
        }
        this.slug = newSlug;
    }
    if (typeof next === 'function') next();
});

module.exports = mongoose.model('Product', productSchema);