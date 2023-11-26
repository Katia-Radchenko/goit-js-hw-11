import axios from "axios";

import { BASE_URL, options } from './api-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

let totalHits = 0;
let isLoadingMore = false;
let reachedEnd = false;


const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  searchInput: document.querySelector('input[name="searchQuery"]')
};


const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
  enableKeyboard: true,
  showCounter: false,
  scrollZoom: false,
  close: false,
});

refs.form.addEventListener('submit' , onFormSybmit );
window.addEventListener('scroll', onScroll);
document.addEventListener('DOMContentLoaded', hideLoader);

function showLoader() {
  refs.loader.style.display = 'block';
}

function hideLoader() {
  refs.loader.style.display = 'none';
}
async function loadMore() {
  isLoadingMore = true;
  options.params.page += 1;
  try {
    showLoader();
    const response = await axios.get(BASE_URL, options);
    const hits = response.data.hits;
    markupGallery(hits);
  } catch (err) {
    Notify.failure(err);
    hideLoader();
  } finally {
    hideLoader();
    isLoadingMore = false;
  }
}

function onScroll (){
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrollThreshold = 300;
  if (
    scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
    refs.gallery.innerHTML !== '' &&
    !isLoadingMore &&
    !reachedEnd
  ) {
    loadMore();
  }
}

 async function  onFormSybmit (e){
    e.preventDefault();
    options.params.q = refs.searchInput.value.trim();
    if (options.params.q === '') {
      return;
    }
    options.params.page = 1;
    refs.gallery.innerHTML = '';
    reachedEnd = false;

    try {
      showLoader();
      const response = await axios.get(BASE_URL, options);
      totalHits = response.data.totalHits;
      const hits = response.data.hits;
      if (hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${totalHits} images.`);
         markupGallery(hits);
      }
      refs.searchInput.value = '';
      hideLoader();
    } catch (err) {
      Notify.failure(err);
      hideLoader();
    }
  }


function  markupGallery(hits) {
  const markup = hits
    .map(item => {
      return `
            <a href="${item.largeImageURL}" class="lightbox">
                <div class="photo-card">
                    <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
                </div>
            </a>
            `;
    })
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);

  if (options.params.page * options.params.per_page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
    }
  }
  lightbox.refresh();
}

