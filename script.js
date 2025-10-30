  const firebaseConfig = {
    apiKey: "ISI_API_KEY_MU",
    authDomain: "ISI_DOMAIN.firebaseapp.com",
    databaseURL: "https://cesha-cafe-default-rtdb.firebaseio.com/",
    projectId: "ISI_PROJECT_ID",
    storageBucket: "ISI_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "ISI_SENDER_ID",
    appId: "ISI_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  const pesanan = {};

  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }

  function ubahJumlah(nama, harga, delta) {
    const id = nama.replace(/\s+/g, "_");
    const qtyElem = document.getElementById(`qty-${id}`);
    let jumlah = parseInt(qtyElem.textContent) + delta;
    if (jumlah < 0) jumlah = 0;
    qtyElem.textContent = jumlah;
    pesanan[nama] = { harga, jumlah };
  }

  function simpanKeFirebase(data) {
    db.ref("pesananCafe").push(data);
  }

  function buatPesanan() {
    let total = 0;
    const detailPesanan = [];
    for (const [nama, { harga, jumlah }] of Object.entries(pesanan)) {
      if (jumlah > 0) {
        const subtotal = harga * jumlah;
        total += subtotal;
        detailPesanan.push({ nama, harga, jumlah, subtotal });
      }
    }

    if (total === 0) return alert("Silakan pilih menu terlebih dahulu!");

    const now = new Date();
    const tanggalDisplay = now.toLocaleString("id-ID");
    const timestamp = now.getTime();

    const rincian = detailPesanan.map(d => `${d.nama} x${d.jumlah}`).join(", ");
    const data = { tanggalDisplay, timestamp, rincian, total };
    simpanKeFirebase(data);
    cetakStruk(tanggalDisplay, detailPesanan, total);
    tampilkanRiwayat();
  }

  function cetakStruk(tanggal, detailPesanan, total) {
    const strukWindow = window.open("", "_blank");
    let rows = "";
    detailPesanan.forEach(item => {
      rows += `
        <tr>
          <td>${item.nama}</td>
          <td>${item.jumlah}</td>
          <td>Rp ${item.harga.toLocaleString()}</td>
          <td>Rp ${item.subtotal.toLocaleString()}</td>
        </tr>`;
    });

    strukWindow.document.write(`
      <html><head><title>Struk Pesanan</title>
      <style>
        body{font-family:'Poppins',sans-serif;margin:20px;text-align:center;color:#3e2723;}
        table{width:100%;border-collapse:collapse;margin-top:10px;}
        th,td{border:1px solid #bbb;padding:8px;font-size:14px;}
        th{background:#c68b59;color:#fff;}
        h2{margin-bottom:5px;}
        .total{font-weight:bold;font-size:1.2rem;text-align:right;margin-top:10px;}
      </style></head>
      <body>
        <h2>☕ Cesha Cafe</h2>
        <p>${tanggal}</p>
        <hr>
        <table>
          <tr><th>Menu</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
          ${rows}
        </table>
        <div class="total">Total: Rp ${total.toLocaleString()}</div>
        <p>Terima kasih telah berkunjung ❤️</p>
        <script>window.print();<\/script>
      </body></html>
    `);
    strukWindow.document.close();
  }

  function tampilkanRiwayat() {
    const tbody = document.getElementById("riwayatPesanan");
    tbody.innerHTML = "";
    const filter = document.getElementById("filter").value;
    const now = new Date();
    const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const awalMinggu = new Date(now);
    awalMinggu.setDate(now.getDate() - now.getDay());
    awalMinggu.setHours(0, 0, 0, 0);
    const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const awalTahun = new Date(now.getFullYear(), 0, 1).getTime();

    db.ref("pesananCafe").once("value", (snapshot) => {
      const dataList = [];
      snapshot.forEach((child) => {
        const item = child.val();
        const ts = item.timestamp || 0;
        let tampil = false;

        switch (filter) {
          case "all": tampil = true; break;
          case "hari": tampil = ts >= awalHari; break;
          case "minggu": tampil = ts >= awalMinggu.getTime(); break;
          case "bulan": tampil = ts >= awalBulan; break;
          case "tahun": tampil = ts >= awalTahun; break;
        }

        if (tampil) dataList.push(item);
      });

      dataList.sort((a, b) => b.timestamp - a.timestamp);
      dataList.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.tanggalDisplay}</td>
          <td>${item.rincian}</td>
          <td>Rp ${item.total.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  function eksporExcel() {
    const table = document.getElementById("tabelRiwayat");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan Cafe" });
    XLSX.writeFile(wb, `Laporan_Cesha_Cafe_${new Date().toLocaleDateString("id-ID")}.xlsx`);
  }

  function bukaLaporan() {
    tampilkanRiwayat();
    scrollToSection("laporan");
  }

  // Tampilkan data otomatis saat halaman dibuka
  tampilkanRiwayat();
