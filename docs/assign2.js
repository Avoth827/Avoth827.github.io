const shoppingCartKey = "cartDataAssignment2Ashton"
const dataKey = "dataKeyAssignment2Ashton"




const dataURL = 'https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json'

/**
 * Main function - runs when DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {



    getData();


    /**
     * gets data from localStorage or url and then runs the main program
     */
    function getData() {
        let content = localStorage.getItem(dataKey);
        if (content) {
            main(JSON.parse(content));
        }
        else {

            console.log("fetching")
            fetch(dataURL).then(response => response.json())
                .then(data => {
                    localStorage.setItem(dataKey, JSON.stringify(data));
                    main(data);
                }).catch(error => {
                    console.error('Fetch error: ' + error);
                });


        }

    }

    function main(data) {
        //stores an array of item ID-quantity pairs 
        const shoppingCartArray = getShoppingCart();    //initializes to stored array or [] if no stored array found.

        //simple navigation events assigned here
        const dialogWindow = document.querySelector("dialog");
        for (let closeButton of dialogWindow.querySelectorAll("button.close")) {
            closeButton.addEventListener("click", closeAbout);
        }

        document.querySelector("nav #aboutLink").addEventListener("click", openAbout);
        document.querySelector("footer #aboutLink").addEventListener("click", openAbout);

        document.querySelector("header #logo").addEventListener("click", (e) => {
            switchPage(document.querySelector(`main #${e.currentTarget.dataset.id}`));
        });

        for (let link of document.querySelectorAll("header nav .headerLink")) {
            link.addEventListener("click", () => {
                switchPage(document.querySelector(`main #${link.dataset.id}`));
            });
        }
        document.querySelector("header #headerCart").addEventListener("click", () => {
            switchPage(document.querySelector(`main #cart`));
        });

        let currentPage = "home"; //initialized to home

        buildBrowse(data);
        updateCartPage();
        addEvents();
        addHomeFeatured(data);
        updateCartCounter();



        /**
         * Adds 4 random products to the home page featured tab
         * @param products array of products fetched from url
         */
        function addHomeFeatured(products) {
            const featured = document.querySelector("#home #featuredItems");
            let max = products.length;

            for (let i = 0; i < 4; i++) {
                let randOffset = Math.floor(Math.random() * (max - 0) + 0);
                const product = products[i + randOffset];
                if (product)
                    featured.appendChild(makeProductCard(product));
                else
                    i -= 1;
            }
        }

        /**
         * Builds the browse window for initial load and adds it's events
         * @param products array of products fetched from url 
         */
        function buildBrowse(products) {
            const browse = document.querySelector("main #browse")
            buildFilters(products);
            populateBrowse(products, "name");
            resetBrowseForms();


            document.querySelector("#browse #filters").addEventListener("change", () => {
                const filter = getFilter();
                refreshBrowse();
                updateFilters(filter);

            });

            document.querySelector("#browseView #clearFilters").addEventListener("click", (e) => {
                const filters = document.querySelectorAll("#browseView #activeFilters .activeFilter");
                for (let filt of filters) {
                    filt.click();
                }
            });

            document.querySelector("#browseView #sort").addEventListener("change", () => {
                const filter = getFilter();
                refreshBrowse();
                updateFilters(filter);
            });




            /** 
             * Filters the array of products by a filter object. 
             * @param {Filter} filter filter parameters
             * @returns {Array} new array created from data and filter
             * */
            function filterItems(filter) {
                const items = []
                for (let item of products) {
                    if (filter.isGenderIncluded(item.gender) && filter.isCategoryIncluded(item.category)
                        && (item.sizes.some(size => filter.isSizeIncluded(size)))
                        && (item.color.some(color => filter.isColorIncluded(color.hex)))) {
                        items.push(item);
                    }
                }
                return items;
            }

            /**
             * Resets the browse selections
             */
            function resetBrowseForms() {
                const forms = document.querySelectorAll("#browse form");
                for (let form of forms) {
                    form.reset();
                }
            }

            /**
             * Builds browse filters from the list of products based on their categories
             * @param data array of products 
             */
            function buildFilters(data) {
                const categories = []
                for (let product of data) {
                    if (!categories.includes(product.category)) {
                        categories.push(product.category);
                    }
                }
                let categoryFilters = browse.querySelector("#filters #categories")
                for (let category of categories) {
                    const label = document.createElement("label");
                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.name = "category";
                    input.value = category;
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(category));
                    categoryFilters.appendChild(label);
                }
            }

            /**
             * updates a list of active filters at the top of the browse window
             * @param {Filter} filter The current filter
             */
            function updateFilters(filter) {
                const filterDisplay = document.querySelector("#browseView #activeFilters");
                filterDisplay.innerHTML = "";
                for (const array of Object.values(filter)) {
                    if (typeof array != "function") {   //Don't itterate through the method, only the arrays

                        for (let option of array) {
                            const span = document.createElement("span");
                            span.classList.add("activeFilter");
                            span.textContent = option;
                            span.id = option;
                            span.addEventListener("click", (e) => {
                                e.stopPropagation();
                                const select = document.querySelector(`#browse #filters [value=${e.target.getAttribute("id")}]`);
                                if (select) {
                                    select.checked = false;
                                }
                                refreshBrowse();
                                e.currentTarget.remove();
                            });
                            filterDisplay.appendChild(span);
                        }
                    }
                }

            }

            /**
             * Refreshes the browse window with products based on filter
             */
            function refreshBrowse() {
                const sorting = document.querySelector("#browseView #sort");
                const filter = getFilter();
                const filteredItems = filterItems(filter);
                if (sorting)
                    populateBrowse(filteredItems, sorting.value);
                else
                    populateBrowse(filterItems(getFilter()), "name");
            }

        }






        /**
         * Creates a new filter from selected browse options
         * @returns {Filter} a new filter object
         */
        function getFilter() {
            const filter = new Filter()
            for (let gender of document.querySelectorAll("#browseContainer #filters #genders input")) {
                if (gender.checked) {
                    filter.genders.push(gender.value);
                }
            }
            for (let category of document.querySelectorAll("#browseContainer #filters #categories input")) {
                if (category.checked) {
                    filter.categories.push(category.value);
                }
            }
            for (let size of document.querySelectorAll("#browseContainer #filters #sizes input")) {
                if (size.checked) {
                    filter.sizes.push(size.value);
                }
            }
            for (let colour of document.querySelectorAll("#browseContainer #filters #colours input")) {
                if (colour.checked) {
                    filter.colors.push(colour.value);
                }
            }
            return filter;

        }

        /**
         * Makes a product card from a given product.
         * @param product Item from the list of products 
         * @returns a card element (div) or null
         */
        function makeProductCard(product) {

            const template = document.querySelector("#browseProductCard");
            if (template) {
                const card = template.content.cloneNode(true).querySelector(".card");
                card.querySelector("img").src = `https://placehold.co/128x128/555555/${product.color[0].hex.substring(1)}`;
                card.querySelector("#productTitle").textContent = product.name;
                card.querySelector("#productPrice").textContent = "$" + (product.price).toFixed(2);
                card.querySelector("button").dataset.id = product.id;
                card.id = product.id;
                card.querySelector("button.addToCart").addEventListener("click", (e) => {
                    e.stopPropagation();
                    addToCart(e.currentTarget.dataset.id);
                });
                card.addEventListener("click", (e) => {

                    goToProduct(data.find((product) => product.id == e.currentTarget.id));
                });
                return card;
            }
            else {
                return null;
            }

        }


        /**
         * 
         * @param {*} items 
         * @param {String} sorting 
         */
        function populateBrowse(items, sortingMethod) {
            const productDisplay = document.querySelector("#browseView #productDisplay");
            productDisplay.innerHTML = "";
            if (items.length == 0) {
                const p = document.createElement("p");
                p.textContent = "No items found for the selected filters.";
                p.style = "color: var(--darkBlue); grid-column: span 4;"
                productDisplay.appendChild(p);
            }
            else {

                newItems = sortList(items, sortingMethod);

                for (let item of newItems) {
                    const card = makeProductCard(item);
                    if (card)
                        productDisplay.appendChild(card);
                    else
                        console.log("Failed to make card for " + item.name);
                }
            }



            /**
             * Sorts an array of products by the given method. The array is sorted in place. Does not create a new array.
             * @param {Array} itemArray - array of products
             * @param {String} method - either "name", "category", or "price".
             * @returns a reference to same array after being sorted. 
             */
            function sortList(itemArray, method = "name") {
                switch (method) {
                    case "price":
                        return itemArray.sort((item1, item2) => item1.price - item2.price);
                    case "category":
                        //sort by category
                        return itemArray.sort((item1, item2) => item1.category.toLowerCase().localeCompare(item2.category.toLowerCase()));
                    default:
                        //sort by name
                        return itemArray.sort((item1, item2) => item1.name.toLowerCase().localeCompare(item2.name.toLowerCase()));

                }

            }
        }

        /**
         * Adds a variety of events to elements in the page.
         */
        function addEvents() {

            /**
             * add items to cart from product page
             */
            const addToCartButton = document.querySelector("#product button#addProductToCart");
            addToCartButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productPage = document.querySelector("main #product");
                let quantity = productPage.querySelector("input#quantity").value;
                let size = productPage.querySelector('.size-selector input:checked');
                if (size)
                    size = size.value;
                else
                    size = "M";
                let color = productPage.querySelector('.color-selector input:checked');
                if (color)
                    color = color.value;
                else
                    color = "#000000";

                addToCart(e.currentTarget.dataset.id, size, color, Number(quantity));
            });

            /**
             * clears cart and returns to home
             */
            const checkoutButton = document.querySelector("#cart button#checkout");
            checkoutButton.addEventListener("click", () => {
                clearCart();
                switchPage(document.querySelector("main #home"));
            });

            /**
             * updates the cart when quantity is altered on cart page
             */
            document.querySelector("main #cart").addEventListener('input', (e) => {
                if (e.target.matches("#quantity")) {
                    e.stopPropagation();
                    setCartQuantity(e.target.dataset.id, e.target.value);
                    updateCartItemsSubtotals();
                    updateCartSummary();
                    updateCartCounter();
                }
                else if (e.target.matches("#shippingOptions select")) {
                    updateCartSummary();
                }
            });

            /**
             * Go to category from category card on mens/womens page
             */
            document.querySelector("#men #menCategories").addEventListener("click", (e) => {
                const card = e.target.closest(".card");
                if (card) {
                    e.stopPropagation();
                    goToCategory(card.id, "male");
                }
            });

            document.querySelector("#women #womenCategories").addEventListener("click", (e) => {
                const card = e.target.closest(".card");
                if (card) {
                    e.stopPropagation();
                    goToCategory(card.id, "female");
                }
            });

            /**
             * switch the image in the product page to the thumb image when clicked
             */
            document.querySelector("#productImages").addEventListener("click", (e) => {
                const smallImg = e.target.closest("img");
                if (smallImg && smallImg.classList.contains("small")) {
                    document.querySelector("#productImages .large").src = smallImg.src;
                }
            });


        }

        /**
         * switches the page to browse and activates category and gender filters
         * @param {*} category The category to switch to
         * @param {*} gender The gender to switch to
         */
        function goToCategory(category, gender) {
            const page = document.querySelector(`main #browse.page`);
            if (page) {
                const inputs = page.querySelectorAll("#filters input");
                const clearAll = page.querySelector("#clearFilters");
                if (clearAll)
                    clearAll.click();
                for (let input of inputs) {
                    if (input.value.toLowerCase() == category || input.value.toLowerCase() == gender) {
                        input.click();
                    }
                }
                switchPage(page);
            }


        }


        /**
         * Updates a cart item's quantity value.
         * @param {String} productID 
         * @param {Number} quantity 
         */
        function setCartQuantity(productID, quantity) {
            let index = shoppingCartArray.findIndex(cartItem => cartItem.id == productID);

            if (index != -1) {
                shoppingCartArray[index].quantity = Number(quantity);

                localStorage.setItem(shoppingCartKey, JSON.stringify(shoppingCartArray));
            }

        }

        /**
         * Updates the subtotals of cart items on the cart page
         */
        function updateCartItemsSubtotals() {
            const cartItems = document.querySelectorAll("#cart #cartItems #itemTable .cartItem");
            for (let item of cartItems) {
                item.querySelector("p.subtotal").textContent = "$" +
                    (Number(item.querySelector("input#quantity").value) * Number((item.querySelector("p.price").textContent).slice(1))).toFixed(2);
            }
        }

        /**
         * Updates the cart page with the items in the shoppingCartArray
         */
        function updateCartPage() {
            const cartPage = document.querySelector("main #cart.page");
            const itemsContainer = cartPage.querySelector("#cartItems #itemTable");
            itemsContainer.innerHTML = "";
            for (let cartItem of shoppingCartArray) {
                const product = data.find((item) => item.id == cartItem.id);
                const itemDiv = cartPage.querySelector("template").content.cloneNode(true).querySelector(".cartItem");
                itemDiv.querySelector("img").src = `https://placehold.co/128x128/555555/${product.color[0].hex.substring(1)}`;
                itemDiv.querySelector("#title").textContent = product.name;
                itemDiv.querySelector(".swatch").style = `background: ${product.color[0].hex}`;
                itemDiv.querySelector("input#quantity").value = (Number(cartItem.quantity)).toFixed(0);
                itemDiv.querySelector("input#quantity").dataset.id = product.id;
                itemDiv.querySelector("p.price").textContent = "$" + (product.price).toFixed(2);
                itemDiv.querySelector("p.subtotal").dataset.id = toString(product.price);
                itemDiv.querySelector("p.subtotal").textContent = `$` + (product.price * Number(cartItem.quantity)).toFixed(2);
                for (let size of product.sizes) {
                    const option = document.createElement("option");
                    option.value = size;
                    option.textContent = size;
                    itemDiv.querySelector(".itemSize").appendChild(option);
                    if (size == cartItem.size)
                        itemDiv.querySelector(".itemSize").value = size;
                }
                const button = itemDiv.querySelector("button#remove");
                button.dataset.id = cartItem.id;
                button.addEventListener("click", (e) => {
                    removeFromCart(e.currentTarget.dataset.id);
                });

                itemsContainer.appendChild(itemDiv);
            }
            updateCartSummary();
        }

        /**
         * Updates the cart summary window with information from the cart and shipping options
         */
        function updateCartSummary() {
            const cartItems = document.querySelectorAll("#cart #itemTable .cartItem");
            let subtotal = 0;
            for (let item of cartItems) {
                let price = Number(item.querySelector(".price").textContent.slice(1));
                let quantity = Number(item.querySelector("input#quantity").value);
                subtotal += price * quantity;
            }
            let shipping = 0;
            let tax = 0;
            if (subtotal < 500) {
                const region = document.querySelector("main #cart #checkoutInfo #region").value;
                const priority = document.querySelector("main #cart #checkoutInfo #shippingType").value

                switch (region) {
                    case "CA":
                        tax = 0.05;
                        switch (priority) {
                            case "express":
                                shipping = 25;
                                break;
                            case "priority":
                                shipping = 35;
                                break;
                            default:    //standard
                                shipping = 10;
                        }
                        break;
                    case "USA":
                        switch (priority) {
                            case "express":
                                shipping = 25;
                                break;
                            case "priority":
                                shipping = 50;
                                break;
                            default:    //standard
                                shipping = 15;
                        }
                        break;
                    default:    //INT
                        switch (priority) {
                            case "express":
                                shipping = 30;
                                break;
                            case "priority":
                                shipping = 50;
                                break;
                            default:    //standard
                                shipping = 20;
                        }
                }
            }
            else if (document.querySelector("main #cart #checkoutInfo #region").value == "CA") {
                tax = 0.05;
            }

            tax = subtotal * tax;

            const summary = document.querySelector("main #cart #summary");
            summary.querySelector("#subtotalSummary .price").textContent = "$" + subtotal.toFixed(2);
            summary.querySelector("#shippingSummary .price").textContent = "$" + shipping.toFixed(2);
            summary.querySelector("#taxSummary .price").textContent = "$" + tax.toFixed(2);
            summary.querySelector("#totalSummary .price").textContent = "$" + (subtotal + shipping + tax).toFixed(2);

        }

        /**
         * Removes an item from cart and updates the page accordingly
         * @param {*} productID Id of the product to remove
         */
        function removeFromCart(productID) {
            let index = shoppingCartArray.findIndex(cartItem => cartItem.id == productID);
            if (index != -1) {
                shoppingCartArray.splice(index, 1);
                localStorage.setItem(shoppingCartKey, JSON.stringify(shoppingCartArray));
                showToast("Item removed from cart");
                updateCartPage();
                updateCartCounter();
            }

        }

        /**
         * Clears the cart and notifies the user with a toast
         */
        function clearCart() {
            shoppingCartArray.splice(0, shoppingCartArray.length);
            localStorage.setItem(shoppingCartKey, JSON.stringify(shoppingCartArray));
            updateCartCounter();
            updateCartPage();
            showToast("Cart cleared");
        }

        /**
         * Adds an item to the shoppingCartArray and updates the page accordingly
         * @param {String} productID The id of the product added
         * @param {String} addedSize The size of the product added
         * @param {String} colour The colour of the product added
         * @param {Number} addedQuantity The amount of the product to add
         */
        function addToCart(productID, addedSize = "M", colour = "#000000", addedQuantity = 1) {
            let index = shoppingCartArray.findIndex(cartItem => (cartItem.id == productID && cartItem.size == addedSize));

            if (index == -1) {
                shoppingCartArray.push({ quantity: addedQuantity, id: productID, size: addedSize, color: colour });
            }
            else {
                shoppingCartArray[index].quantity += addedQuantity;

            }
            localStorage.setItem(shoppingCartKey, JSON.stringify(shoppingCartArray));
            updateCartCounter();
            updateCartPage();
            showToast("Item added to cart");
        }




        /**
         * Creates a product page based on product information
         * @param product a product from the products array from URL 
         */
        function buildProductPage(product) {
            const productPage = document.querySelector("main #product");
            productPage.querySelector("#productBreadcrumb").textContent = product.name;
            productPage.querySelector("#categoryBreadcrumb").textContent = product.category;
            productPage.querySelector("#genderBreadcrumb").textContent = product.gender;
            productPage.querySelector("#productImages img.large").src = "https://placehold.co/512x512/cccccc/ad991a";
            productPage.querySelector("#productImages img#img1.small").src = "https://placehold.co/512x512/cccccc/ad991a";
            productPage.querySelector("#productImages img#img2.small").src = "https://placehold.co/512x512/cccccc/1aad3c";
            productPage.querySelector("#productImages img#img3.small").src = "https://placehold.co/512x512/cccccc/1a59ad";
            productPage.querySelector("#productImages img#img4.small").src = "https://placehold.co/512x512/cccccc/c12238";
            const details = productPage.querySelector("#productDetails");
            details.querySelector(".title").textContent = product.name;
            details.querySelector(".price").textContent = "$" + product.price.toFixed(2);
            details.querySelector("p.description").textContent = product.description;
            details.querySelector("#material").textContent = product.material;
            details.querySelector("#quantity").value = 1;
            details.querySelector(".size-selector").innerHTML = "";
            for (let size of product.sizes) {
                const label = document.createElement("label");
                label.classList.add("size-option");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = "size";
                input.value = size;
                const span = document.createElement("span");
                span.textContent = size;
                label.appendChild(span);
                label.appendChild(input);
                details.querySelector(".size-selector").appendChild(label);
            }

            details.querySelector(".color-selector").innerHTML = "";
            for (let colour of product.color) {
                const label = document.createElement("label");
                label.classList.add("color-option");
                label.style = `background: ${colour.hex}`;
                const input = document.createElement("input");
                input.type = "radio";
                input.name = "color";
                input.value = colour.name;
                label.appendChild(input);

                details.querySelector(".color-selector").appendChild(label);
            }

            details.querySelector("#addProductToCart").dataset.id = product.id;

            addRelatedProducts(product, data);
        }

        /**
         * Adds similar products to a given product's page.
         * @param product the main product on display
         * @param productArray the array of all products
         */
        function addRelatedProducts(product, productArray) {
            relatedGrid = document.querySelector("#product #related .grid");
            relatedGrid.innerHTML = "";
            let max = productArray.length;
            let retries = 0;
            for (let i = 0; i < 4; i++) {
                const randOffset = Math.floor(Math.random() * (max - 0) + 0);
                const item = productArray[(i + randOffset)];
                if (item && item.gender == product.gender) {
                    const card = makeProductCard(item);
                    if (card)
                        relatedGrid.appendChild(card);
                }
                else {
                    i--;
                    retries += 1;
                    if (retries >= 20) {
                        return; //cancel if too many tries to find related.
                    }
                }

            }

        }

        /**
         * switches to the product page and modifies it to match the given product
         * @param product a product from the array of products
         */
        function goToProduct(product) {

            buildProductPage(product);
            document.querySelector("main #product").classList.remove("hidden");
            if (currentPage != "product") { //incase going from product to different product
                document.querySelector(`main #${currentPage}`).classList.add("hidden");
                currentPage = "product";
            }
        }







        /**
         * Updates the cart item indicator in the header
         */
        function updateCartCounter() {
            let total = 0;
            for (let product of shoppingCartArray) {
                total += Number(product.quantity);
            }
            document.querySelector("header #headerCart .circleNumber").textContent = total.toFixed(0);
        }

        /**
         * switches from one page to another
         * @param pageElement the html elemenent of the page to switch to
         */
        function switchPage(pageElement) {
            if (pageElement && currentPage != pageElement.id) {
                pageElement.classList.remove("hidden");
                document.querySelector(`main #${currentPage}`).classList.add("hidden");

                currentPage = pageElement.id;


            }
        }

        /**
         * opens the about window
         */
        function openAbout() {
            const dialog = document.querySelector("dialog");
            dialog.showModal();
            document.querySelector("#about").classList.remove("hidden");
        }
        /**
         * Closes the about window
         */
        function closeAbout() {
            const dialog = document.querySelector("dialog");
            dialog.close();
            document.querySelector("#about").classList.add("hidden");
        }

        /**
         * Gets the shopping cart array from local storage. If none exist, it return an empty array.
         * @returns {Array} an array of shopping cart items e.g. [{id, size, colour, quantity},...]
         */
        function getShoppingCart() {
            let contents = localStorage.getItem(shoppingCartKey);
            if (contents) {
                return JSON.parse(contents)
            }
            else {
                return [];
            }
        }
    }

});


