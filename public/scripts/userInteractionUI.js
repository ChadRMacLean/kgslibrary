import { detector } from './bookScanner.js';

const barcode_scanner_container = document.querySelector("#barcodeScanner");

const new_book_dialogue_container = document.querySelector("#newBookDialogue");

const title_header = new_book_dialogue_container.querySelector("h3");
const author_header = new_book_dialogue_container.querySelector("h4");
const cover_image_element = new_book_dialogue_container.querySelector(".coverArtLarge");

const accept_book_actions_container = new_book_dialogue_container.querySelector("#acceptScannedBook");
const accept_book_button = accept_book_actions_container.querySelector("button#acceptBook");
const reject_book_button = accept_book_actions_container.querySelector("button#rejectBook");

const keep_scanning_actions_container = new_book_dialogue_container.querySelector("#keepScanningBooks");
const continue_scanning_button = keep_scanning_actions_container.querySelector("button#continueScanning");
const cancel_scanning_button = keep_scanning_actions_container.querySelector("button#cancelScanning");

let book_data = undefined;

let post_data = {};

/**
 * 
 * @param {string} isbn 
 */
export async function display_new_book_confirmation(isbn) {
    reset_new_book_confirmation();

    new Promise(async () => {
        post_data = {
            title: undefined,
            isbn: undefined,
            thumbnail_source: undefined
        };

        await fetch(`/books/isbn/${isbn}`).then(response => {
            if (response.ok) return response.json();
            throw new Error(`Unable to fetch book data. Status: ${response.status}`);
        }).then(book_data => {
            title_header.innerText = book_data.title;
            author_header.innerText = book_data.authors[0];

            post_data.title = book_data.title;
            post_data.isbn = isbn;
        }).catch (error => {
            title_header.innerText = 'Unknown Title';
            author_header.innerText = 'Unknown Author';
        });

        new Promise(async (resolve, reject) => {
            await fetch(`/books/isbn/${isbn}/covers/medium`).then((response) => {
                if (response.ok) return response.url;
                throw new Error(`Unable to fetch image at ${response.url}. Status: ${response.status}`);
            }).then(image_source => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = (error) => reject(error);
                image.src = image_source;

                cover_image_element.style.display = "block";
                // cover_image_element.style.width = image.width;
                // cover_image_element.style.height = image.height;
                cover_image_element.append(image);

                post_data.thumbnail_source = image.src;
            }).catch(error => reject(error));
        }).catch((error) => {
            cover_image_element.textContent = 'No cover image available.';
            cover_image_element.style.display = 'block';
        });

        barcode_scanner_container.style.display = 'none';

        new_book_dialogue_container.style.display = 'block';
        accept_book_actions_container.style.display = 'block';
    });

    accept_book_button.addEventListener('click', async () => {
        // await(get_book_cover('isbn', book_isbn, 'M', true))
        // .then(response => post_data.cover_sources.medium = response)
        // .catch(error => {});

        fetch('/add/book', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(post_data) })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
        });

        // Ask to continue scanning.
        keep_scanning_actions_container.style.display = 'block';
        accept_book_actions_container.style.display = 'none';
    }, { once: true });

    reject_book_button.addEventListener('click', () => {
        keep_scanning_actions_container.style.display = 'block';
        accept_book_actions_container.style.display = 'none';
    }, { once: true });

    continue_scanning_button.addEventListener('click', () => {
        detector.toggle_user_media();
        new_book_dialogue_container.style.display = 'none';
        barcode_scanner_container.style.display = 'block';
    }, { once: true });

    cancel_scanning_button.addEventListener('click', () => {
        new_book_dialogue_container.style.display = 'none';
        barcode_scanner_container.style.display = 'block';

        const camera_button = document.querySelector("#videoBtn");
        camera_button.textContent = "Enable Camera";
    }, { once: true });
}

function reset_new_book_confirmation() {
    barcode_scanner_container.style.display = 'block';
    
    title_header.innerText = 'Title';
    author_header.innerText = 'Author';
    cover_image_element.textContent = '';

    book_data = undefined;
    post_data = undefined;

    if (cover_image_element.querySelector('img')) cover_image_element.removeChild(cover_image_element.querySelector('img'));

    new_book_dialogue_container.style.display = 'none';
    accept_book_actions_container.style.display = 'none';
    keep_scanning_actions_container.style.display = 'none';
}