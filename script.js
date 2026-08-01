document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".all-options");
    const searchInput = document.querySelector("#srch-ar");
    const searchButton = document.querySelector("#srch-bt");
    const cartItems = document.querySelector("#cart-items");
    const cartTotal = document.querySelector("#cart-total");
    const cartCount = document.querySelector("#cart-count");
    const productCards = Array.from(document.querySelectorAll(".fashion-item, .single-item, .triple-item, .slider img"));

    const STORAGE_KEY = "amazon-clone-cart";
    let cart = loadCart();

    function loadCart() {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function adjustSelectWidth() {
        if (!select) {
            return;
        }

        if (window.innerWidth <= 600) {
            select.style.width = "40px";
            return;
        }

        const temp = document.createElement("span");
        temp.style.visibility = "hidden";
        temp.style.position = "absolute";
        temp.style.fontSize = window.getComputedStyle(select).fontSize;
        temp.style.fontFamily = window.getComputedStyle(select).fontFamily;
        temp.innerText = select.options[select.selectedIndex].text;

        document.body.appendChild(temp);
        select.style.width = `${temp.offsetWidth + 40}px`;
        document.body.removeChild(temp);
    }

    function getItemName(item) {
        return item.querySelector("p")?.textContent?.trim() || item.querySelector("img")?.alt || "Product";
    }

    function getFallbackPrice(index) {
        const fallbackPrices = [50, 25, 30, 45, 55, 35, 40, 60, 20, 18, 22, 28, 32, 48, 42];
        return fallbackPrices[index % fallbackPrices.length] || 29.99;
    }

    function decorateProductCards() {
        productCards.forEach((item, index) => {
            let itemNode = item;

            if (itemNode.matches(".slider img")) {
                const wrapper = document.createElement("div");
                wrapper.className = "slider-item";
                itemNode.parentNode.insertBefore(wrapper, itemNode);
                wrapper.appendChild(itemNode);
                itemNode = wrapper;
                productCards[index] = itemNode;
            }

            const name = getItemName(itemNode);
            const price = getFallbackPrice(index);

            itemNode.dataset.id = String(index + 1);
            itemNode.dataset.name = name;
            itemNode.dataset.price = String(price);

            if (!itemNode.querySelector(".price-tag")) {
                const priceTag = document.createElement("div");
                priceTag.className = "price-tag";
                priceTag.textContent = `$${price.toFixed(2)}`;
                itemNode.appendChild(priceTag);
            }

            if (!itemNode.querySelector(".add-cart-btn")) {
                const addButton = document.createElement("button");
                addButton.className = "add-cart-btn";
                addButton.textContent = "Add to Cart";
                addButton.dataset.id = String(index + 1);
                itemNode.appendChild(addButton);
            }

            if (!itemNode.querySelector(".remove-cart-btn")) {
                const removeButton = document.createElement("button");
                removeButton.className = "remove-cart-btn";
                removeButton.textContent = "Remove";
                removeButton.dataset.id = String(index + 1);
                itemNode.appendChild(removeButton);
            }
        });
    }

    function updateCartBadge() {
        if (cartCount) {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalQuantity;
        }
    }

    function renderCart() {
        if (!cartItems) {
            return;
        }

        if (cart.length === 0) {
            cartItems.innerHTML = "Your cart is empty.";
            if (cartTotal) {
                cartTotal.textContent = "Total: $0.00";
            }
            updateCartBadge();
            return;
        }

        cartItems.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <span>${item.name} x ${item.quantity}</span>
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                <button class="remove-item-btn" data-id="${item.id}">Remove</button>
            </div>
        `).join("");

        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (cartTotal) {
            cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
        }

        updateCartBadge();
    }

    function addToCart(productId) {
        const item = productCards.find((card) => card.dataset.id === String(productId));

        if (!item) {
            return;
        }

        const existingCartItem = cart.find((entry) => entry.id === Number(productId));
        const price = Number(item.dataset.price || 29.99);
        const name = item.dataset.name || "Product";

        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            cart.push({
                id: Number(productId),
                name,
                price,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter((item) => item.id !== Number(productId));
        saveCart();
        renderCart();
    }

    function filterProducts() {
        if (!searchInput) {
            return;
        }

        const query = searchInput.value.trim().toLowerCase();

        productCards.forEach((item) => {
            const text = (item.dataset.name || item.textContent).toLowerCase();
            item.style.display = query && !text.includes(query) ? "none" : "";
        });
    }

    if (select) {
        adjustSelectWidth();
        select.addEventListener("change", adjustSelectWidth);
        window.addEventListener("resize", adjustSelectWidth);
    }

    decorateProductCards();
    renderCart();

    if (searchInput && searchButton) {
        searchButton.addEventListener("click", filterProducts);
        searchInput.addEventListener("input", filterProducts);
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                filterProducts();
            }
        });
    }

    document.addEventListener("click", (event) => {
        const addButton = event.target.closest(".add-cart-btn");
        const removeButton = event.target.closest(".remove-item-btn");
        const cardRemoveButton = event.target.closest(".remove-cart-btn");

        if (addButton) {
            addToCart(addButton.dataset.id);
        }

        if (removeButton) {
            removeFromCart(removeButton.dataset.id);
        }

        if (cardRemoveButton) {
            removeFromCart(cardRemoveButton.dataset.id);
        }
    });
});
