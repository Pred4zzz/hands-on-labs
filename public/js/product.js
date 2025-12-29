fetch("/api/products", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    const products = data.payload || data;
    const container = document.getElementById("products");

    products.forEach(p => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.title}</h5>
            <p class="card-text">${p.description || ""}</p>
            <p class="fw-bold mt-auto">$${p.price}</p>
            <button class="btn btn-primary w-100" onclick="addToCart('${p._id}')">
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  });

function addToCart(productId) {
  fetch("/api/users/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, quantity: 1 })
  })
    .then(() => alert("Producto agregado al carrito"));
}
