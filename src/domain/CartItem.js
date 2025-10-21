export default class CartItem {
  constructor(cartItemId, quantity, subtotal, cart, product) {
    this.cartItemId = cartItemId;  // Long
    this.quantity = quantity;      // int
    this.subtotal = subtotal;      // double
    this.cart = cart;              // Cart object
    this.product = product;        // Product object
  }
}
//