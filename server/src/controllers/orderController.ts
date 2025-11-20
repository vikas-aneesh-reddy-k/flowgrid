import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { AuthRequest } from '../middleware/auth.js';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, customerId, page = 1, limit = 50 } = req.query;
    
    const query: Record<string, any> = {};
    
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .populate('orderItems.productId', 'name sku')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ orderDate: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
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

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId')
      .populate('orderItems.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, orderItems, shippingAddress } = req.body;

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Process order items and calculate totals
    const processedItems = [];
    let total = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const lineTotal = product.price * item.quantity;
      total += lineTotal;

      processedItems.push({
        productId: product._id,
        productSku: product.sku,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'pending',
      total,
      shippingAddress,
      orderItems: processedItems,
      invoice: {
        invoiceNumber,
        amount: total,
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      createdBy: req.user!.id,
      createdByName: req.user!.email,
    });

    // Update customer stats
    customer.totalOrders += 1;
    customer.totalValue += total;
    customer.lastContact = new Date();
    await customer.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, deliveryDate } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, deliveryDate },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paidDate, paymentMethod } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.invoice.status = status;
    if (paidDate) order.invoice.paidDate = paidDate;
    if (paymentMethod) order.invoice.paymentMethod = paymentMethod;

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
