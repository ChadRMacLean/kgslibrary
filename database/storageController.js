const { createPool } = require('mariadb');

const pool = createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionLimit: 5,
        compress: true
    }
);

/**
 * 
 * @param {number} isbn 
 * @param {string} title 
 */
export async function add_book(isbn, title) {
    let conn;
    try { 
        conn = await pool.getConnection(); 

        const prepare = await conn.prepare('INSERT INTO owned_books(isbn, title) VALUES (?, ?)');
        await prepare.execute(isbn, title);
        prepare.close();
    }  catch (error) { 
        console.error(error);
    } finally { 
        if (conn) conn.release();
        exit(); 
    }
}

async function test_db_connection() {
    let conn;
    try { conn = await pool.getConnection(); } 
    catch (error) { console.error(error); } 
    finally { if (conn) conn.release(); console.log('MariaDB established with no errors.'); exit(); }
}