/**
 * A filter of gender, category, size, and colour. Empty arrays indicates it is not filtered. 
 */
class Filter {

    constructor(genders = [], categories = [], sizes = [], colors = []) {
        this.genders = genders;
        this.categories = categories;
        this.sizes = sizes;
        this.colors = colors;
    }

    /**
     * Checks if a gender is included in the filter. 
     * @param {String} gender -The hex value of the colour to filter 
     */
    isGenderIncluded(gender) {
        if (this.genders.length == 0)
            return true;
        else {
            if (gender == "female" || gender == "women" || gender == "womens") {
                return (this.genders.includes("female") || this.genders.includes("women") || this.genders.includes("womens"));
            }
            else if (gender == "male" || gender == "men" || gender == "mens") {
                return (this.genders.includes("male") || this.genders.includes("men") || this.genders.includes("mens"));
            }
            else {
                return true;
            }
        }

    }

    /**
     * Checks if a category is included in the filter. 
     * @param {String} category -The hex value of the colour to filter 
     */
    isCategoryIncluded(category) {
        if (this.categories.length == 0)
            return true;
        else
            return this.categories.includes(category);
    }

    /**
     * Checks if a size is included in the filter. 
     * @param {String} size -The hex value of the colour to filter 
     */
    isSizeIncluded(size) {
        if (this.sizes.length == 0)
            return true;
        else
            return this.sizes.includes(size);
    }

    /**
     * Checks if a colour is included in the filter. 
     * @param {String} colour -The hex value of the colour to filter 
     */
    isColorIncluded(colour) {
        return true;    /*Haven't figured this out yet. Seem either very complicated or very tedious */
    }
}

/**
 * shows a toast notification in the bottom right corner
 * @param {String} msg 
 */
function showToast(msg) {
    let toast = document.querySelector("main .toast");
    if (toast) {
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show") }, 5000);
    }
}