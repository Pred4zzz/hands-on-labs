fetch("/api/users/cart", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    const cart = document.getElementById("cart");
    const products = data.payload.products;

    products.forEach(p => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between";

      li.innerHTML = `
        <span>${p.product.title}</span>
        <span class="fw-bold">x${p.quantity}</span>
      `;
      cart.appendChild(li);
    });
  });

function purchase() {
  fetch("/api/users/purchase", {
    method: "POST",
    credentials: "include"
  })
    .then(res => res.json())
    .then(() => alert("Compra realizada correctamente"));
}
