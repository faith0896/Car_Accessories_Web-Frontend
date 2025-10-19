import ReviewList from "../components/ReviewList.jsx";

export default function ProductDetail() {
    const product = { name: "Racing Seat Cover", price: 1200, imageURL: "", description: "High-quality leather seat cover." };

    const reviews = [{ rating: 5, comment: "Amazing quality!" }];
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p>R{product.price}</p>
            <p>{product.description}</p>
            <ReviewList reviews={reviews} />
        </div>
    );
}