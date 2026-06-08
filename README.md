<p align="center">
  <img src="hasil/banner_hero.svg" alt="IndoBERTweet Sentiment Analyzer" width="100%">
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"></a>
  <a href="https://pytorch.org/"><img src="https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"></a>
  <a href="https://huggingface.co/"><img src="https://img.shields.io/badge/Transformers-HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Transformers"></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-Web%20App-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"></a>
  <img src="https://img.shields.io/badge/Akurasi-93.28%25-10b981?style=for-the-badge" alt="Accuracy">
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=818CF8&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=120&lines=Klasifikasi+Sentimen+6000+Komentar+YouTube;Fine-Tuned+IndoBERTweet+%7C+Akurasi+93.28%25;Mata+Kuliah+Penambangan+Data+%7C+Semester+4" alt="Typing SVG">
</p>

<img src="hasil/separator.svg" width="100%">

## 📌 Deskripsi Proyek

Lomba Cerdas Cermat (LCC) 4 Pilar tingkat Provinsi di Kalimantan Barat menimbulkan kontroversi yang memicu perdebatan hangat di kolom komentar YouTube. Proyek ini melakukan analisis sentimen terhadap **6.000 komentar** untuk mengekstrak opini publik dan mengklasifikasikannya ke dalam **3 kelas sentimen** utama:

<table>
<tr>
<td align="center">🔴</td>
<td><b><code>kritik_juri_panitia</code></b></td>
<td>Komentar berisi keluhan, kritik, atau tuduhan ketidakadilan terhadap juri dan panitia</td>
</tr>
<tr>
<td align="center">🔵</td>
<td><b><code>netral</code></b></td>
<td>Komentar objektif, netral, saran damai, atau tidak memihak pihak tertentu</td>
</tr>
<tr>
<td align="center">🟢</td>
<td><b><code>pro_peserta</code></b></td>
<td>Komentar berisi dukungan moral dan pembelaan kepada para peserta/siswa yang berlomba</td>
</tr>
</table>

> Menggunakan arsitektur model **IndoBERTweet** — model bahasa BERT yang di-pretrain khusus pada media sosial berbahasa Indonesia — sistem ini mampu memahami slang, singkatan, serta gaya bahasa informal khas warganet Indonesia dengan sangat baik.

<img src="hasil/separator.svg" width="100%">

## 📊 Hasil Evaluasi Model

Model IndoBERTweet berhasil dievaluasi menggunakan *split* data uji independen dan memperoleh metrik performa tinggi:

<div align="center">

| Metrik | Nilai |
| :--- | :---: |
| ⚡ **Akurasi Keseluruhan** | **93.28%** |
| 📈 **Macro F1-Score** | **90.31%** |
| 📊 **Weighted F1-Score** | **92.41%** |

</div>

### 🏆 Per-Class Performance

<div align="center">

| Kelas Sentimen | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| 🔴 **Kritik Juri / Panitia** | 0.94 | 0.96 | 0.95 | 330 |
| 🔵 **Netral** | 0.91 | 0.91 | 0.91 | 180 |
| 🟢 **Pro Peserta** | 0.92 | 0.79 | 0.85 | 90 |

</div>

### 🔬 Visualisasi Evaluasi

<p align="center">
  <img src="hasil/confusion_matrix_indobertweet.png" alt="Confusion Matrix" width="500">
</p>
<p align="center"><i>Confusion Matrix — Hasil pengujian model pada data uji (test set)</i></p>

<details>
<summary>📈 <b>Klik untuk melihat visualisasi tambahan</b></summary>
<br>

<p align="center">
  <img src="hasil/01_distribusi_label_bar.png" alt="Distribusi Label" width="450">
  <img src="hasil/02_distribusi_label_pie.png" alt="Distribusi Pie" width="450">
</p>

<p align="center">
  <img src="hasil/hasil_metrik_indobertweet.png" alt="Metrik Model" width="450">
  <img src="hasil/prediksi_vs_label_aktual.png" alt="Prediksi vs Aktual" width="450">
</p>

</details>

<img src="hasil/separator.svg" width="100%">

## 📁 Struktur Direktori

