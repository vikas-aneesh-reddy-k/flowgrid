import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock';
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'low_stock'],
    default: 'active',
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Auto-update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.stock < 10) {
    this.status = 'low_stock';
  } else if (this.status === 'out_of_stock' || this.status === 'low_stock') {
    this.status = 'active';
  }
  next();
});

productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
