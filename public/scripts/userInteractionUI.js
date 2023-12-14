// import { add_book } from './storageController.js';
import { get_book_data, get_book_cover } from './apiHandler.js';
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
let cover_image = undefined;

let post_data = {};

/**
 * 
 * @param {object} book_data 
 * @param {string} cover_image_src 
 */
export async function display_new_book_confirmation(book_isbn) {
    reset_new_book_confirmation();

    new Promise(async () => {
        book_data = await get_book_data('isbn', book_isbn)
        .then(data => {
            book_data = data.docs[0];

            title_header.innerText = book_data.title;
            author_header.innerText = book_data.author_name;

            post_data = {
                title: book_data.title,
                isbn: book_isbn
            };
        })
        .catch (error => {
            title_header.innerText = 'Unknown Title';
            author_header.innerText = 'Unknown Author';
        });

        cover_image = await get_book_cover('isbn', book_isbn, 'L')
        .then((image) => {
            cover_image_element.style.width = image.width;
            cover_image_element.style.height = image.height;
            
            cover_image_element.append(image);
            
            cover_image_element.style.display = "block";
        })
        .catch(error => { 
            console.log(error, 'Could not load book cover.') 
        });

        barcode_scanner_container.style.display = 'none';

        new_book_dialogue_container.style.display = 'block';
        accept_book_actions_container.style.display = 'block';
    });

    accept_book_button.addEventListener('click', () => {
        // Add book to db.
        fetch('/add/book', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(post_data) })
        .then(response => response.json())
        .then(data => console.log('Server response:', data));

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
    }, { once: true });
}

function reset_new_book_confirmation() {
    barcode_scanner_container.style.display = 'block';
    
    title_header.innerText = 'Title';
    author_header.innerText = 'Author';

    book_data = undefined;
    cover_image = undefined;
    post_data = undefined;

    if (cover_image_element.querySelector('img')) cover_image_element.removeChild(cover_image_element.querySelector('img'));

    new_book_dialogue_container.style.display = 'none';
    accept_book_actions_container.style.display = 'none';
    keep_scanning_actions_container.style.display = 'none';
}