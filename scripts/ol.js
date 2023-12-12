export async function get_book_cover(type, value, size) {
    let ol_cover_api = `https://covers.openlibrary.org/b/${type}/${value}-${size}.jpg?default=false`;

    const img = new Image();
    return new Promise((res, rej) => {
        img.onload = () => res(img);
        img.onerror = e => rej(e);
        img.src = ol_cover_api;
    });
}

export async function get_book_data(type, value) {
    let ol_book_data_api = `https://openlibrary.org/search.json?${type}=${value}`;

    return await fetch(ol_book_data_api).then(response => response.json());
}

// https://covers.openlibrary.org/b/isbn/9780593489147-L.jpg?default=false
// https://openlibrary.org/search.json?isbn=9780593489147