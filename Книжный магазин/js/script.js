const dots = document.getElementsByClassName('slider-dots__item');
const dotsArea = document.getElementsByClassName('slider-dots');
const slides = document.getElementsByClassName('slider-images__item');
let slideIndex = 1;
const storage = JSON.parse(localStorage.getItem('cards') ?? '[]')

showSlides(slideIndex);

function showSlides(n) {
    if (n < 1) {
        slideIndex = slides.length;
    } else if (n > slides.length) {
        slideIndex = 1;
    }
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }
    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].classList.add('active');
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function plusSlides(n) {
    showSlides(slideIndex += n)
}

function autoSlide() {
    plusSlides(1)
}

setInterval(autoSlide, 5000);

dotsArea.onclick = function (e) {
    for (let i = 0; i < dots.length + 1; i++) {
        if (e.target.classList.contains('projects-menu__element') && e.target == dots[i - 1]) {
            currentSlide(i);
        }
    }
}

/* Header */

const headerLinks = document.querySelectorAll('.header-nav__item');

headerLinks.forEach((link => {
    link.addEventListener('click', function() {
        headerLinks.forEach(l => {
            if (l !== this) {
                l.classList.remove('active-link');
            }
        })
        this.classList.add('active-link');
    })
}));

/* Categories */

const categories = document.querySelectorAll('.category');
const cardsWrapper = document.querySelector('.cards-wrapper');
const beigik = document.querySelector('.beigik');
const beigikText = document.querySelector('.beigik-tekst');
let startIndex = 0;

/* Отображение карточек из первой категории при загрузке страницы */

document.addEventListener('DOMContentLoaded', async function() {
    const categoryText = document.querySelector('.chosen').textContent;
    const data = await fetchData(categoryText); 
    if (data) {
        renderCards(data); 
    }
});

document.addEventListener('click', async function(event) {
    
    if (event.target.classList.contains('category__text')) { 
        const categoryText = event.target.textContent;
        const categoryImage = event.target.closest('.category').querySelector('.category__img');

        categories.forEach(category => {
            category.querySelector('.category__text').classList.remove('chosen');
            const image = category.querySelector('.category__img');
            if (image) {
                image.removeAttribute('src');
                image.style.paddingRight = '';
            }
        });

        event.target.classList.add('chosen');
        categoryImage.setAttribute('src', '../images/svg/кружок.svg');

        const data = await fetchData(categoryText);

        if (data) {
            cardsWrapper.innerHTML = '';
            renderCards(data);
        }
    }

    /* Load more buttons logic */

    if(event.target.classList.contains('load-more-button')) {
        startIndex += 6;
        const categoryText = document.querySelector('.chosen').textContent;
        const newData = await fetchData(categoryText);
        if (newData) {
            renderCards(newData);
        }
    };

    /* Buy buttons logic */

    if(event.target.classList.contains('card__info-button') || event.target.classList.contains('in-cart')) {

        const id = event.target.getAttribute('data-index');

        if(storage.includes(id)) {
            storage.splice(storage.indexOf(id), 1)
        } else {
            storage.push(id)
        }

        localStorage.setItem('cards', JSON.stringify(storage));

        const isBuyNow = event.target.innerHTML === 'BUY NOW';
        event.target.classList.toggle('card__info-button', !isBuyNow);
        event.target.classList.toggle('in-cart', isBuyNow);
        event.target.innerHTML = isBuyNow ? 'IN THE CART' : 'BUY NOW';

        beigikText.textContent = storage.length;
        if(storage.length === 0) {
            beigik.style.display = 'none';
            beigikText.style.display = 'none';
        } else {
            beigik.style.display = 'block';
            beigikText.style.display = 'block';
        }
    };
});

async function fetchData(category) {
    try {
        const response = await fetch(`
            https://www.googleapis.com/books/v1/volumes?q="subject:${category}"&key=AIzaSyCdqmPUn-aR5mTXRW-zlUmyyGlWdibKHGk&printType=books&startIndex=${startIndex}&maxResults=6&langRestrict=en
        `);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function renderCards(data) {

    data.forEach(item => {
        const volumeInfo = item.volumeInfo;
        const image = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '../images/png/placeholder-21.png';
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
        const title = volumeInfo.title ? volumeInfo.title : 'Unknown Title';
        const averageRating = volumeInfo.averageRating ? volumeInfo.averageRating : '';
        const ratingsCount = volumeInfo.ratingsCount ? volumeInfo.ratingsCount : '0';
        const description = volumeInfo.description ? volumeInfo.description : 'No description available';
        const retailPrice = item.saleInfo && item.saleInfo.retailPrice ? item.saleInfo.retailPrice.amount : '';
        let currencyCode = item.saleInfo && item.saleInfo.retailPrice ? item.saleInfo.retailPrice.currencyCode : '';
        if (currencyCode === "EUR") {
            currencyCode = "€"
        }
        const price = currencyCode + retailPrice;

        const newCard = `
            <div class="card">
                <img src="${image}" alt="Book cover" class="card__img">
                <div class="card__info">
                    <div class="card__info-wrapper">
                        <span class="card__info-author">${authors}</span>
                        <p class="card__info-booktitle">${title}</p>
                        ${ratingsCount !== '0' ? 
                            `
                            <div class="card__info-ratingblock">
                                <div class="rating" data-total-value="${averageRating}">
                                    <div class="rating__item" data-item-value="5">★</div>
                                    <div class="rating__item" data-item-value="4">★</div>
                                    <div class="rating__item" data-item-value="3">★</div>
                                    <div class="rating__item" data-item-value="2">★</div>
                                    <div class="rating__item" data-item-value="1">★</div>
                                </div>
                                <span class="card__info-rating">${ratingsCount}M review</span>
                            </div>
                            `
                            :
                            ''
                        }
                        <p class="card__info-book-description">${description}</p>
                        <p class="card__info-price">${price}</p>
                        <button type="button" class="card__info-button ${storage.includes(item.id) ? 'in-cart' : ''}" data-index="${item.id}">${storage.includes(item.id) ? 'IN THE CART' : 'BUY NOW'}</button>
                    </div>
                </div>
            </div>
        `;

        cardsWrapper.innerHTML += newCard;
    });
}