import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU / Code is required'),
  category: z.string().min(1, 'Please select a category'),
  uom: z.string().min(1, 'Please select a Unit of Measure'),
  initialStock: z.coerce.number().min(0, 'Initial stock cannot be negative'),
  minStock: z.coerce.number().min(0, 'Minimum stock cannot be negative').default(10),
  reorderQty: z.coerce.number().min(1, 'Reorder quantity must be at least 1').default(20),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative').optional(),
  salePrice: z.coerce.number().min(0, 'Sale price cannot be negative').optional(),
  description: z.string().optional()
});

export const reorderRuleSchema = z.object({
  minQty: z.coerce.number().min(0, 'Minimum quantity must be 0 or more'),
  maxQty: z.coerce.number().min(1, 'Maximum quantity must be greater than 0'),
  autoTrigger: z.boolean().default(true)
}).refine(data => data.maxQty > data.minQty, {
  message: 'Maximum quantity must be greater than Minimum quantity',
  path: ['maxQty']
});

export const receiptSchema = z.object({
  supplier: z.string().min(2, 'Supplier name is required'),
  destinationLocation: z.string().min(1, 'Destination location is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product selection required'),
      qtyExpected: z.coerce.number().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one product item is required')
});

export const deliverySchema = z.object({
  customer: z.string().min(2, 'Customer name is required'),
  sourceLocation: z.string().min(1, 'Source location is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product selection required'),
      qtyDemand: z.coerce.number().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one product item is required')
});

export const transferSchema = z.object({
  sourceLocation: z.string().min(1, 'Source location is required'),
  destinationLocation: z.string().min(1, 'Destination location is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product selection required'),
      qty: z.coerce.number().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one product item is required')
}).refine(data => data.sourceLocation !== data.destinationLocation, {
  message: 'Source and destination locations cannot be identical',
  path: ['destinationLocation']
});

export const adjustmentSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  productId: z.string().min(1, 'Product selection is required'),
  recordedQty: z.coerce.number(),
  countedQty: z.coerce.number().min(0, 'Counted quantity cannot be negative'),
  reason: z.string().min(3, 'Reason for adjustment is required')
});

export const warehouseSchema = z.object({
  code: z.string().min(2, 'Warehouse code is required'),
  name: z.string().min(2, 'Warehouse name is required'),
  address: z.string().min(5, 'Address is required'),
  manager: z.string().min(2, 'Manager name is required'),
  phone: z.string().min(5, 'Phone number is required')
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  department: z.string().min(2, 'Department is required'),
  assignedWarehouse: z.string().min(2, 'Assigned warehouse is required')
});
