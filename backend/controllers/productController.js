const Product = require('../models/Product');

// @desc  Get products — public gets available only, admin passes ?all=true
// @route GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isAvailable: true };
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Create a product — accepts FormData (multipart) with URL images + file uploads
// @route POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, description, isAvailable, urlImages, ingredients, shelfLife, instructions, weights } = req.body;

        if (!name || !price || !category || !description) {
            return res.status(400).json({ message: 'Name, price, category and description are required' });
        }

        // Collect URL images (can be single string or array from FormData)
        let images = [];
        if (urlImages) {
            images = Array.isArray(urlImages) ? urlImages : [urlImages];
        }
        // Add uploaded files
        if (req.files && req.files.length > 0) {
            const filePaths = req.files.map(f => `/uploads/${f.filename}`);
            images = [...images, ...filePaths];
        }

        let parsedWeights = [];
        if (weights) {
            try { parsedWeights = typeof weights === 'string' ? JSON.parse(weights) : weights; }
            catch(e) {}
        }

        const product = new Product({
            name,
            price: Number(price),
            category,
            description,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            images,
            ingredients: ingredients || '',
            shelfLife: shelfLife || '',
            instructions: instructions || '',
            weights: parsedWeights
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc  Update product — FormData for full edit, JSON for simple toggle
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const isJson = req.headers['content-type']?.includes('application/json');

        if (isJson) {
            // Simple toggle (availability, or any single field)
            const { name, price, category, description, isAvailable, ingredients, shelfLife, instructions, weights } = req.body;
            if (name        !== undefined) product.name        = name;
            if (price       !== undefined) product.price       = Number(price);
            if (category    !== undefined) product.category    = category;
            if (description !== undefined) product.description = description;
            if (isAvailable !== undefined) product.isAvailable = isAvailable;
            if (ingredients !== undefined) product.ingredients = ingredients;
            if (shelfLife   !== undefined) product.shelfLife   = shelfLife;
            if (instructions!== undefined) product.instructions= instructions;
            if (weights     !== undefined) product.weights     = weights;
        } else {
            // Full FormData edit
            const { name, price, category, description, isAvailable, urlImages, ingredients, shelfLife, instructions, weights } = req.body;

            if (name)        product.name        = name;
            if (price)       product.price       = Number(price);
            if (category)    product.category    = category;
            if (description) product.description = description;
            if (ingredients !== undefined) product.ingredients = ingredients;
            if (shelfLife   !== undefined) product.shelfLife   = shelfLife;
            if (instructions!== undefined) product.instructions= instructions;
            
            if (weights) {
                try { product.weights = typeof weights === 'string' ? JSON.parse(weights) : weights; }
                catch(e) {}
            }

            product.isAvailable = isAvailable === 'true' || isAvailable === true;

            // Build new images array
            let images = [];
            if (urlImages) {
                images = Array.isArray(urlImages) ? urlImages : [urlImages];
            }
            if (req.files && req.files.length > 0) {
                const filePaths = req.files.map(f => `/uploads/${f.filename}`);
                images = [...images, ...filePaths];
            }
            // Only update images if something was provided, otherwise keep existing
            if (images.length > 0) {
                product.images = images;
            }
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc  Delete a product
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.deleteOne();
        res.json({ message: 'Product removed from menu' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};