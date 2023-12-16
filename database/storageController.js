const { createPool } = require('mariadb');

const pool = createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        connectionLimit: 5,
        compress: true
    }
);

/**
 * 
 * @param {object} book_data 
 */
async function add_book(book_data) {
    let conn;
    try {
        conn = await pool.getConnection(); 

        let prepare = await conn.prepare('INSERT INTO owned_books(isbn, title) VALUES (?, ?)');
        await prepare.execute([parseInt(book_data.isbn), book_data.title]);
        prepare.close();

        prepare = await conn.prepare('INSERT INTO covers(isbn, medium, large) VALUES (?, ?, ?)');
        await prepare.execute([parseInt(book_data.isbn), book_data.cover_sources.medium, book_data.cover_sources.large]);
        prepare.close();
    }  catch (error) { 
        console.error(error);
    } finally { 
        if (conn) conn.release();
    }
}

async function get_all_books() {
    // [
    //     book_obj {
    //         isbn
    //         title
    //         cover medium
    //     }
    // ]

    let conn;
    try { 
        conn = await pool.getConnection(); 

        const rows = await conn.query(
            `SELECT owned_books.isbn, owned_books.title, covers.medium FROM owned_books 
            LEFT JOIN covers ON owned_books.isbn = covers.isbn`
        );
        
        if (rows) return await rows;
    }  catch (error) { 
        console.error(error);
    } finally { 
        if (conn) conn.release();
    }
}

async function test_db_connection() {
    let conn;
    try { conn = await pool.getConnection(); } 
    catch (error) { console.error(error); } 
    finally { if (conn) conn.release(); console.log('MariaDB established with no errors.'); }
}

module.exports = { get_all_books, add_book };