import { getParam } from './utils.mjs';
import { loadHeaderFooter, getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";
import ExternalServices from './ExternalServices.mjs';
import { updateCartCount } from "./utils.mjs";  


const dataSource = new ExternalServices('tents');
const productId = getParam('product');


console.log('Loaded product ID from URL:', productId);

// Optional: test findProductById
dataSource.findProductById(productId).then(product => {
  console.log('Product data:', product);
});

export default class ProductDetails {

  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // use the datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productId);
    // the product details are needed before rendering the HTML
    this.renderProductDetails();
    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). This callback will not work if the bind(this) is missing. Review the readings from this week on 'this' to understand why.
    document
      .getElementById('addToCart')
      .addEventListener('click', this.addProductToCart.bind(this));
  }

  // addProductToCart() {
  //   const cartItems = getLocalStorage("so-cart") || []; // get cart array of items from local storage if null set to empty array
  //   /* eslint-disable no-console */
  //   // for debugging purposes
  //   console.log("Before:", cartItems);
  //   cartItems.push(this.product);
  //   console.log("After:", cartItems);
  //   /* eslint-enable no-console */
  //   setLocalStorage("so-cart", cartItems);
  //   updateCartCount();
  // }

  addProductToCart() {
    let cartItems = getLocalStorage("so-cart") || [];
    const existingItemIndex = cartItems.findIndex(item => item.Id === this.product.Id);

    if (existingItemIndex !== -1) {
      // Increase quantity if already exists
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // First time adding this item
      const itemWithQty = { ...this.product, quantity: 1 };
      cartItems.push(itemWithQty);
    }

    setLocalStorage("so-cart", cartItems);
    updateCartCount();
    alertMessage(`${this.product.NameWithoutBrand} added to cart!`);

  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

// function productDetailsTemplate(product) {
//     document.querySelector(".product-detail h2").textContent = product.Brand.Name;
//     document.querySelector(".product-detail h2").textContent = product.NameWithoutBrand;
  
//     const productImage = document.querySelector(".product-detail img");
//     productImage.src = product.Images.PrimaryLarge;
//     productImage.alt = product.NameWithoutBrand;
  
//     document.querySelector(".product-card__price").textContent = `$${product.FinalPrice}`;
//     document.querySelector(".product__color").textContent = product.Colors[0].ColorName;
//     document.querySelector(".product__description").innerHTML = product.DescriptionHtmlSimple;
  
//     document.getElementById("addToCart").dataset.id = product.Id;
//   }

function productDetailsTemplate(product) {
  // Product title
  document.querySelector(".product-detail h2").textContent = product.NameWithoutBrand;

  // Product image
  const productImage = document.querySelector(".product-detail img");
  productImage.src = product.Images.PrimaryLarge;
  productImage.alt = product.NameWithoutBrand;

  // Pricing logic
  const priceContainer = document.querySelector(".product-card__price");
  const originalPrice = product.SuggestedRetailPrice || product.ListPrice || product.FinalPrice;

  priceContainer.innerHTML = ""; // clear old content

  if (originalPrice > product.FinalPrice) {
    const discountAmount = originalPrice - product.FinalPrice;
    const discountPercent = Math.round((discountAmount / originalPrice) * 100);

    priceContainer.innerHTML = `
      <span class="original-price">$${originalPrice.toFixed(2)}</span>
      <span class="final-price">$${product.FinalPrice.toFixed(2)}</span>
      <span class="discount-badge">Save ${discountPercent}% ($${discountAmount.toFixed(2)})</span>
    `;
  } else {
    priceContainer.innerHTML = `<span class="final-price">$${product.FinalPrice.toFixed(2)}</span>`;
  }

  // Other product info
  document.querySelector(".product__color").textContent = product.Colors[0].ColorName;
  document.querySelector(".product__description").innerHTML = product.DescriptionHtmlSimple;

  // Attach product ID to the add-to-cart button
  document.getElementById("addToCart").dataset.id = product.Id;
}


loadHeaderFooter();