import { display_new_book_confirmation } from '../scripts/user.js';

export async function test_display_new_book_information() {
    const book_data = await fetch("tests/book_data.json").then(response => response.json());

    const cover_image_src = 'https://ia800505.us.archive.org/view_archive.php?archive=/35/items/l_covers_0014/l_covers_0014_39.zip&file=0014391648-L.jpg';

    return display_new_book_confirmation(book_data, cover_image_src);
}