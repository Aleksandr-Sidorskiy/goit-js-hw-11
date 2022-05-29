import { Notify } from "notiflix";
import fetchImages from "./js/fetch";
// Описан в документации
import SimpleLightbox from "simplelightbox";
// Дополнительный импорт стилей
import "simplelightbox/dist/simple-lightbox.min.css";
import "../src/sass/main.scss"

const { searchForm, gallery, loadMoreBtn, endCollectionText, cardHeight } = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
    endCollectionText: document.querySelector('.end-collection-text'),
  cardHeight: document.querySelector('.gallery'),
};

searchForm.addEventListener('submit', onSubmitSearchForm);
loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

function renderCardImage(arr) {
    const markup = arr.map(item => cardTemplate(item)).join('');
    gallery.insertAdjacentHTML('beforeend', markup)
}

// Шаблон
function cardTemplate() {
    return `
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b>${downloads}</b>
    </p>
  </div>
</div>`
}

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

let currentPage = 1;
let currentHits = 0;
let searchQuery = '';

function onSubmitSearchForm(evt) {
    evt.preventDefault();
    searchQuery = evt.currentTarget.searchQuery.value;
    currentPage = 1;

    if (searchQuery === '') {
        return;
    }
    const response =  fetchImages(searchQuery, currentPage);
    currentHits = response.hits.length;
    
    if (response.totalHits > 40) {
        loadMoreBtn.classList.remove('is-hidden');
    } else { loadMoreBtn.classList.add('is-hidden') };
    
    try {
        if (response.totalHits > 0) {
            Notify.failure(`Hooray! We found ${response.totalHits} images.`);
            gallery.innerHTML = '';
            renderCardImage(response.hits);
            lightbox.refresh();
            endCollectionText.classList.add('is-hidden');
            
            cardHeight.firstElementChild.getBoundingClientRect();
            
            window.scrollBy({
            top: cardHeight * -100,
            behavior: 'smooth',
        });
    }
    
    if (response.totalHits === 0) {
        gallery.innerHTML = '';
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        loadMoreBtn.classList.add('is-hidden');
        endCollectionText.classList.add('is-hidden');
    }
} catch (error) {
    console.log(error);
    }
}

async function onClickLoadMoreBtn() {
  currentPage += 1;
  const response = await fetchImages(searchQuery, currentPage);
  renderCardImage(response.hits);
  lightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits === response.totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    endCollectionText.classList.remove('is-hidden');
  }
}