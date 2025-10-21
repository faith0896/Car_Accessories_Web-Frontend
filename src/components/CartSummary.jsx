export default function CartSummary({ total }) {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold">Cart Summary</h2>
      <p>Total: R{total}</p>
      <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">Checkout</button>
    </div>
  );
}
/// To show the cart summary with total(all items in the cart) and a checkout button for the user.

//How does it connect to the secure ?
/// When the button is clicked ,it calls a secure route handled in cartPage "handleCheckout()"
///When the user clicks Checkout, the system verifies if they are logged in and not an admin before continuing.
///The backend in Java validates the JWT token and ensures only authorized users can make purchases. 
///This prevents unauthorized or admin accounts from performing checkout operations.”