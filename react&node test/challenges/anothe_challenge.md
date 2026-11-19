
Part 1: The Live Coding / Automated Challenge


The Task: Paginated Product Catalog with Filter and Analytics Trace

You are required to build a product listing interface. The application must fetch data, handle loading states, search/filter items, handle cleanups efficiently, and minimize redundant re-renders.

import React, { useState, useEffect, useMemo, transition } from 'react';

// Mock API interface
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');      

  // 1. Fetching data with cleanup to prevent memory leaks / race conditions
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('https://example.com') // Simulated Endpoint
      .then((res) => {
        if (!res.ok) throw new Error('Network response failure.');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup function: Essential BairesDev evaluation criterion
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Performance Optimization: useMemo preserves reference unless dependencies change
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <div role="status">Loading catalog...</div>;
  if (error) return <div role="alert">Error: {error}</div>;

  return (
    <div className="catalog-container">
      <h2>Product Catalog</h2>
      
      {/* Controls */}
      <div className="filter-bar">                  
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>

      {/* Product List */}
      <ul className="product-list">
        {filteredProducts.map((product) => (
          <li key={product.id} className="product-item">
            <strong>{product.name}</strong> - ${product.price} ({product.category})
          </li>
        ))}
      </ul>
      
      {filteredProducts.length === 0 && <p>No products match your criteria.</p>}
    </div>
  );
}