```
Proyek_IndoBERTweet_LCC_Kalbar_6000/
│
├── 📂 dataset/                   # Dataset CSV & Excel (Raw → Preprocessed → Labeled)
│   ├── komentar_raw_6000.csv
│   ├── komentar_preprocessed_6000.csv
│   └── komentar_labeled_6000.csv
│
├── 📂 hasil/                     # Visualisasi chart, evaluasi, & aset grafis
│   ├── confusion_matrix_indobertweet.png
│   ├── banner_hero.svg
│   ├── classification_report_indobertweet.txt
│   └── ringkasan_eda_lengkap.xlsx
│
├── 📂 laporan/                   # Laporan PDF/Word & PowerPoint Presentasi
│   ├── Laporan Klasifikasi Sentimen (...).pdf
│   └── PPT_Klasifikasi_Sentimen (...).pptx
│
├── 📂 model/                     # Konfigurasi & bobot model IndoBERTweet
│   └── indobertweet_finetuned/
│       ├── config.json
│       ├── label_mapping.json
│       ├── tokenizer.json
│       └── model.safetensors     # ⚠️ ~442MB (gitignored)
│
├── 📂 source_code/               # Jupyter Notebook (EDA → Fine-Tuning)
│   └── IndoBERTweet_6000_YouTube_LCC_Kalbar_TERBARU_AMAN.ipynb
│
└── 📂 webapp/                    # Flask Web App Demo Interaktif
    ├── app.py                    # Server backend Flask
    ├── requirements.txt
    ├── static/css/style.css      # Dark mode glassmorphism UI
    ├── static/js/main.js         # Prediction logic & animations
    └── templates/index.html      # Halaman utama webapp
```

<img src="hasil/separator.svg" width="100%">

## ⚡ Panduan Instalasi & Menjalankan Web App

### 1️⃣ Prasyarat
Pastikan komputer Anda sudah terinstal **Python 3.8+** dan `pip`.

### 2️⃣ Kloning Repositori
```bash
git clone https://github.com/Renoslendra/IndoBERTweet-LCC-Kalbar-2026.git
cd IndoBERTweet-LCC-Kalbar-2026
```

### 3️⃣ Instal Dependensi
```bash
pip install -r webapp/requirements.txt
```

### 4️⃣ Letakkan File Bobot Model
> ⚠️ File `model.safetensors` (~442 MB) dikecualikan dari Git. Pastikan file tersebut berada di:
> `model/indobertweet_finetuned/model.safetensors`

### 5️⃣ Jalankan Aplikasi Web
```bash
cd webapp
python app.py
```

Buka browser dan akses: **[http://127.0.0.1:5000](http://127.0.0.1:5000)** 🚀

<img src="hasil/separator.svg" width="100%">

## 🎨 Fitur Web App

<table>
<tr>
<td width="50" align="center">💬</td>
<td><b>Interactive Single Input</b><br>Ketik komentar dan lihat hasil prediksi sentimen secara real-time</td>
</tr>
<tr>
<td align="center">📊</td>
<td><b>Confidence Level Chart</b><br>Distribusi probabilitas per kelas dalam grafik persentase interaktif</td>
</tr>
<tr>
<td align="center">🏆</td>
<td><b>Visual Performance Metrics</b><br>Classification report & akurasi model ditampilkan langsung di antarmuka</td>
</tr>
<tr>
<td align="center">📜</td>
<td><b>Prediction History</b><br>Riwayat prediksi selama sesi aktif untuk perbandingan cepat</td>
</tr>
<tr>
<td align="center">🌙</td>
<td><b>Dark Mode Glassmorphism</b><br>Tampilan premium dengan animasi scroll-reveal, particles, dan gradient effects</td>
</tr>
</table>

<img src="hasil/separator.svg" width="100%">

## 🛠️ Tech Stack

<div align="center">

| Komponen | Teknologi |
| :--- | :--- |
| 🧠 **Language Model** | [IndoBERTweet Base Uncased](https://huggingface.co/indobenchmark/indobertweet-base-uncased) |
| ⚙️ **Deep Learning** | PyTorch + Hugging Face Transformers |
| 🌐 **Web Backend** | Flask (Python) |
| 🎨 **Frontend** | HTML5 + CSS3 (Glassmorphism) + Vanilla JS |
| 📐 **Data Processing** | Pandas, NumPy, Scikit-learn |
| 🔤 **Typography** | Outfit · Inter · JetBrains Mono (Google Fonts) |

</div>

<img src="hasil/separator.svg" width="100%">

## 👨‍🎓 Informasi Akademik

<div align="center">

| Info | Detail |
| :--- | :--- |
| 🎓 **Mata Kuliah** | Penambangan Data (Data Mining) |
| 📅 **Semester** | 4 (Empat) |
| 📝 **Topik** | Klasifikasi Sentimen Multi-Kelas dengan Fine-tuning BERT |
| 📊 **Dataset** | 6.000 komentar asli YouTube |
| 🎯 **Model** | IndoBERTweet (Pretrained Indonesian Social Media BERT) |

</div>

<img src="hasil/footer_line.svg" width="100%">

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=14&pause=1000&color=94A3B8&center=true&vCenter=true&repeat=true&width=700&height=40&lines=Dikembangkan+dengan+penuh+dedikasi+untuk+kepentingan+akademik+%E2%9C%A8" alt="Footer">
</p>

<p align="center">
  <sub>Mata Kuliah Penambangan Data · Powered by IndoBERTweet · PyTorch · Flask</sub>
</p>
