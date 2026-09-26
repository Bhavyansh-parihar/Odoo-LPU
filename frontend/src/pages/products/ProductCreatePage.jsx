import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ProductForm } from '../../components/products/ProductForm';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ProductCreatePage = () => {
  const addProduct = useInventoryStore((state) => state.addProduct);
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const newProd = addProduct(data);
      toast.success('Product Created', `Product "${newProd.name}" (${newProd.sku}) has been created.`);
      navigate(`/products/${newProd.id}`);
    } catch (err) {
      toast.error('Error', 'Could not create product record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/products')}>
          Back to Products List
        </Button>
      </div>

      <PageHeader
        title="Create New Inventory Product"
        description="Register a new item, assign SKU code, define unit of measure and initial stock level."
      />

      <Card>
        <CardHeader>
          <CardTitle>Product Specification & Master Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Product Record" />
        </CardContent>
      </Card>
    </div>
  );
};
