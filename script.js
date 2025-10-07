    // 🔹 Firebase Setup
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      databaseURL: "https://cesha-cafe-default-rtdb.firebaseio.com/",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // 🔹 Scroll
    function scrollToSection(id) {
      document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    }

    let pesanan = {};

    function ubahJumlah(nama, harga, jumlah) {
      const key = nama.replace(/\s+/g, "_");
      if (!pesanan[key]) pesanan[key] = { nama, qty: 0, harga };
      pesanan[key].qty += jumlah;
      if (pesanan[key].qty < 0) pesanan[key].qty = 0;
      document.getElementById(`qty-${key}`).textContent = pesanan[key].qty;
    }

    // 🔹 Simpan & Cetak Struk
    async function buatPesanan() {
      let items = Object.values(pesanan).filter(i => i.qty > 0);
      if (items.length === 0) {
        alert("❌ Belum ada pesanan!");
        return;
      }

      let total = 0;
      let detail = {};
      let strukRows = items.map(item => {
        let sub = item.qty * item.harga;
        total += sub;
        detail[item.nama] = { qty: item.qty, harga: item.harga, subtotal: sub };
        return `<tr><td>${item.nama}</td><td>${item.qty}</td><td>Rp ${sub.toLocaleString()}</td></tr>`;
      }).join('');

      let order = {
        tanggal: new Date().toISOString(),
        total,
        items: detail
      };

      try {
        await db.ref("pesanan").push(order);

        let strukHTML = `
          <html><head><title>Struk Cesha Cafe</title>
          <style>
            body { font-family: Arial; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            td, th { border: 1px solid #ccc; padding: 6px; text-align: center; }
            tfoot td { font-weight: bold; }
          </style>
          </head>
          <body>
            <h2>☕ Cesha Cafe</h2>
            <p>Jl. Kopi No. 123, Jakarta</p><hr>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>${strukRows}</tbody>
              <tfoot><tr><td colspan="2">Total</td><td>Rp ${total.toLocaleString()}</td></tr></tfoot>
            </table>
            <p>Terima kasih telah berbelanja di Cesha Cafe!<br>${new Date().toLocaleString()}</p>
            <script>window.print();<\/script>
          </body></html>`;

        let printWindow = window.open("", "_blank");
        printWindow.document.write(strukHTML);
        printWindow.document.close();

        Object.values(pesanan).forEach(p => {
          p.qty = 0;
          document.getElementById(`qty-${p.nama.replace(/\s+/g, "_")}`).textContent = 0;
        });

        alert("✅ Pesanan tersimpan & struk dicetak!");
        tampilkanPendapatan();
      } catch (e) {
        console.error(e);
        alert("❌ Gagal menyimpan pesanan!");
      }
    }

    // 🔹 Filter Pendapatan
    function ubahFilter() {
      let f = document.getElementById("filter").value;
      document.getElementById("filterTanggal").style.display = f === "harian" ? "inline" : "none";
      document.getElementById("filterBulan").style.display = f === "bulanan" ? "inline" : "none";
      document.getElementById("filterTahun").style.display = f === "tahunan" ? "inline" : "none";
      tampilkanPendapatan();
    }

    async function tampilkanPendapatan() {
      const snapshot = await db.ref("pesanan").once("value");
      const data = snapshot.val() || {};

      let filter = document.getElementById("filter").value;
      let total = 0;
      let today = new Date();

      for (let key in data) {
        let p = data[key];
        let tgl = new Date(p.tanggal);

        if (filter === "harian") {
          let pilih = new Date(document.getElementById("filterTanggal").value || today);
          if (
            tgl.getFullYear() === pilih.getFullYear() &&
            tgl.getMonth() === pilih.getMonth() &&
            tgl.getDate() === pilih.getDate()
          ) total += p.total;
        } 
        else if (filter === "bulanan") {
          let [y, m] = (document.getElementById("filterBulan").value || `${today.getFullYear()}-${today.getMonth()+1}`).split("-");
          if (
            tgl.getFullYear() === parseInt(y) &&
            (tgl.getMonth()+1) === parseInt(m)
          ) total += p.total;
        } 
        else if (filter === "tahunan") {
          let y = parseInt(document.getElementById("filterTahun").value || today.getFullYear());
          if (tgl.getFullYear() === y) total += p.total;
        }
      }

      document.getElementById("totalPendapatan").textContent = total.toLocaleString();
    }

    // Awal load
    window.onload = tampilkanPendapatan;
