export const BASE_URL = 'https://pixabay.com/api/';
export const API_KEY = '25410327-804c76ecb7647eb6416d3959a';
let page = 1;
export const options = {
  params: {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: page,
    q: '',
  },
};

