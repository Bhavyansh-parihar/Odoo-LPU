import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StockByLocationTable } from '../../components/products/StockByLocationTable';
import { ReorderRulesModal } from '../../components/products/ReorderRulesModal';
import { ProductForm } from '../../components/products/ProductForm';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, Edit, Sliders, MapPin, Package, DollarSign } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const products = useInventoryStore((state) => state.products);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const updateReorderRules = useInventoryStore((state) => state.updateReorderRules);

  const product = products.find((p) => p.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested product ID does not exist in inventory records.</p>
        <Button onClick={() => navigate('/products')}>Return to Product Catalog</Button>
      </div>
    );
  }

  const isOut = product.totalStock === 0;
  const isLow = product.totalStock > 0 && product.totalStock <= product.minStock;
  const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

  const handleUpdate = (data) => {
    updateProduct(product.id, data);
    toast.success('Product Updated', `Changes saved for ${product.name}.`);
    setIsEditing(false);
  };

  const handleSaveReorderRules = (productId, rules) => {
    updateReorderRules(productId, rules);
    toast.success('Reorder Rules Updated', 'New safety stock levels set.');
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/products')}>
        Back to Product Catalog
      </Button>

      <PageHeader title={product.name} description={`SKU Code: ${product.sku} | Category: ${product.category}`}>
        <Button variant="outline" size="sm" icon={Sliders} onClick={() => setIsRulesModalOpen(true)}>
          Reordering Rules
        </Button>
        <Button variant={isEditing ? 'secondary' : 'primary'} size="sm" icon={Edit} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel Edit' : 'Update Product'}
        </Button>
      </PageHeader>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Product Record</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              initialValues={product}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Inventory Stock</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{product.totalStock} {product.uom}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Min Stock Safety Level</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{product.minStock} {product.uom}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Unit Selling Price</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">${product.salePrice?.toFixed(2) || '0.00'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Availability Status</p>
                  <div className="mt-1">
                    <Badge>{statusText}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Stock Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Availability per Warehouse Location</CardTitle>
            </CardHeader>
            <CardContent>
              <StockByLocationTable stockByLocation={product.stockByLocation} uom={product.uom} />
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specification & Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-700 leading-relaxed">
                {product.description || 'No detailed specifications provided for this product.'}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reordering Rules Modal */}
      {isRulesModalOpen && (
        <ReorderRulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          product={product}
          onSave={handleSaveReorderRules}
        />
      )}
    </div>
  );
};
