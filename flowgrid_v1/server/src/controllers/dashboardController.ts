import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Employee } from '../models/Employee.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Calculate date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Revenue (current month)
    const currentMonthOrders = await Order.find({
      orderDate: { $gte: firstDayOfMonth },
      status: { $ne: 'cancelled' },
    });
    const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);

    // Last month revenue for comparison
    const lastMonthOrders = await Order.find({
      orderDate: { $gte: lastMonth, $lte: lastMonthEnd },
      status: { $ne: 'cancelled' },
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueChange = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Active Orders
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'processing', 'shipped'] },
    });

    // Inventory Value
    const products = await Product.find({ status: { $ne: 'inactive' } });
    const inventoryValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    // Total Employees
    const totalEmployees = await Employee.countDocuments({ status: 'active' });

    // Low Stock Items
    const lowStockItems = await Product.find({
      status: { $in: ['low_stock', 'out_of_stock'] },
    }).limit(10);

    // Recent Activity (last 10 orders)
    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(10)
      .populate('customerId', 'name');

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalRevenue: {
            value: totalRevenue,
            change: revenueChange,
          },
          activeOrders: {
            value: activeOrders,
          },
          inventoryValue: {
            value: inventoryValue,
          },
          totalEmployees: {
            value: totalEmployees,
          },
        },
        lowStockItems,
        recentOrders,
        monthlyRevenue,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: Record<string, any> = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    // Sales by status
    const ordersByStatus = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { orderDate: dateFilter } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    // Top customers
    const topCustomers = await Customer.find()
      .sort({ totalValue: -1 })
      .limit(10);

    // Top products (by order frequency)
    const topProducts = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { orderDate: dateFilter } }] : []),
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.productId',
          productName: { $first: '$orderItems.productName' },
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: '$orderItems.lineTotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Department stats
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalSalary: { $sum: '$baseSalary' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        ordersByStatus,
        topCustomers,
        topProducts,
        departmentStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
