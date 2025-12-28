import { Package, AlertTriangle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateStockDialog, setShowUpdateStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockUpdate, setStockUpdate] = useState({
    action: "add", // "add" or "set"
    quantity: "",
  });
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });

  const { data: productsData, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = productsData?.data || [];

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.status === 'low_stock').length;
  const outOfStockItems = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      });
      toast.success("Product created successfully");
      setShowCreateDialog(false);
      setFormData({ sku: "", name: "", description: "", category: "", price: "", stock: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  const handleOpenUpdateStock = (product: any) => {
    setSelectedProduct(product);
    setStockUpdate({ action: "add", quantity: "" });
    setShowUpdateStockDialog(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !stockUpdate.quantity) {
      toast.error("Missing Information", {
        description: "Please enter a quantity.",
      });
      return;
    }

    const quantity = parseInt(stockUpdate.quantity);
    let newStock: number;

    if (stockUpdate.action === "add") {
      newStock = selectedProduct.stock + quantity;
    } else {
      newStock = quantity;
    }

    if (newStock < 0) {
      toast.error("Invalid Quantity", {
        description: "Stock cannot be negative.",
      });
      return;
    }

    updateProduct.mutate(
      {
        id: selectedProduct._id,
        data: { stock: newStock },
      },
      {
        onSuccess: () => {
          toast.success("Stock Updated!", {
            description: `Stock updated from ${selectedProduct.stock} to ${newStock} units.`,
          });
          setShowUpdateStockDialog(false);
          setSelectedProduct(null);
          setStockUpdate({ action: "add", quantity: "" });
        },
        onError: (error: any) => {
          toast.error("Failed to Update Stock", {
            description: error.message || "Please try again.",
          });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: "default" as const, className: "bg-success text-success-foreground", label: "In Stock" };
      case 'low_stock':
        return { variant: "secondary" as const, className: "bg-warning text-warning-foreground", label: "Low Stock" };
      case 'out_of_stock':
        return { variant: "destructive" as const, className: "", label: "Out of Stock" };
      case 'inactive':
        return { variant: "outline" as const, className: "", label: "Inactive" };
      default:
        return { variant: "default" as const, className: "", label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, suppliers, and purchase orders</p>
        </div>
        <Button 
          className="bg-gradient-success text-success-foreground"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Complete list of all products in stock</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products found</p>
            ) : (
              filteredProducts.map((product) => {
                const badge = getStatusBadge(product.status);
                return (
                  <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="w-10 h-10 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku} • {product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{product.stock} units</p>
                        <p className="text-sm text-muted-foreground">${product.price}</p>
                      </div>
                      <Badge variant={badge.variant} className={badge.className}>
                        {product.status === 'out_of_stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {badge.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenUpdateStock(product)}
                      >
                        Update Stock
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Create a new product in your inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={showUpdateStockDialog} onOpenChange={setShowUpdateStockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the stock level for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Stock:</span>
                <span className="text-lg font-bold">{selectedProduct?.stock} units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{selectedProduct?.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium">SKU:</span>
                <span className="text-sm text-muted-foreground">{selectedProduct?.sku}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <div className="flex gap-2">
                <Button
                  variant={stockUpdate.action === "add" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStockUpdate({ ...stockUpdate, action: "add" })}
                >
                  Add Stock
                </Button>
                <Button
                  variant={stockUpdate.action === "set" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStockUpdate({ ...stockUpdate, action: "set" })}
                >
                  Set Stock
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {stockUpdate.action === "add" 
                  ? "Add to current stock (e.g., received new shipment)" 
                  : "Set exact stock level (e.g., after physical count)"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {stockUpdate.action === "add" ? "Quantity to Add" : "New Stock Level"}
              </label>
              <input 
                type="number" 
                placeholder="0" 
                min="0"
                className="w-full p-2 border rounded-md"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
              />
            </div>

            {stockUpdate.quantity && selectedProduct && (
              <div className="p-4 bg-primary/10 rounded-md">
                <p className="text-sm font-medium">Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stockUpdate.action === "add" ? (
                    <>
                      Current: {selectedProduct.stock} units → 
                      New: {selectedProduct.stock + parseInt(stockUpdate.quantity || "0")} units
                      <span className="text-success ml-2">
                        (+{stockUpdate.quantity} units)
                      </span>
                    </>
                  ) : (
                    <>
                      Current: {selectedProduct.stock} units → 
                      New: {stockUpdate.quantity} units
                      <span className={parseInt(stockUpdate.quantity) > selectedProduct.stock ? "text-success ml-2" : "text-warning ml-2"}>
                        ({parseInt(stockUpdate.quantity) > selectedProduct.stock ? "+" : ""}
                        {parseInt(stockUpdate.quantity) - selectedProduct.stock} units)
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUpdateStockDialog(false)}
                disabled={updateProduct.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStock}
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}