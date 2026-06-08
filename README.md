# 🇮🇩 Klasifikasi Sentimen Komentar YouTube LCC 4 Pilar Kalbar - IndoBERTweet

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg)](https://pytorch.org/)
[![Transformers](https://img.shields.io/badge/Transformers-HuggingFace-orange.svg)](https://huggingface.co/)
[![Flask](https://img.shields.io/badge/Flask-Web%20App-lightgrey.svg)](https://flask.palletsprojects.com/)

Proyek Analisis Sentimen untuk mengklasifikasikan komentar YouTube mengenai **Kontroversi LCC (Lomba Cerdas Cermat) 4 Pilar Kalimantan Barat** menggunakan metode *Fine-Tuning* pada model **IndoBERTweet**. Proyek ini dikembangkan sebagai bagian dari tugas praktis Mata Kuliah **Penambangan Data** (Semester 4).

---

## 📌 Deskripsi Proyek
Lomba Cerdas Cermat (LCC) 4 Pilar tingkat Provinsi di Kalimantan Barat menimbulkan kontroversi yang memicu perdebatan hangat di kolom komentar YouTube. Proyek ini melakukan analisis sentimen terhadap **6.000 komentar** untuk mengekstrak opini publik dan mengklasifikasikannya ke dalam 3 kelas sentimen utama:
1. **`kritik_juri_panitia`**: Komentar berisi keluhan, kritik, atau tuduhan ketidakadilan juri dan panitia.
2. **`netral`**: Komentar objektif, netral, saran damai, atau tidak memihak.
3. **`pro_peserta`**: Komentar berisi dukungan moral dan pembelaan kepada para peserta/siswa yang berlomba.

Menggunakan arsitektur model **IndoBERTweet** (model bahasa BERT yang di-pretrain khusus pada media sosial berbahasa Indonesia), sistem mampu memahami slang, singkatan, serta gaya bahasa informal khas warganet Indonesia dengan sangat baik.

---

## 📊 Hasil Evaluasi Model
Model IndoBERTweet berhasil dievaluasi menggunakan *split* data uji independen dan memperoleh metrik performa tinggi:

| Metrik | Nilai |
| :--- | :---: |
| **Akurasi Keseluruhan** | **93.28%** |
| **Macro F1-Score** | **90.31%** |
| **Weighted F1-Score** | **92.41%** |

### Per-Class Performance
| Kelas Sentimen | Precision | Recall | F1-Score |
| :--- | :---: | :---: | :---: |
| 🔴 **Kritik Juri / Panitia** | 0.94 | 0.96 | 0.95 |
| 🔵 **Netral** | 0.91 | 0.91 | 0.91 |
| 🟢 **Pro Peserta** | 0.92 | 0.79 | 0.85 |

### Visualisasi Evaluasi
Berikut adalah visualisasi matriks kebingungan (confusion matrix) dari hasil pengujian model:
![Confusion Matrix](hasil/confusion_matrix_indobertweet.png)

---

## 📁 Struktur Direktori
```directory
Proyek_IndoBERTweet_LCC_Kalbar_6000/
│
├── dataset/                  # Dataset CSV & Excel (Raw, Preprocessed, Labeled)
│   ├── komentar_raw_6000.csv
│   ├── komentar_preprocessed_6000.csv
│   └── komentar_labeled_6000.csv
│
├── hasil/                    # Hasil visualisasi chart & laporan evaluasi
│   ├── confusion_matrix_indobertweet.png
│   ├── 01_distribusi_label_bar.png
│   ├── classification_report_indobertweet.txt
│   └── ringkasan_eda_lengkap.xlsx
│
├── laporan/                  # Laporan tertulis (PDF/Word) & PowerPoint Presentasi
│   ├── Laporan Klasifikasi Sentimen 6000 Komentar YouTube IndoBERTweet.pdf
│   └── PPT_Klasifikasi_Sentimen_6000_IndoBERTweet.pptx
│
├── model/                    # Folder konfigurasi model IndoBERTweet
│   └── indobertweet_finetuned/
│       ├── config.json
│       ├── label_mapping.json
│       ├── tokenizer.json
│       ├── tokenizer_config.json
│       └── model.safetensors  # (Diabaikan git, unduh manual jika belum ada)
│
├── source_code/              # Jupyter Notebook langkah pelatihan model (EDA -> Fine-Tuning)
│   └── IndoBERTweet_6000_YouTube_LCC_Kalbar_TERBARU_AMAN.ipynb
│
└── webapp/                   # Flask Web Application untuk Demo Interaktif
    ├── app.py                # Server backend Flask
    ├── requirements.txt      # Dependensi pustaka python
    ├── static/               # File CSS, JS, dan Aset UI
    └── templates/            # Tampilan HTML webapp (index.html)
```

---

## ⚡ Panduan Instalasi dan Menjalankan Web App

### 1. Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstal **Python 3.8** ke atas dan pip.

### 2. Kloning Repositori
```bash
git clone https://github.com/Renoslendra/IndoBERTweet-LCC-Kalbar-2026.git
cd IndoBERTweet-LCC-Kalbar-2026
```

### 3. Instal Dependensi
Pasang semua library Python yang dibutuhkan melalui berkas `requirements.txt` di dalam folder `webapp`:
```bash
pip install -r webapp/requirements.txt
```

### 4. Letakkan File Bobot Model (`model.safetensors`)
Karena file model weights berukuran sekitar 442 MB, file ini dikecualikan dari repositori Git demi efisiensi. Pastikan Anda menaruh file `model.safetensors` ke dalam direktori berikut sebelum menjalankan server:
`model/indobertweet_finetuned/model.safetensors`

### 5. Jalankan Aplikasi Web Flask
Jalankan perintah berikut pada terminal di dalam folder proyek:
```bash
cd webapp
python app.py
```
Setelah server aktif, buka peramban (browser) Anda dan akses alamat:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🎨 Fitur Web App
* **Interactive Single Input**: Pengguna dapat mengetik komentar baru secara langsung untuk melihat hasil prediksi sentimen.
* **Confidence Level Chart**: Menampilkan tingkat kepercayaan model (probabilitas) dalam bentuk grafik persentase interaktif.
* **Visual Performance Metrics**: Menampilkan laporan klasifikasi per kelas dan akurasi model dalam antarmuka web.
* **Prediction History**: Menyimpan riwayat pencarian/prediksi selama sesi aktif berjalan untuk perbandingan cepat.
* **Dark Mode & Glassmorphism UI**: Tampilan visual premium, responsif, dan ramah di mata.

---

## 🛠️ Pustaka & Teknologi Utama
* **Language Model**: [IndoBERTweet Base Uncased](https://huggingface.co/indobenchmark/indobertweet-base-uncased) (IndoBenchmark)
* **Framework DL**: PyTorch & Hugging Face Transformers
* **Web App Backend**: Flask (Python)
* **Frontend Design**: Vanilla HTML5, CSS3 (Glassmorphism & animations), Vanilla JS (Chart, counters & scroll effects)
* **Data Processing**: Pandas, NumPy, Scikit-learn

---

## 👨‍🎓 Penulis & Informasi Kuliah
* **Mata Kuliah**: Penambangan Data (Data Mining)
* **Semester**: 4 (Empat)
* **Topik**: Klasifikasi Sentimen Multi-Kelas dengan Pretrained Language Model (Fine-tuning BERT)
* **Dataset**: 6.000 data komentar asli YouTube

---
*Dikembangkan dengan penuh dedikasi untuk kepentingan akademik.*
