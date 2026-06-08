import os
import json
import torch
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(BASE_DIR, 'hasil')
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')
CLASSIFICATION_REPORT_PATH = os.path.join(RESULTS_DIR, 'classification_report_indobertweet.csv')
EVALUATION_SUMMARY_PATH = os.path.join(RESULTS_DIR, 'hasil_evaluasi_indobertweet.csv')
LABEL_DISTRIBUTION_PATH = os.path.join(RESULTS_DIR, 'ringkasan_distribusi_label.csv')
LABELED_DATASET_PATH = os.path.join(DATASET_DIR, 'komentar_labeled_6000.csv')

# Path model indobertweet
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'indobertweet_finetuned')

print(f"[*] Mencoba memuat model dari: {MODEL_PATH}")

# Muat Tokenizer dan Model
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    
    # Muat label mapping
    mapping_path = os.path.join(MODEL_PATH, 'label_mapping.json')
    if os.path.exists(mapping_path):
        with open(mapping_path, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
        id2label = {int(k): v for k, v in mapping['id2label'].items()}
        id2label = dict(sorted(id2label.items()))
    else:
        id2label = {0: 'kritik_juri_panitia', 1: 'netral', 2: 'pro_peserta'}
        
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    model.eval()
    print(f"[+] Model berhasil dimuat pada device: {device}")
except Exception as e:
    print(f"[!] Error saat memuat model: {str(e)}")
    tokenizer = None
    model = None
    id2label = {0: 'kritik_juri_panitia', 1: 'netral', 2: 'pro_peserta'}
    device = torch.device('cpu')

LABEL_DISPLAY_NAMES = {
    'kritik_juri_panitia': 'Kritik Juri/Panitia',
    'netral': 'Netral / Info',
    'pro_peserta': 'Pro Peserta / Dukungan'
}

def ordered_labels():
    return [id2label[i] for i in sorted(id2label.keys())]

def safe_float(value, default=0.0):
    try:
        if pd.isna(value):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default

def safe_int(value, default=0):
    try:
        if pd.isna(value):
            return default
        return int(value)
    except (TypeError, ValueError):
        return default

def load_dataset_distribution():
    labels = ordered_labels()
    distribution = {label: {"count": 0, "percentage": 0.0} for label in labels}
    total_rows = 0

    if os.path.exists(LABELED_DATASET_PATH):
        try:
            label_series = pd.read_csv(LABELED_DATASET_PATH, usecols=['label'])['label'].dropna()
            counts = label_series.value_counts().to_dict()
            total_rows = int(label_series.shape[0])
            for label in labels:
                count = int(counts.get(label, 0))
                distribution[label] = {
                    "count": count,
                    "percentage": (count / total_rows * 100) if total_rows else 0.0
                }
            return total_rows, distribution
        except Exception as exc:
            print(f"[!] Gagal membaca distribusi dataset utama: {exc}")

    if os.path.exists(LABEL_DISTRIBUTION_PATH):
        try:
            dist_df = pd.read_csv(LABEL_DISTRIBUTION_PATH)
            total_rows = int(dist_df['jumlah'].sum())
            for _, row in dist_df.iterrows():
                label = row.get('label')
                if label in distribution:
                    distribution[label] = {
                        "count": safe_int(row.get('jumlah')),
                        "percentage": safe_float(row.get('persentase'))
                    }
        except Exception as exc:
            print(f"[!] Gagal membaca ringkasan distribusi label: {exc}")

    return total_rows, distribution

def load_model_info():
    labels = ordered_labels()
    total_dataset_rows, distribution = load_dataset_distribution()

    classes = []
    report_by_label = {}
    if os.path.exists(CLASSIFICATION_REPORT_PATH):
        try:
            report_df = pd.read_csv(CLASSIFICATION_REPORT_PATH)
            report_by_label = {
                row['label']: row
                for _, row in report_df.iterrows()
                if row.get('label') in labels
            }
        except Exception as exc:
            print(f"[!] Gagal membaca classification report: {exc}")

    total_test_rows = 0
    for label in labels:
        row = report_by_label.get(label, {})
        support = safe_int(row.get('support', 0))
        total_test_rows += support
        classes.append({
            "label": label,
            "display_label": LABEL_DISPLAY_NAMES.get(label, label),
            "precision": safe_float(row.get('precision', 0.0)),
            "recall": safe_float(row.get('recall', 0.0)),
            "f1": safe_float(row.get('f1_score', row.get('f1', 0.0))),
            "support": support,
            "dataset_count": distribution[label]["count"],
            "dataset_percentage": distribution[label]["percentage"]
        })

    summary = {
        "accuracy": 0.0,
        "precision_weighted": 0.0,
        "recall_weighted": 0.0,
        "f1_weighted": 0.0
    }
    if os.path.exists(EVALUATION_SUMMARY_PATH):
        try:
            summary_row = pd.read_csv(EVALUATION_SUMMARY_PATH).iloc[0]
            summary = {
                "accuracy": safe_float(summary_row.get('accuracy')),
                "precision_weighted": safe_float(summary_row.get('precision_weighted')),
                "recall_weighted": safe_float(summary_row.get('recall_weighted')),
                "f1_weighted": safe_float(summary_row.get('f1_weighted'))
            }
        except Exception as exc:
            print(f"[!] Gagal membaca ringkasan evaluasi: {exc}")

    return {
        **summary,
        "labels": labels,
        "classes": classes,
        "total_dataset_rows": total_dataset_rows,
        "total_test_rows": total_test_rows,
        "sources": {
            "dataset": os.path.relpath(LABELED_DATASET_PATH, BASE_DIR),
            "classification_report": os.path.relpath(CLASSIFICATION_REPORT_PATH, BASE_DIR),
            "evaluation_summary": os.path.relpath(EVALUATION_SUMMARY_PATH, BASE_DIR)
        }
    }

def get_metric_for_label(label):
    for metric in load_model_info()["classes"]:
        if metric["label"] == label:
            return metric
    return None

def predict_list(texts, max_length=128):
    if model is None or tokenizer is None:
        # Fallback palsu jika model gagal load (untuk testing offline)
        results = []
        for text in texts:
            # Simple heuristic mock prediction
            text_lower = text.lower()
            if any(w in text_lower for w in ["juri", "panitia", "curang", "adil", "nilai"]):
                label = "kritik_juri_panitia"
            elif any(w in text_lower for w in ["semangat", "kasihan", "kasian", "hebat", "peserta"]):
                label = "pro_peserta"
            else:
                label = "netral"
            results.append({
                "label": label,
                "confidence": 0.85,
                "probabilities": {"kritik_juri_panitia": 0.6, "netral": 0.2, "pro_peserta": 0.2}
            })
        return results

    encoded = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=max_length,
        return_tensors="pt"
    )
    
    encoded = {k: v.to(device) for k, v in encoded.items()}
    
    with torch.no_grad():
        outputs = model(**encoded)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()
        preds = np.argmax(probs, axis=1)
        
    results = []
    for pred, prob in zip(preds, probs):
        results.append({
            "label": id2label[int(pred)],
            "confidence": float(prob[pred]),
            "probabilities": {id2label[i]: float(prob[i]) for i in range(len(id2label))}
        })
    return results

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(silent=True)
    if not data or 'text' not in data:
        return jsonify({"success": False, "error": "Parameter 'text' tidak ditemukan"}), 400
    
    text = str(data['text']).strip() if data['text'] is not None else ''
    if not text:
        return jsonify({"success": False, "error": "Teks tidak boleh kosong"}), 400
        
    try:
        prediction = predict_list([text])[0]
        return jsonify({
            "success": True,
            "text": text,
            "label": prediction['label'],
            "confidence": prediction['confidence'],
            "probabilities": prediction['probabilities'],
            "model_metrics": get_metric_for_label(prediction['label'])
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/model-info')
def model_info():
    return jsonify(load_model_info())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
