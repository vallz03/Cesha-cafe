let pesanan = {};

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Fungsi tambah/kurang jumlah
function ubahJumlah(nama, harga, perubahan) {
    if (!pesanan[nama]) {
        pesanan[nama] = { harga: harga, qty: 0 };
    }

    pesanan[nama].qty += perubahan;
    if (pesanan[nama].qty < 0) pesanan[nama].qty = 0;

    // Update tampilan jumlah
    document.getElementById(`qty-${nama}`).textContent = pesanan[nama].qty;
}

// Fungsi buat struk & cetak
function buatPesanan() {
    let items = Object.keys(pesanan).filter(nama => pesanan[nama].qty > 0);
    if (items.length === 0) {
        alert("❌ Belum ada pesanan!");
        return;
    }

    let total = 0;
    let strukRows = items.map(nama => {
        let subTotal = pesanan[nama].harga * pesanan[nama].qty;
        total += subTotal;
        return `<tr><td>${nama}</td><td>${pesanan[nama].qty}</td><td>Rp ${subTotal.toLocaleString()}</td></tr>`;
    }).join('');

    let strukHTML = `
        <html>
        <head>
            <title>Struk Cesha Cafe</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                h2 { margin-bottom: 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                td, th { border: 1px solid #ddd; padding: 8px; text-align: center; }
                tfoot td { font-weight: bold; }
            </style>
        </head>
        <body>
            <h2>☕ Cesha Cafe</h2>
            <p>Jl. Kopi No. 123, Jakarta</p>
            <hr>
            <table>
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
                </thead>
                <tbody>${strukRows}</tbody>
                <tfoot>
                    <tr><td colspan="2">Total</td><td>Rp ${total.toLocaleString()}</td></tr>
                </tfoot>
            </table>
            <p>Terima kasih telah berbelanja!<br>${new Date().toLocaleString()}</p>
            <script>window.print();<\/script>
        </body>
        </html>
    `;

    let printWindow = window.open("", "_blank");
    printWindow.document.write(strukHTML);
    printWindow.document.close();

    // Reset pesanan setelah dicetak
    for (let nama in pesanan) {
        pesanan[nama].qty = 0;
        document.getElementById(`qty-${nama}`).textContent = 0;
    }
}
