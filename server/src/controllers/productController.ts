import { Request, Response } from 'express';
import { Product } from '../models/Product.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    
    const query: Record<string, any> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) query.category = category;
    if (status) query.status = status;

    const products = await Product.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Find the product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.assign(product, req.body);

    // If stock is being updated, auto-update status
    if (req.body.stock !== undefined) {
      if (product.stock === 0) {
        product.status = 'out_of_stock';
      } else if (product.stock < 10) {
        product.status = 'low_stock';
      } else {
        product.status = 'active';
      }
    }

    // Save (this will trigger pre-save hook)
    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      status: { $in: ['low_stock', 'out_of_stock'] },
    }).sort({ stock: 1 });

    res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
