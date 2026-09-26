import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Dialog } from '../../components/ui/Dialog';
import { ReorderRulesModal } from '../../components/products/ReorderRulesModal';
import { Plus, Sliders, Eye, Layers } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const ProductsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const products = useInventoryStore((state) => state.products);
  const categories = useInventoryStore((state) => state.categories);
  const addCategory = useInventoryStore((state) => state.addCategory);
  const updateReorderRules = useInventoryStore((state) => state.updateReorderRules);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [selectedProductForRules, setSelectedProductForRules] = useState(null);

  // Filtering
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (stockStatusFilter === 'LOW' && (p.totalStock === 0 || p.totalStock > p.minStock)) return false;
    if (stockStatusFilter === 'OUT' && p.totalStock > 0) return false;
    if (stockStatusFilter === 'IN' && p.totalStock === 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName || !newCatCode) return;
    addCategory({ name: newCatName, code: newCatCode, description: 'User added category' });
    toast.success('Category Added', `Category "${newCatName}" is now available.`);
    setNewCatName('');
    setNewCatCode('');
    setIsCategoryModalOpen(false);
  };

  const handleSaveReorderRules = (productId, rules) => {
    updateReorderRules(productId, rules);
    toast.success('Rules Updated', 'Reordering rules configured successfully.');
  };

  return (
    <div>
      <PageHeader
        title="Product Inventory Catalog"
        description="Manage master product records, SKU codes, stock levels, and automated reorder triggers."
      >
        <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(true)} icon={Layers}>
          Categories ({categories.length})
        </Button>
        <Button size="sm" onClick={() => navigate('/products/new')} icon={Plus}>
          Add Product
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by product name, SKU..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Availability Status */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN">In Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products match your criteria"
              description="Try adjusting your search query or filter selections."
              actionLabel="Add New Product"
              onAction={() => navigate('/products/new')}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU / Code</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isOut = p.totalStock === 0;
                  const isLow = p.totalStock > 0 && p.totalStock <= p.minStock;
                  const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-bold text-indigo-600">{p.sku}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                      <TableCell className="text-slate-600">{p.category}</TableCell>
                      <TableCell className="font-bold text-slate-900">{p.totalStock}</TableCell>
                      <TableCell className="text-slate-500">{p.minStock}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{p.uom}</TableCell>
                      <TableCell>
                        <Badge>{statusText}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Reordering Rules"
                            icon={Sliders}
                            onClick={() => setSelectedProductForRules(p)}
                          >
                            Rules
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Categories Management Dialog */}
      <Dialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Product Categories Management"
        description="View existing categories or create a new taxonomy category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4 mb-6 pb-6 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Category Name (e.g. Electrical Tools)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
            <input
              type="text"
              placeholder="Category Code (e.g. ELEC-TL)"
              value={newCatCode}
              onChange={(e) => setNewCatCode(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>
          <Button type="submit" size="sm" className="w-full">
            Add New Category
          </Button>
        </form>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Existing Categories:</h4>
          {categories.map((cat) => (
            <div key={cat.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-900">{cat.name}</span>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">{cat.code}</span>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Reorder Rules Modal */}
      {selectedProductForRules && (
        <ReorderRulesModal
          isOpen={!!selectedProductForRules}
          onClose={() => setSelectedProductForRules(null)}
          product={selectedProductForRules}
          onSave={handleSaveReorderRules}
        />
      )}
    </div>
  );
};
