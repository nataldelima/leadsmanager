/* =========================================================
   Leads Manager • Firebase Service
   Encapsula Auth + Firestore. Expõe tudo em window.fb
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    browserLocalPersistence,
    getAuth, GoogleAuthProvider,
    onAuthStateChanged, setPersistence,
    signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    increment,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ⚠️ COLE AQUI o firebaseConfig que você copiou do Console */
const firebaseConfig = {
    apiKey: "AIzaSyC3SLUmZFjqoa16QbFjugUhlOgUFsSIdnc",
    authDomain: "leads-manager-nl.firebaseapp.com",
    projectId: "leads-manager-nl",
    storageBucket: "leads-manager-nl.firebasestorage.app",
    messagingSenderId: "408384260371",
    appId: "1:408384260371:web:af73242b27058881cd72e6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

setPersistence(auth, browserLocalPersistence).catch(console.error);

/* ---------- Helpers ---------- */
const requireUser = () => {
    if (!auth.currentUser) throw new Error('Não autenticado');
    return auth.currentUser.uid;
};
const userCol = (name) => collection(db, 'users', requireUser(), name);
const userDoc = (col, id) => doc(db, 'users', requireUser(), col, id);

/* =========================================================
   LEADS
   ========================================================= */
async function listLeads() {
    const snap = await getDocs(userCol('leads'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addLead(lead) {
    const { id, ...data } = lead;
    const ref = await addDoc(userCol('leads'), {
        ...data,
        createdAt: serverTimestamp()
    });
    return { ...data, id: ref.id };
}

async function bulkAddLeads(leads) {
    // Firestore batch aceita até 500 ops. Margem segura: 450.
    for (let i = 0; i < leads.length; i += 450) {
        const batch = writeBatch(db);
        leads.slice(i, i + 450).forEach(l => {
            const { id, ...data } = l;
            batch.set(doc(userCol('leads')), {
                ...data,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    }
}

async function updateLead(id, patch) {
    const { id: _ignore, ...data } = patch;
    await updateDoc(userDoc('leads', id), data);
}

async function deleteLeads(ids) {
    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(userDoc('leads', id)));
    await batch.commit();
}

/* =========================================================
   TEMPLATES
   ========================================================= */
async function listTemplates() {
    const snap = await getDocs(userCol('templates'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addTemplate(t) {
    const { id, ...data } = t;
    const ref = await addDoc(userCol('templates'), data);
    return { ...data, id: ref.id };
}

async function updateTemplate(id, patch) {
    const { id: _ignore, ...data } = patch;
    await updateDoc(userDoc('templates', id), data);
}

async function deleteTemplate(id) {
    await deleteDoc(userDoc('templates', id));
}

/* =========================================================
   STATUSES
   ========================================================= */
async function listStatuses() {
    const snap = await getDocs(userCol('statuses'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addStatus(s) {
    const { id, ...data } = s;
    const ref = await addDoc(userCol('statuses'), data);
    return { ...data, id: ref.id };
}

async function updateStatus(id, patch) {
    const { id: _ignore, ...data } = patch;
    await updateDoc(userDoc('statuses', id), data);
}

async function deleteStatus(id) {
    await deleteDoc(userDoc('statuses', id));
}

/* =========================================================
   SEED — primeira vez que o usuário loga
   ========================================================= */
const DEFAULT_STATUSES = [
    { key: 'novo', label: 'Novo', order: 1 },
    { key: 'abordagem', label: 'Abordagem', order: 2 },
    { key: 'follow1', label: 'Follow 1', order: 3 },
    { key: 'follow2', label: 'Follow 2', order: 4 },
    { key: 'backlog', label: 'Backlog', order: 5 },
    { key: 'interessado', label: 'Interessado', order: 6 },
    { key: 'proposta', label: 'Proposta enviada', order: 7 },
    { key: 'negociacao', label: 'Em negociação', order: 8 },
    { key: 'convertido', label: 'Convertido', order: 9, isFinal: true },
    { key: 'descartado', label: 'Descartado', order: 10, isFinal: true }
];

async function ensureSeed(defaultTemplates) {
    const tSnap = await getDocs(userCol('templates'));
    if (tSnap.empty && Array.isArray(defaultTemplates)) {
        for (const t of defaultTemplates) {
            const { id, ...data } = t;
            await addDoc(userCol('templates'), data);
        }
    }
    const sSnap = await getDocs(userCol('statuses'));
    if (sSnap.empty) {
        for (const s of DEFAULT_STATUSES) {
            await addDoc(userCol('statuses'), s);
        }
    }
}

/* =========================================================
   AUTH
   ========================================================= */
async function loginGoogle() {
    const res = await signInWithPopup(auth, provider);
    return {
        uid: res.user.uid,
        email: res.user.email,
        name: res.user.displayName || res.user.email,
        picture: res.user.photoURL || ''
    };
}

const logout = () => signOut(auth);

/* =========================================================
   COUNTERS (limite diário de envios)
   ========================================================= */
const todayKey = () => new Date().toISOString().slice(0, 10);

async function getTodayCounter() {
    const ref = doc(db, 'users', requireUser(), 'counters', todayKey());
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().count || 0) : 0;
}

async function incrementDailyCounter() {
    const ref = doc(db, 'users', requireUser(), 'counters', todayKey());
    await setDoc(ref, {
        count: increment(1),
        updatedAt: serverTimestamp()
    }, { merge: true });
    return await getTodayCounter();
}

/* =========================================================
SETTINGS (configurações do usuário)
========================================================= */
async function getSettings() {
    const ref = doc(db, 'users', requireUser(), 'settings', 'app');
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

async function saveSettings(data) {
    const ref = doc(db, 'users', requireUser(), 'settings', 'app');
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/* =========================================================
   INTERACTIONS (histórico de interações)
   ========================================================= */
async function addInteraction(data) {
    const ref = await addDoc(userCol('interactions'), {
        ...data,
        createdAt: serverTimestamp()
    });
    return { ...data, id: ref.id };
}

async function listInteractionsByLead(leadId) {
    // Filtro simples (sem orderBy para não precisar de índice composto)
    const q = query(userCol('interactions'), where('leadId', '==', leadId));
    const snap = await getDocs(q);
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function listInteractionsByPeriod(startIso, endIso) {
    // Range em um único campo (timestamp) → sem índice composto
    const q = query(
        userCol('interactions'),
        where('timestamp', '>=', startIso),
        where('timestamp', '<=', endIso)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* =========================================================
   EXPOSTO GLOBALMENTE
   ========================================================= */
window.fb = {
    auth, db,
    loginGoogle, logout,
    onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
    listLeads, addLead, bulkAddLeads, updateLead, deleteLeads,
    listTemplates, addTemplate, updateTemplate, deleteTemplate,
    listStatuses, addStatus, updateStatus, deleteStatus,
    ensureSeed, getTodayCounter, incrementDailyCounter,
    getSettings, saveSettings,
    addInteraction, listInteractionsByLead, listInteractionsByPeriod,
    saveReport, listReports, getReportByPeriod, deleteReport
};

console.log('[Firebase] Serviço carregado:', firebaseConfig.projectId);

/* =========================================================
   REPORTS (relatórios salvos)
   ========================================================= */
async function saveReport(data) {
    const ref = await addDoc(userCol('reports'), {
        ...data,
        createdAt: serverTimestamp()
    });
    return { ...data, id: ref.id };
}

async function listReports() {
    const snap = await getDocs(userCol('reports'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getReportByPeriod(startIso, endIso) {
    // Compara apenas a parte de data (YYYY-MM-DD), ignorando hora e ms.
    // Isso evita falhas quando o usuário seleciona o período via input[type=date]
    // e o range recalculado tem ms/segundos diferentes do momento em que o relatório foi gerado.
    const targetStart = String(startIso).slice(0, 10);
    const targetEnd = String(endIso).slice(0, 10);

    const snap = await getDocs(userCol('reports'));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.startIso && r.endIso &&
            String(r.startIso).slice(0, 10) === targetStart &&
            String(r.endIso).slice(0, 10) === targetEnd)
        .sort((a, b) => {
            const ta = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
            const tb = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
            return tb - ta;
        })[0] || null;
}

async function deleteReport(id) {
    await deleteDoc(userDoc('reports', id));
}