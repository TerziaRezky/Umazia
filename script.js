document.addEventListener('DOMContentLoaded', function() {
    // Wishlist functionality
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let allProducts = []; // This will be populated from your JSON

    function updateWishlistCount() {
        document.querySelector('.wishlist-count').textContent = wishlist.length;
    }

    function renderWishlistItems() {
        const wishlistItemsContainer = document.querySelector('.wishlist-items');
        wishlistItemsContainer.innerHTML = '';
        
        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = '<p>Wishlist Anda kosong</p>';
            return;
        }
        
        wishlist.forEach(itemId => {
            const product = allProducts.find(p => p.id === itemId);
            if (product) {
                const wishlistItem = document.createElement('div');
                wishlistItem.className = 'wishlist-item';
                wishlistItem.innerHTML = `
                    <img src="images/${product.image}" alt="${product.name}">
                    <div class="wishlist-item-info">
                        <h4>${product.name}</h4>
                        <p>Rp ${product.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button class="remove-wishlist" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                wishlistItemsContainer.appendChild(wishlistItem);
            }
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                removeFromWishlist(productId);
            });
        });
    }

    function addToWishlist(productId) {
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistCount();
            renderWishlistItems();
        }
    }

    function removeFromWishlist(productId) {
        wishlist = wishlist.filter(id => id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        renderWishlistItems();
        
        // Update heart icon in product grid
        const heartIcon = document.querySelector(`.wishlist-icon[data-id="${productId}"]`);
        if (heartIcon) {
            heartIcon.classList.remove('active');
        }
    }

    function isInWishlist(productId) {
        return wishlist.includes(productId);
    }

    // Toggle wishlist sidebar
    document.querySelector('.wishlist-toggle').addEventListener('click', function() {
        document.querySelector('.wishlist-sidebar').classList.toggle('active');
    });

    document.querySelector('.close-wishlist').addEventListener('click', function() {
        document.querySelector('.wishlist-sidebar').classList.remove('active');
    });

    // Mobile Navigation with Animation (from your code)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        if (navMenu.classList.contains('active')) {
            navMenu.style.animation = 'slideIn 0.3s forwards';
        } else {
            navMenu.style.animation = 'slideOut 0.3s forwards';
        }
    });
    
    // Improved mobile menu closing with animation
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                navMenu.style.animation = 'slideOut 0.3s forwards';
                
                setTimeout(() => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    navMenu.style.animation = '';
                    
                    const target = e.currentTarget.getAttribute('href');
                    if (target.startsWith('#')) {
                        const targetElement = document.querySelector(target);
                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        window.location.href = target;
                    }
                }, 250);
            }
        });
    });
    
    // Enhanced Header scroll effect with parallax
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        const scrollPosition = window.scrollY;
        
        header.classList.toggle('scrolled', scrollPosition > 50);
        
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        }
        
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.style.display = scrollPosition > 300 ? 'block' : 'none';
        }
    });
    
    // Back to top button functionality
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    document.body.appendChild(backToTop);
    
    // Product filtering with animations
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productGrid = document.querySelector('.product-grid');
    
    // Load products from JSON with loading state
    fetchProducts();
    
    function fetchProducts() {
        productGrid.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
        
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                displayProducts(products);
                setupFilterButtons(products);
                updateWishlistCount(); // Initialize wishlist count
                renderWishlistItems(); // Initialize wishlist items
            })
            .catch(error => {
                console.error('Error loading products:', error);
                productGrid.innerHTML = '<div class="error-message">Produk tidak dapat dimuat. Silakan refresh halaman.</div>';
            });
    }
    
    function setupFilterButtons(products) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                filterBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                
                if (filter === 'all') {
                    displayProducts(products);
                } else {
                    const filteredProducts = products.filter(product => product.category === filter);
                    displayProducts(filteredProducts);
                }
            });
        });
    }
    
    function displayProducts(products) {
        productGrid.style.opacity = '0';
        productGrid.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            productGrid.innerHTML = '';
            
            if (products.length === 0) {
                productGrid.innerHTML = '<div class="no-products">Tidak ada produk dalam kategori ini.</div>';
            } else {
                products.forEach((product, index) => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.dataset.category = product.category;
                    productCard.style.animationDelay = `${index * 0.1}s`;
                    
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="images/${product.image}" alt="${product.name}" loading="lazy">
                            <i class="fas fa-heart wishlist-icon ${isInWishlist(product.id) ? 'active' : ''}" 
                               data-id="${product.id}"></i>
                            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="product-meta">
                                ${product.rating ? `<div class="product-rating">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}</div>` : ''}
                            </div>
                            <div class="product-price">
                                <span class="price">Rp ${product.price.toLocaleString('id-ID')}/pcs</span>
                                <button class="add-to-cart" 
                                        data-id="${product.id}" 
                                        data-nama="${product.name}"
                                        data-price="${product.price}">
                                    <i class="fas fa-comment-dots"></i> Pesan
                                </button>
                            </div>
                        </div>
                    `;
                    
                    productGrid.appendChild(productCard);
                });
                
                // Add event listeners to wishlist icons
                document.querySelectorAll('.wishlist-icon').forEach(icon => {
                    icon.addEventListener('click', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        this.classList.toggle('active');
                        
                        if (this.classList.contains('active')) {
                            addToWishlist(productId);
                        } else {
                            removeFromWishlist(productId);
                        }
                    });
                });
            }
            
            productGrid.style.opacity = '1';
            productGrid.style.transform = 'translateY(0)';
            
            setupWhatsAppButtons();
        }, 300);
    }
    
    function setupWhatsAppButtons() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 300);
                
                const productId = this.dataset.id;
                const productName = this.dataset.nama;
                const productPrice = this.dataset.price;
                const noWhatsApp = "6283845835659";
                
                const pesan = `Halo! Saya ingin memesan produk berikut:\n\n📌 *Nama Produk*: ${productName}\n🆔 *ID Produk*: ${productId}\n💰 *Harga*: Rp ${parseInt(productPrice).toLocaleString('id-ID')}\n\nApakah masih tersedia?`;
                const url = `https://wa.me/${noWhatsApp}?text=${encodeURIComponent(pesan)}`;
                
                setTimeout(() => {
                    window.open(url, "_blank");
                }, 200);
            });
        });
    }
    
    // Enhanced Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }, 1000);
            }
        });
    });
    
    // Enhanced Form submission with validation
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
            
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            formInputs.forEach(input => {
                if (input.required && !input.value.trim()) {
                    input.parentElement.classList.add('error');
                    isValid = false;
                } else {
                    input.parentElement.classList.remove('error');
                }
                
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.parentElement.classList.add('error');
                        isValid = false;
                    }
                }
            });
            
            if (isValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    console.log('Form submitted:', data);
                    
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.</p>
                    `;
                    contactForm.appendChild(successMessage);
                    
                    setTimeout(() => {
                        contactForm.reset();
                        formInputs.forEach(input => {
                            input.parentElement.classList.remove('focused');
                        });
                        successMessage.style.animation = 'fadeOut 0.5s forwards';
                        
                        setTimeout(() => {
                            successMessage.remove();
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.disabled = false;
                        }, 500);
                    }, 3000);
                }, 1500);
            }
        });
    }
    
    // Enhanced Newsletter form with floating label
    const newsletterForm = document.querySelector('.footer-newsletter form');
    
    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const label = newsletterForm.querySelector('label');
        
        emailInput.addEventListener('focus', () => {
            label.classList.add('active');
        });
        
        emailInput.addEventListener('blur', () => {
            if (!emailInput.value) {
                label.classList.remove('active');
            }
        });
        
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                emailInput.parentElement.classList.add('error');
                return;
            }
            
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                console.log('Newsletter subscription:', email);
                
                const successMessage = document.createElement('div');
                successMessage.className = 'newsletter-success';
                successMessage.textContent = 'Terima kasih telah berlangganan!';
                newsletterForm.appendChild(successMessage);
                
                setTimeout(() => {
                    newsletterForm.reset();
                    label.classList.remove('active');
                    successMessage.style.opacity = '0';
                    
                    setTimeout(() => {
                        successMessage.remove();
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }, 500);
                }, 2000);
            }, 1000);
        });
    }
    
    // Add animation on scroll for elements
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Product hover effect
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.product-card')) {
            const productCard = e.target.closest('.product-card');
            const productImage = productCard.querySelector('.product-image img');
            
            if (productImage) {
                productImage.style.transform = 'scale(1.05)';
            }
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.product-card')) {
            const productCard = e.target.closest('.product-card');
            const productImage = productCard.querySelector('.product-image img');
            
            if (productImage) {
                productImage.style.transform = 'scale(1)';
            }
        }
    });
    
    // Add to cart button hover effect
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        }
    });
});


        // Initialize AOS
        document.addEventListener('DOMContentLoaded', function() {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });

            // Your existing JavaScript code for testimonials, wishlist, etc.
            const testimonials = document.querySelectorAll('.testimonial');
            const dotsContainer = document.querySelector('.dots-container');
            let currentIndex = 0;
            let interval;
            
            // Create dots
            testimonials.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToTestimonial(index);
                });
                dotsContainer.appendChild(dot);
            });
            
            const dots = document.querySelectorAll('.dot');
            
            // Navigation functions
            function goToTestimonial(index) {
                testimonials[currentIndex].classList.remove('active');
                dots[currentIndex].classList.remove('active');
                
                currentIndex = (index + testimonials.length) % testimonials.length;
                
                testimonials[currentIndex].classList.add('active');
                dots[currentIndex].classList.add('active');
                
                resetInterval();
            }
            
            function nextTestimonial() {
                goToTestimonial(currentIndex + 1);
            }
            
            function prevTestimonial() {
                goToTestimonial(currentIndex - 1);
            }
            
            function startInterval() {
                interval = setInterval(nextTestimonial, 5000);
            }
            
            function resetInterval() {
                clearInterval(interval);
                startInterval();
            }
            
            document.querySelector('.next').addEventListener('click', () => {
                nextTestimonial();
            });
            
            document.querySelector('.prev').addEventListener('click', () => {
                prevTestimonial();
            });
            
            const slider = document.querySelector('.testimonial-slider');
            slider.addEventListener('mouseenter', () => {
                clearInterval(interval);
            });
            
            slider.addEventListener('mouseleave', () => {
                resetInterval();
            });
            
            startInterval();
        });
   AOS.init({
            duration: 800, // animation duration in milliseconds
            easing: 'ease-in-out', // default easing for AOS animations
            once: true, // whether animation should happen only once - while scrolling down
            offset: 100, // offset (in px) from the original trigger point
        });