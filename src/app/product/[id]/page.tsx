import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductClientPage, { ApiProduct } from "./ProductClientPage";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch products on the server side
  const products = await db.getProducts();
  
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  // Calculate related products on the server
  const relatedProducts = products.filter((p) => {
    if (p.id === product.id) return false;
    
    // Match by filters first
    const currentFilters = product.filterIds || [];
    if (currentFilters.length > 0 && p.filterIds && p.filterIds.length > 0) {
      return p.filterIds.some(fid => currentFilters.includes(fid));
    }
    
    return false;
  });

  return (
    <ProductClientPage 
      product={product as unknown as ApiProduct} 
      relatedProducts={relatedProducts as unknown as ApiProduct[]} 
    />
  );
}
