async function get_book_cover(isbn, size) {
    const api_key = `&key=${process.env.API_KEY}`;
    const query = `?q=${isbn}`;
    const fields = '&fields=items(volumeInfo(imageLinks))';
    const max_results = '&maxResults=1';

    const google_books_api = `https://www.googleapis.com/books/v1/volumes${query}${fields}${max_results}${api_key}`;

    let image_link = undefined;
    let zoom_value = undefined;

    const sizes = {
        'small': 1,
        'medium': 2,
        'large': 0
    };

    size = size.toLowerCase();

    if (sizes.hasOwnProperty(size)) {zoom_value = sizes[size] } else { zoom_value = sizes.medium; }

    return await fetch(google_books_api).then(response => { if (response.ok) return response.json(); }).then(data => {
        const image_links_thumbnail = data.items[0].volumeInfo.imageLinks.thumbnail;
        image_link = image_links_thumbnail.replace(/zoom=\d{1}/, `zoom=${zoom_value}`);
        return image_link;
    }).catch(error => console.log(error));
}

/**
 * 
 * @param {string} type 
 * @param {string} value 
 * @returns 
 */
async function get_book_data(isbn) {
    const api_key = `&key=${process.env.API_KEY}`;
    const query = `?q=${isbn}`;
    const fields = '&fields=items(volumeInfo(title,authors,pageCount,maturityRating,description))';
    const max_results = '&maxResults=1';

    const google_books_api = `https://www.googleapis.com/books/v1/volumes${query}${fields}${max_results}${api_key}`;

    return await fetch(google_books_api).then(response => { if (response.ok) return response.json(); }).then(data => {
        const book_data = data.items[0].volumeInfo;
        return book_data;
    }).catch(error => { throw new Error('Could not load book data', {cause: response}) });
}

module.exports =  { get_book_cover, get_book_data };

// https://covers.openlibrary.org/b/isbn/9780593489147-L.jpg?default=false
// https://openlibrary.org/search.json?isbn=9780593489147