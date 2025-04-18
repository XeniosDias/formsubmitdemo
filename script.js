document.addEventListener('DOMContentLoaded', function() {
    const cartItemCountHeader = document.getElementById('cart-item-count');
    const cartItemCountPageHeader = document.getElementById('cart-item-count-header');
    const buyButtons = document.querySelectorAll('.buy-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.querySelector('.checkout-button');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const shippingForm = document.getElementById('shipping-form');
    const paymentButtons = document.querySelectorAll('.payment-button');

    let cart = loadCart();
    updateCartDisplay();
    updateCheckoutDisplay();

    // Payment selection
    if (paymentButtons) {
        paymentButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove selected class from all buttons
                paymentButtons.forEach(btn => btn.classList.remove('selected'));
                // Add selected class to clicked button
                this.classList.add('selected');
            });
        });
    }

    function loadCart() {
        const cartData = localStorage.getItem('shoppingCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartItemCount();
    }

    function updateCartItemCount() {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountHeader) {
            cartItemCountHeader.textContent = itemCount;
        }
        if (cartItemCountPageHeader) {
            cartItemCountPageHeader.textContent = itemCount;
        }
    }

    function updateCartDisplay() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                if (checkoutButton) {
                    checkoutButton.disabled = true;
                }
            } else {
                emptyCartMessage.style.display = 'none';
                if (checkoutButton) {
                    checkoutButton.disabled = false;
                }
                let total = 0;
                cart.forEach(item => {
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    cartItemDiv.dataset.productId = item.id;

                    const img = document.createElement('img');
                    img.src = `pictures/placeholder-${item.id.split('-')[0]}.jpg`; 
                    img.alt = item.name;

                    const detailsDiv = document.createElement('div');
                    detailsDiv.classList.add('cart-item-details');
                    const title = document.createElement('h4');
                    title.textContent = item.name;
                    const price = document.createElement('span');
                    price.classList.add('cart-item-price');
                    price.textContent = `${parseFloat(item.price).toFixed(2)} €`;

                    const quantityDiv = document.createElement('div');
                    quantityDiv.classList.add('cart-item-quantity');
                    const quantityLabel = document.createElement('label');
                    quantityLabel.textContent = 'Menge:';
                    const quantityInput = document.createElement('input');
                    quantityInput.type = 'number';
                    quantityInput.value = item.quantity;
                    quantityInput.min = '1';
                    quantityInput.addEventListener('change', (event) => {
                        updateItemQuantity(item.id, parseInt(event.target.value));
                    });

                    const removeButton = document.createElement('button');
                    removeButton.classList.add('remove-item-button');
                    removeButton.innerHTML = '<i class="fas fa-trash-alt"></i> Entfernen';
                    removeButton.addEventListener('click', () => {
                        removeItemFromCart(item.id);
                    });

                    detailsDiv.appendChild(title);
                    detailsDiv.appendChild(price);
                    quantityDiv.appendChild(quantityLabel);
                    quantityDiv.appendChild(quantityInput);

                    cartItemDiv.appendChild(img);
                    cartItemDiv.appendChild(detailsDiv);
                    cartItemDiv.appendChild(quantityDiv);
                    cartItemDiv.appendChild(removeButton);

                    cartItemsContainer.appendChild(cartItemDiv);
                    total += item.price * item.quantity;
                });
                cartTotalElement.textContent = total.toFixed(2);
            }
        }
    }

    // Neue Funktion: Zeigt die Artikel im Checkout an
    function updateCheckoutDisplay() {
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '';
            let total = 0;
            
            cart.forEach(item => {
                const checkoutItemDiv = document.createElement('div');
                checkoutItemDiv.classList.add('checkout-item');
                
                const img = document.createElement('img');
                img.src = `pictures/placeholder-${item.id.split('-')[0]}.jpg`;
                img.alt = item.name;
                
                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('checkout-item-details');
                
                const name = document.createElement('p');
                name.innerHTML = `<strong>${item.name}</strong> (${item.quantity}x)`;
                
                const price = document.createElement('div');
                price.classList.add('checkout-item-price');
                const itemTotal = item.price * item.quantity;
                price.textContent = `${itemTotal.toFixed(2)} €`;
                
                detailsDiv.appendChild(name);
                checkoutItemDiv.appendChild(img);
                checkoutItemDiv.appendChild(detailsDiv);
                checkoutItemDiv.appendChild(price);
                
                checkoutItemsContainer.appendChild(checkoutItemDiv);
                total += itemTotal;
            });
            
            if (checkoutTotalElement) {
                checkoutTotalElement.textContent = total.toFixed(2);
            }
        }
    }

    function addItemToCart(productName, productPrice, productId) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                quantity: 1
            });
        }
        saveCart();
        updateCartDisplay();
        
        // Show added to cart animation
        const notification = document.createElement('div');
        notification.classList.add('cart-notification');
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${productName} wurde zum Warenkorb hinzugefügt`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    function removeItemFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
    }

    function updateItemQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity); // Mindestmenge ist 1
            saveCart();
            updateCartDisplay();
        }
    }

    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const price = this.dataset.price;
            const productId = this.closest('.product-card').dataset.productId;
            addItemToCart(product, price, productId);
        });
    });

    // Checkout-Button-Funktionalität
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            window.location.href = 'checkout.html';
        });
    }

    // Checkout-Formular Verarbeitung
    if (shippingForm) {
        shippingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const orderMessage = document.getElementById('order-message');
            
            // Prüfen, ob eine Zahlungsmethode ausgewählt wurde
            const paymentSelected = document.querySelector('.payment-button.selected');
            
            if (!paymentSelected) {
                orderMessage.textContent = 'Bitte wählen Sie eine Zahlungsmethode aus.';
                orderMessage.className = 'order-message error';
                return;
            }
            
            // Bestellung verarbeiten
            if (cart.length > 0) {
                // Erfolgreiche Bestellung anzeigen
                orderMessage.innerHTML = '<i class="fas fa-check-circle"></i> Ihre Bestellung wurde erfolgreich aufgegeben!';
                orderMessage.className = 'order-message success';
                
                // Warenkorb leeren
                cart = [];
                saveCart();
                
                // Formular zurücksetzen
                shippingForm.reset();
                
                // Nach 3 Sekunden zur Startseite weiterleiten
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                // Fehlermeldung, wenn der Warenkorb leer ist
                orderMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ihr Warenkorb ist leer. Bitte fügen Sie Produkte hinzu.';
                orderMessage.className = 'order-message error';
            }
        });
    }

    // Kontaktformular-Funktionalität
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formMessage = document.getElementById('formMessage');
            formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Nachricht erfolgreich gesendet! (Funktionalität nicht implementiert)';
            formMessage.className = 'form-message success';
            contactForm.reset();
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 3000);
        });
    }

    // Add CSS for cart notification
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .cart-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .cart-notification i {
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);

    // Initialisierung der Warenkorb-Anzeige beim Laden der Seite
    updateCartItemCount();
});