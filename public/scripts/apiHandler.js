export async function get_book_cover(type, value, size) {
    let ol_cover_api = `https://covers.openlibrary.org/b/${type}/${value}-${size}.jpg?default=false`;

    const img = new Image();

    return new Promise((resolve, reject) => {
        fetch(ol_cover_api)
        .then(response => {
            // if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
            if (response.ok) return response.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(objectURL);
                resolve(img);
            };
            img.src = objectURL;
        })
        .catch(error => {
            console.error('Error loading image:', error);
            // You can handle the error here or pass it to the reject function if needed
            reject(error);
        });
    });
}

export async function get_book_data(type, value) {
    let ol_book_data_api = `https://openlibrary.org/search.json?${type}=${value}?default=false  `;

    return await fetch(ol_book_data_api)
    .then(response => {
        if (!response.ok) throw new Error('Could not load book data', {cause: response});
        if (response.ok) return response.json();
    })
    .catch(error => console.log(error));
}

// https://covers.openlibrary.org/b/isbn/9780593489147-L.jpg?default=false
// https://openlibrary.org/search.json?isbn=9780593489147