import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages, firstPage, imagesCount, RENDER_IMAGES_NUMBERS } from "./js/fetchImages";

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more'),
};

let pictureName = '';
hideButton(refs.loadMoreButton);
refs.form.addEventListener('submit', Search);
refs.loadMoreButton.addEventListener('click', LoadMore);

function Search(e) {
  e.preventDefault();
  pictureName = e.currentTarget.searchQuery.value;
  firstPage();
  hideButton(refs.loadMoreButton);
  fetchImages(pictureName)
    .then(images => {
      const imagesArray = images.data.hits;
      const totalImages = images.data.totalHits;

      if (imagesArray.length === 0) {
      return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',);
    } else {
        clear();
        markupGallery(imagesArray);
        new SimpleLightbox('.gallery a', { captionDelay: 250, showCounter: false });
      Notiflix.Notify.success(`Hooray! We found ${totalImages} images.`);
      
      if (totalImages <= RENDER_IMAGES_NUMBERS) {
            return
        }
        showButton(refs.loadMoreButton);
    }
    });
}

function LoadMore() {
  fetchImages(pictureName)
    .then(images => {
      const imagesArray = images.data.hits;
      const totalImages = images.data.totalHits;
      markupGallery(imagesArray);
      new SimpleLightbox('.gallery a', { captionDelay: 250, showCounter: false });
      if (imagesCount >= totalImages) {
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        hideButton(refs.loadMoreButton);
      }
    })
  
    .catch(error => {
      console.log(error);
      hideButton(refs.loadMoreButton);
    });
}

function markupGallery(images) {
  const markup = images
    .map(image => {
      return `
        <a class="gallery__item" href="${image.largeImageURL}">
          <div class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                ${image.likes}
              </p>
              <p class="info-item">
                <b>Views</b>
                ${image.views}
              </p>
              <p class="info-item">
                <b>Comments</b>
                ${image.comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>
                ${image.downloads}
              </p>
            </div>
          </div>
        </a>`;
    })
    .join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clear() {
  refs.gallery.innerHTML = '';
}
function hideButton(item) {
    item.classList.add('visually-hidden');
}
function showButton(item) {
    item.classList.remove('visually-hidden');
}