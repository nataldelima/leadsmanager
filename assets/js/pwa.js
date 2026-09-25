/* =========================================================
   Lead Manager • PWA bootstrap
   ========================================================= */
(function () {
    'use strict';

    if (!('serviceWorker' in navigator)) {
        console.warn('[PWA] Service Worker não suportado');
        return;
    }

    // ---------- Registro ----------
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js', { scope: './' })
            .then((reg) => {
                console.log('[PWA] SW registrado:', reg.scope);

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateBanner();
                        }
                    });
                });
            })
            .catch((err) => console.error('[PWA] Falha ao registrar SW:', err));
    });

    // ---------- Prompt de instalação ----------
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App instalado');
        deferredPrompt = null;
        hideInstallButton();
        if (typeof window.toast === 'function') {
            window.toast('App instalado com sucesso!');
        }
    });

    function showInstallButton() {
        if (document.getElementById('pwaInstallBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'pwaInstallBtn';
        btn.type = 'button';
        btn.className = 'btn btn-outline pwa-install-btn';
        btn.innerHTML = '📲 Instalar app';

        btn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] Escolha:', outcome);
            deferredPrompt = null;
            hideInstallButton();
        });

        // Prioridade: sidebar-footer → view-leads header → body
        const sidebar = document.querySelector('.sidebar-footer');
        if (sidebar) {
            sidebar.appendChild(btn);
            return;
        }
        const main = document.querySelector('.main');
        if (main) {
            main.prepend(btn);
            return;
        }
        document.body.appendChild(btn);
    }

    function hideInstallButton() {
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.remove();
    }

    // ---------- iOS: instruções manuais ----------
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;

    if (isIos && !isStandalone) {
        if (!localStorage.getItem('pwa_ios_hint_shown')) {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'pwa-ios-hint';
                div.innerHTML = '📲 <strong>Instale este app:</strong> toque em <em>Compartilhar</em> → <em>Adicionar à Tela de Início</em>';
                document.body.appendChild(div);
                localStorage.setItem('pwa_ios_hint_shown', '1');
                setTimeout(() => div.remove(), 8000);
            }, 3000);
        }
    }

    // ---------- Banner de atualização ----------
    function showUpdateBanner() {
        if (document.getElementById('pwaUpdateBanner')) return;

        const banner = document.createElement('div');
        banner.id = 'pwaUpdateBanner';
        banner.className = 'pwa-update-banner';
        banner.innerHTML =
            '<span>🔄 Nova versão disponível.</span>' +
            '<button class="btn btn-sm btn-primary" id="pwaReload">Atualizar</button>' +
            '<button class="btn btn-sm btn-outline" id="pwaDismiss">Depois</button>';

        document.body.appendChild(banner);

        banner.querySelector('#pwaReload').addEventListener('click', () => {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg && reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                window.location.reload();
            });
        });
        banner.querySelector('#pwaDismiss').addEventListener('click', () => banner.remove());
    }
})();