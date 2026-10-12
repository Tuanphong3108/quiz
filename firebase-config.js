// Import Firebase SDK v13.0.0 chuẩn CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue, remove } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

// ⚙️ Cấu hình Firebase của bro
const firebaseConfig = {
    apiKey: "AIzaSyCAnZd2FObckVREBAtlKKdvE-uZVjXqJqQ",
    authDomain: "phongvn-s-quiz.firebaseapp.com",
    databaseURL: "https://phongvn-s-quiz-default-rtdb.firebaseio.com",
    projectId: "phongvn-s-quiz",
    storageBucket: "phongvn-s-quiz.firebasestorage.app",
    messagingSenderId: "593465579864",
    appId: "1:593465579864:web:4298e138e1e2c565086d2d",
    measurementId: "G-4CW2FMHZWR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Kiểm tra tên người chơi
 */
export async function checkPlayerName(name) {
    const cleanName = name.trim();
    if (cleanName === "PhongVN") {
        return { status: "ADMIN_TRIGGER" };
    }

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `quiz_results/${cleanName}`));
        if (snapshot.exists()) {
            return { status: "NAME_TAKEN", data: snapshot.val() };
        } else {
            return { status: "VALID_USER", name: cleanName };
        }
    } catch (error) {
        console.error("Lỗi kiểm tra tên:", error);
        return { status: "VALID_USER", name: cleanName };
    }
}

/**
 * Kiểm tra Mật khẩu Admin
 */
export function verifyAdminPassword(password) {
    return password === "khaiphong3108";
}

/**
 * Lưu kết quả làm bài lên Firebase
 */
export async function saveQuizResult(playerName, score, totalQuestions, userAnswers) {
    try {
        await set(ref(db, 'quiz_results/' + playerName), {
            playerName: playerName,
            score: score,
            totalQuestions: totalQuestions,
            userAnswers: userAnswers,
            timestamp: new Date().toISOString()
        });
        console.log("Đã lưu điểm thành công!");
    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
    }
}

/**
 * 🔥 [MỚI] Xóa/Reset lượt làm bài của người chơi (Dành cho Admin)
 */
export async function deleteQuizResult(playerName) {
    try {
        await remove(ref(db, 'quiz_results/' + playerName));
        console.log(`Đã reset người dùng ${playerName}`);
    } catch (error) {
        console.error("Lỗi khi xóa lượt làm:", error);
    }
}

/**
 * Lắng nghe Bảng xếp hạng Realtime
 */
export function subscribeLeaderboard(callback) {
    const resultsRef = ref(db, 'quiz_results');
    onValue(resultsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return callback([]);
        const list = Object.values(data).sort((a, b) => b.score - a.score);
        callback(list);
    });
}

/**
 * Lấy toàn bộ chi tiết cho Admin Dashboard
 */
export function subscribeAdminDashboard(callback) {
    const resultsRef = ref(db, 'quiz_results');
    onValue(resultsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return callback([]);
        const list = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        callback(list);
    });
}
