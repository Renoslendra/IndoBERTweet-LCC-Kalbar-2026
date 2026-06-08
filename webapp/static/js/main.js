document.addEventListener('DOMContentLoaded', () => {
    const commentInput = document.getElementById('comment-input');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnClear = document.getElementById('btn-clear');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const exampleButtons = document.querySelectorAll('.btn-example');
    const charCounter = document.getElementById('char-counter');

    const resultCard = document.getElementById('prediction-result-card');
    const resultDetails = document.getElementById('result-details');
    const resultLabel = document.getElementById('result-label');
    const resultConfidence = document.getElementById('result-confidence');
    const probKritikVal = document.getElementById('prob-kritik-val');
    const probKritikBar = document.getElementById('prob-kritik-bar');
    const probNetralVal = document.getElementById('prob-netral-val');
    const probNetralBar = document.getElementById('prob-netral-bar');
    const probProVal = document.getElementById('prob-pro-val');
    const probProBar = document.getElementById('prob-pro-bar');

    const predictionMetricCard = document.getElementById('prediction-metric-card');
    const predMetricPrecision = document.getElementById('pred-metric-precision');
    const predMetricRecall = document.getElementById('pred-metric-recall');
    const predMetricF1 = document.getElementById('pred-metric-f1');
    const predMetricDataset = document.getElementById('pred-metric-dataset');
    const predMetricNote = document.getElementById('pred-metric-note');

    const metricsIntro = document.getElementById('metrics-intro');
    const modelAccuracy = document.getElementById('model-accuracy');
    const modelF1Weighted = document.getElementById('model-f1-weighted');
    const modelDatasetTotal = document.getElementById('model-dataset-total');
    const modelTestTotal = document.getElementById('model-test-total');
    const heroDataset = document.getElementById('hero-dataset');
    const heroAccuracy = document.getElementById('hero-accuracy');
    const metricsRows = document.getElementById('metrics-rows');
    const metricsSourceNote = document.getElementById('metrics-source-note');

    const historyTbody = document.getElementById('history-tbody');
    const historyEmptyRow = document.getElementById('history-empty-row');
    const historyCount = document.getElementById('history-count');

    let predictionHistory = [];
    let modelMetricsByLabel = {};
    let revealObserver = null;
    let updateNavigationState = null;
    let setActiveNavSection = null;
    let updateScrollTopState = null;

    initScrollReveal();
    initNavbar();
    initSmoothScroll();
    initScrollToTop();
    initParticles();
    updateCharCounter();
    loadModelInfo();

    async function loadModelInfo() {
        try {
            const response = await fetch('/model-info');
            const info = await response.json();
            renderModelInfo(info);
        } catch (error) {
            console.error('Model info error:', error);
            metricsIntro.textContent = 'Metrik model belum bisa dimuat dari server.';
            metricsSourceNote.textContent = 'Periksa file evaluasi di folder hasil dan refresh halaman.';
        }
    }

    function renderModelInfo(info) {
        modelMetricsByLabel = {};
        (info.classes || []).forEach((metric) => {
            modelMetricsByLabel[metric.label] = metric;
        });

        const accuracy = toPercentNumber(info.accuracy);
        const f1Weighted = toPercentNumber(info.f1_weighted);
        const datasetRows = safeNumber(info.total_dataset_rows);
        const testRows = safeNumber(info.total_test_rows);

        animateCounter(modelAccuracy, accuracy, { decimals: 2, suffix: '%' });
        animateCounter(modelF1Weighted, f1Weighted, { decimals: 2, suffix: '%' });
        animateCounter(modelDatasetTotal, datasetRows, { decimals: 0 });
        animateCounter(modelTestTotal, testRows, { decimals: 0 });

        if (heroDataset) {
            animateCounter(heroDataset, datasetRows || 6000, { decimals: 0 });
        }
        if (heroAccuracy) {
            animateCounter(heroAccuracy, accuracy || 93.28, { decimals: 2, suffix: '%' });
        }

        metricsIntro.innerHTML = `Metrik tersinkron dari <strong>${escapeHTML(info.sources?.classification_report || 'hasil evaluasi')}</strong> dan dataset berlabel.`;
        metricsSourceNote.textContent = `Distribusi dataset dibaca dari ${info.sources?.dataset || 'dataset lokal'}. Nilai Precision, Recall, dan F1 berasal dari data evaluasi model.`;

        metricsRows.innerHTML = '';
        (info.classes || []).forEach((metric, index) => {
            const row = document.createElement('div');
            row.className = `metric-row ${labelColorClass(metric.label)} reveal fade-up`;
            row.style.transitionDelay = `${index * 0.08}s`;
            row.innerHTML = `
                <span class="lbl">${escapeHTML(metric.display_label || formatLabel(metric.label, true))}</span>
                <span data-label="Dataset">${formatNumber(metric.dataset_count)} (${formatDecimal(metric.dataset_percentage, 2)}%)</span>
                <span data-label="Evaluasi">${formatNumber(metric.support)}</span>
                <span data-label="Precision">${toPercent(metric.precision, 2)}%</span>
                <span data-label="Recall">${toPercent(metric.recall, 2)}%</span>
                <span data-label="F1-Score">${toPercent(metric.f1, 2)}%</span>
            `;
            metricsRows.appendChild(row);
            observeReveal(row);
        });
    }

    async function analyzeSentiment(text) {
        if (!text || !text.trim()) {
            alert('Komentar tidak boleh kosong.');
            commentInput.focus();
            return;
        }

        const spinner = btnAnalyze.querySelector('.spinner-inline');
        const btnText = btnAnalyze.querySelector('.btn-text');
        spinner.style.display = 'block';
        btnText.textContent = 'Menganalisis...';
        btnAnalyze.disabled = true;
        resultCard.classList.add('is-loading');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (result.success) {
                displaySingleResult(result);
                addToHistory(result);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Gagal menghubungi server untuk klasifikasi.');
        } finally {
            spinner.style.display = 'none';
            btnText.textContent = 'Analisis Sentimen';
            btnAnalyze.disabled = false;
            resultCard.classList.remove('is-loading');
        }
    }

    function displaySingleResult(data) {
        resultLabel.className = 'result-badge';

        const labelText = formatLabel(data.label, true);
        resultLabel.textContent = labelText;
        if (data.label) {
            resultLabel.classList.add(data.label);
        }

        resultConfidence.textContent = `${toPercent(data.confidence, 2)}%`;

        const probs = data.probabilities || {};
        resetProbabilityBars();
        void probKritikBar.offsetWidth;
        updateProbability(probKritikVal, probKritikBar, probs.kritik_juri_panitia);
        updateProbability(probNetralVal, probNetralBar, probs.netral);
        updateProbability(probProVal, probProBar, probs.pro_peserta);

        displayPredictionMetric(data.label, data.model_metrics);
        resultDetails.hidden = false;
        resultCard.classList.remove('has-result');
        void resultCard.offsetWidth;
        resultCard.classList.add('has-result');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function displayPredictionMetric(label, metricFromResponse) {
        const metric = metricFromResponse || modelMetricsByLabel[label];
        if (!metric) {
            predictionMetricCard.style.display = 'none';
            return;
        }

        predMetricPrecision.textContent = `${toPercent(metric.precision, 2)}%`;
        predMetricRecall.textContent = `${toPercent(metric.recall, 2)}%`;
        predMetricF1.textContent = `${toPercent(metric.f1, 2)}%`;
        predMetricDataset.textContent = `${formatNumber(metric.dataset_count)} (${formatDecimal(metric.dataset_percentage, 2)}%)`;
        predMetricNote.textContent = `${metric.display_label || formatLabel(label, true)} memiliki ${formatNumber(metric.support)} sampel evaluasi pada test set.`;
        predictionMetricCard.style.display = 'block';
    }

    function addToHistory(data) {
        if (historyEmptyRow) {
            historyEmptyRow.style.display = 'none';
        }

        const index = predictionHistory.length + 1;
        predictionHistory.push(data);

        const row = document.createElement('tr');
        row.className = 'history-new';
        row.innerHTML = `
            <td>${index}</td>
            <td style="word-break: break-word;">${escapeHTML(data.text)}</td>
            <td>${labelBadge(data.label, 4, 8, '0.75rem')}</td>
            <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${toPercent(data.confidence, 2)}%</td>
        `;

        if (historyTbody.firstChild && historyTbody.firstChild !== historyEmptyRow) {
            historyTbody.insertBefore(row, historyTbody.firstChild);
        } else {
            historyTbody.appendChild(row);
        }

        updateHistoryCount();
    }

    function clearHistory() {
        predictionHistory = [];
        historyTbody.innerHTML = '';
        if (historyEmptyRow) {
            historyEmptyRow.style.display = '';
            historyTbody.appendChild(historyEmptyRow);
        }
        updateHistoryCount();
    }

    function resetResult() {
        resultDetails.hidden = true;
        resultCard.classList.remove('has-result', 'is-loading');
        predictionMetricCard.style.display = 'none';
        resetProbabilityBars();
    }

    function resetProbabilityBars() {
        updateProbability(probKritikVal, probKritikBar, 0);
        updateProbability(probNetralVal, probNetralBar, 0);
        updateProbability(probProVal, probProBar, 0);
    }

    function updateProbability(valueElement, barElement, probability) {
        const percentage = toPercent(probability, 1);
        valueElement.textContent = `${percentage}%`;
        barElement.style.width = `${Math.max(0, Math.min(Number(percentage), 100))}%`;
    }

    function updateCharCounter() {
        if (!charCounter || !commentInput) return;
        const length = commentInput.value.length;
        charCounter.textContent = `${formatNumber(length)} karakter`;
    }

    function updateHistoryCount() {
        if (!historyCount) return;
        const count = predictionHistory.length;
        historyCount.textContent = `${formatNumber(count)} prediksi`;
    }

    function initScrollReveal() {
        const revealItems = document.querySelectorAll('.reveal');

        if (!('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('revealed'));
            return;
        }

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealItems.forEach((item) => observeReveal(item));
    }

    function observeReveal(element) {
        if (!element) return;
        if (revealObserver) {
            revealObserver.observe(element);
        } else {
            element.classList.add('revealed');
        }
    }

    function initNavbar() {
        const nav = document.getElementById('site-nav');
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = Array.from(navLinks)
            .map((link) => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        const setActiveNav = (activeId) => {
            navLinks.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
            });
        };

        const updateNav = () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            nav.classList.toggle('is-scrolled', scrollY > 50);

            let activeId = '';
            sections.forEach((section) => {
                const top = section.getBoundingClientRect().top;
                if (top <= 120) {
                    activeId = section.id;
                }
            });

            setActiveNav(activeId);
        };

        updateNavigationState = updateNav;
        setActiveNavSection = setActiveNav;
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
        window.addEventListener('scrollend', updateNav, { passive: true });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetSelector = link.getAttribute('href');
                const target = document.querySelector(targetSelector);
                if (!target) return;
                event.preventDefault();
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', targetSelector === '#hero' ? window.location.pathname : targetSelector);
                }
                if (setActiveNavSection) {
                    setActiveNavSection(target.id === 'hero' ? '' : target.id);
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.setTimeout(() => {
                    updateNavigationState?.();
                    updateScrollTopState?.();
                }, 350);
                window.setTimeout(() => {
                    updateNavigationState?.();
                    updateScrollTopState?.();
                }, 900);
            });
        });
    }

    function initScrollToTop() {
        const scrollTopButton = document.getElementById('scroll-top');
        if (!scrollTopButton) return;

        const updateButton = () => {
            scrollTopButton.classList.toggle('is-visible', window.scrollY > 300);
        };

        updateScrollTopState = updateButton;
        updateButton();
        window.addEventListener('scroll', updateButton, { passive: true });
        window.addEventListener('scrollend', updateButton, { passive: true });
        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
            }
            setActiveNavSection?.('');
            window.setTimeout(() => {
                updateNavigationState?.();
                updateButton();
            }, 350);
            window.setTimeout(() => {
                updateNavigationState?.();
                updateButton();
            }, 900);
        });
    }

    function initParticles() {
        const canvas = document.getElementById('particles');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        let width = 0;
        let height = 0;
        let animationFrame = null;
        let particleCount = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            particleCount = Math.min(50, Math.max(24, Math.floor((width * height) / 28000)));
            while (particles.length < particleCount) {
                particles.push(createParticle(true));
            }
            particles.length = particleCount;
        };

        const createParticle = (randomY = false) => ({
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + Math.random() * 80,
            radius: 0.7 + Math.random() * 1.8,
            speed: 0.18 + Math.random() * 0.45,
            drift: -0.18 + Math.random() * 0.36,
            alpha: 0.16 + Math.random() * 0.32,
            hue: Math.random() > 0.5 ? 238 : 190
        });

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((particle, index) => {
                particle.y -= particle.speed;
                particle.x += particle.drift;

                if (particle.y < -20 || particle.x < -20 || particle.x > width + 20) {
                    particles[index] = createParticle(false);
                    return;
                }

                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.radius * 5
                );
                gradient.addColorStop(0, `hsla(${particle.hue}, 90%, 74%, ${particle.alpha})`);
                gradient.addColorStop(1, `hsla(${particle.hue}, 90%, 74%, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrame = window.requestAnimationFrame(draw);
        };

        const handleVisibility = () => {
            if (document.hidden && animationFrame) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = null;
            } else if (!document.hidden && !animationFrame) {
                draw();
            }
        };

        resize();
        draw();
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', handleVisibility);
    }

    function animateCounter(element, target, options = {}) {
        if (!element) return;

        const number = Number(target);
        if (!Number.isFinite(number)) {
            element.textContent = options.suffix ? `0${options.suffix}` : '0';
            return;
        }

        const decimals = Number.isInteger(options.decimals) ? options.decimals : 0;
        const suffix = options.suffix || '';
        const duration = options.duration || 900;
        const start = 0;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            const current = start + (number - start) * eased;
            element.textContent = `${formatNumberForCounter(current, decimals)}${suffix}`;

            if (elapsed < 1) {
                window.requestAnimationFrame(tick);
            }
        };

        window.requestAnimationFrame(tick);
    }

    function formatNumberForCounter(value, decimals) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    function labelBadge(label, paddingY, paddingX, fontSize) {
        const labelClass = label || 'unknown';
        return `<span class="result-badge ${escapeAttribute(labelClass)}" style="padding: ${paddingY}px ${paddingX}px; font-size: ${fontSize};">${escapeHTML(formatLabel(label))}</span>`;
    }

    function formatLabel(label, detailed = false) {
        if (label === 'kritik_juri_panitia') return detailed ? 'Kritik Juri/Panitia' : 'Kritik';
        if (label === 'netral') return detailed ? 'Netral / Info' : 'Netral';
        if (label === 'pro_peserta') return detailed ? 'Pro Peserta / Dukungan' : 'Pro Peserta';
        return label || 'Tidak Diketahui';
    }

    function labelColorClass(label) {
        if (label === 'kritik_juri_panitia') return 'font-red';
        if (label === 'netral') return 'font-blue';
        if (label === 'pro_peserta') return 'font-green';
        return '';
    }

    function toPercent(value, decimals) {
        return toPercentNumber(value).toFixed(decimals);
    }

    function toPercentNumber(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return 0;
        return number * 100;
    }

    function formatDecimal(value, decimals) {
        const number = Number(value);
        if (!Number.isFinite(number)) return (0).toFixed(decimals);
        return number.toFixed(decimals);
    }

    function formatNumber(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return '0';
        return new Intl.NumberFormat('id-ID').format(number);
    }

    function safeNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
    }

    btnAnalyze.addEventListener('click', () => {
        analyzeSentiment(commentInput.value);
    });

    commentInput.addEventListener('input', updateCharCounter);

    commentInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            btnAnalyze.click();
        }
    });

    btnClear.addEventListener('click', () => {
        commentInput.value = '';
        updateCharCounter();
        resetResult();
        commentInput.focus();
    });

    if (btnClearHistory) {
        btnClearHistory.addEventListener('click', clearHistory);
    }

    exampleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const text = button.getAttribute('data-text');
            commentInput.value = text;
            updateCharCounter();
            analyzeSentiment(text);
        });
    });
});
