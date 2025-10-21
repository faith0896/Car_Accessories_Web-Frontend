export default class Cart {
  constructor(cartId, dateCreated, buyer, cartItems = []) {
    this.cartId = cartId;              // Long
    this.dateCreated = dateCreated;    // LocalDate
    this.buyer = buyer;                // Buyer object
    this.cartItems = cartItems;        // List<CartItem>
  }
}
//