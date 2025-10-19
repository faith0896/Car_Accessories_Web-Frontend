export default function ProductCard({ product }) {
  const resolveImage = (p) => {
    const BASE = 'http://localhost:8080/CarAccessories/uploads/images/';
    const raw = p?.imageURL || p?.imageUrl || p?.image || '';
    if (!raw) return '/placeholder.png';
    return raw.startsWith('http') ? raw : `${BASE}${raw}`;
  };

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg">
      <img src={resolveImage(product)} alt={product.name} className="w-full h-40 object-cover" />
      <h3 className="mt-2 font-bold">{product.name}</h3>
      <p>{product.brand}</p>
      <p className="text-green-600 font-bold">R{product.price}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Add to Cart</button>
    </div>
  );
}
