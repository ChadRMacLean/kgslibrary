import { detector } from './detector.js';
import { get_book_data, get_book_cover } from './ol.js';

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

/**
 * 
 * @param {object} book_data 
 * @param {string} cover_image_src 
 */
export async function display_new_book_confirmation(book_isbn) {
    reset_new_book_confirmation();

    new Promise(async () => {
        book_data = await get_book_data('isbn', book_isbn);
        book_data = book_data.docs[0];

        cover_image = await get_book_cover('isbn', book_isbn, 'L');

        if (typeof cover_image == 'string') {
            cover_image = document.createElement('img');
            cover_image.src = cover_image_src;
            cover_image_element.style.width = '100%';
        } else {
            cover_image_element.style.width = cover_image.width;
            cover_image_element.style.height = cover_image.height;
        }
        
        cover_image_element.append(cover_image);
        
        cover_image_element.style.display = "block";
        
        title_header.innerText = book_data.title;
        author_header.innerText = book_data.author_name;

        barcode_scanner_container.style.display = 'none';
        
        new_book_dialogue_container.style.display = 'block';
        accept_book_actions_container.style.display = 'block';

        accept_book_button.addEventListener('click', event => {
            // Add book to local storage.
            // Ask to continue scanning.
            keep_scanning_actions_container.style.display = 'block';
            accept_book_actions_container.style.display = 'none';
        })

        reject_book_button.addEventListener('click', event => {
            keep_scanning_actions_container.style.display = 'block';
            accept_book_actions_container.style.display = 'none';
        });

        continue_scanning_button.addEventListener('click', event => {
            detector.toggle_user_media();
            new_book_dialogue_container.style.display = 'none';
            barcode_scanner_container.style.display = 'block';
        });

        cancel_scanning_button.addEventListener('click', event => {
            new_book_dialogue_container.style.display = 'none';
            barcode_scanner_container.style.display = 'block';
        });
    });
}

function reset_new_book_confirmation() {
    barcode_scanner_container.style.display = 'block';
    
    title_header.innerText = 'Title';
    author_header.innerText = 'Author';

    cover_image = null;

    if (cover_image_element.querySelector('img')) cover_image_element.removeChild(cover_image_element.querySelector('img'));

    new_book_dialogue_container.style.display = 'none';
    accept_book_actions_container.style.display = 'none';
    keep_scanning_actions_container.style.display = 'none';

    accept_book_button.removeEventListener('click', () => {});
    reject_book_button.removeEventListener('click', () => {});
    continue_scanning_button.removeEventListener('click', () => {});
    cancel_scanning_button.removeEventListener('click', () => {});
}