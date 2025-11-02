// Load data from JSON (simulate DB)
let courses = JSON.parse(localStorage.getItem('courses')) || []; // From courses.json
let users = JSON.parse(localStorage.getItem('users')) || [{ name: 'Admin', email: 'admin@lingplus.com', password: 'admin123', role: 'admin', approved: true }];
let reports = JSON.parse(localStorage.getItem('reports')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let filteredCourses = courses;
let quizScore = 0;

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    if (courses.length === 0) {
        // Default courses from courses.json
        fetch('courses.json').then(res => res.json()).then(data => {
            courses = data;
            localStorage.setItem('courses', JSON.stringify(courses));
            renderCourses();
        });
    } else {
        renderCourses();
    }
    if (currentUser) {
        updateUIForUser();
        renderDashboard();
        renderAdmin();
    }
    showSection('home');
});

// UI Functions
function showSection(section) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section)?.classList.remove('hidden') || document.getElementById('home').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuth() {
    document.getElementById('authModal').classList.add('hidden');
}

function showDashboard() {
    if (!currentUser) return showLogin();
    showSection('dashboard');
}

function showAdmin() {
    if (!currentUser || currentUser.role !== 'admin') return alert('فقط ادمین!');
    showSection('admin');
}

function updateUIForUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('dashboardBtn').classList.remove('hidden');
    if (currentUser.role === 'admin') document.getElementById('adminBtn').classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// Auth
function handleAuth() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    const isAdminLogin = document.getElementById('adminLogin').checked;

    if (isAdminLogin && email === 'admin@lingplus.com' && pass === 'admin123') {
        currentUser = { name: 'Admin', email, role: 'admin', approved: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        closeAuth();
        alert('ورود ادمین موفق');
        return;
    }

    const user = users.find(u => u.email === email && u.password === pass && u.approved);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        closeAuth();
        alert('ورود موفق');
        renderDashboard();
    } else {
        alert('ایمیل یا رمز اشتباه - یا منتظر تایید ادمین');
    }
}

// Courses
function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    grid.innerHTML = filteredCourses.map(c => `
        <div class="course-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <img src="${c.image}" alt="${c.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="font-bold text-xl mb-2 text-gray-800">${c.title}</h3>
                <p class="text-gray-600 mb-4">${c.desc}</p>
                <span class="text-sm text-blue-600 mb-4 block">${c.level}</span>
                <span class="inline-block bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">۹۰٪ تخفیف</span>
                <button onclick="openLesson(${c.id})" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">شروع درس</button>
            </div>
        </div>
    `).join('');
}

function filterCourses(level) {
    filteredCourses = level === 'all' ? courses : courses.filter(c => c.level === level);
    renderCourses();
}

function openLesson(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return alert('درس یافت نشد');
    document.getElementById('lessonTitle').textContent = course.title;
    document.getElementById('lessonContent').innerHTML = course.lessons[0].content; // First lesson text
    const quizHtml = course.lessons[0].quiz.map((q, i) => `
        <div class="mb-4 p-4 border rounded">
            <p class="font-bold mb-2">${q.question}</p>
            ${q.options.map(opt => `<button onclick="checkAnswer('${opt}', '${q.answer}', ${i})" class="block w-full bg-gray-200 p-2 my-1 rounded hover:bg-gray-300">${opt}</button>`).join('')}
        </div>
    `).join('');
    document.getElementById('quizSection').innerHTML = `<h3 class="text-xl mb-4">کوئیز</h3>${quizHtml}<p class="font-bold">نمره کل: <span id="quizScore">0</span>/${course.lessons[0].quiz.length}</p>`;
    document.getElementById('lessonModal').classList.remove('hidden');
    quizScore = 0;
}

function closeLesson() {
    document.getElementById('lessonModal').classList.add('hidden');
}

function checkAnswer(selected, correct, index) {
    if (selected === correct) quizScore++;
    document.getElementById('quizScore').textContent = quizScore;
    alert(selected === correct ? 'درست!' : 'اشتباه! جواب: ' + correct);
}

// Dashboard
function renderDashboard() {
    const list = document.getElementById('reportsList');
    if (!list || !currentUser) return;
    list.innerHTML = reports.filter(r => r.studentId === currentUser.email).map(r => `
        <div class="p-4 border rounded mb-4 bg-gray-50">
            <h4 class="font-bold">${r.date}</h4>
            <p>نمرات: ${JSON.stringify(r.grades)}</p>
            <p>یادداشت: ${r.notes}</p>
            <button onclick="downloadReport('${r.id}')" class="bg-blue-600 text-white px-4 py-2 rounded mt-2">دانلود PDF کارنامه</button>
        </div>
    `).join('') || '<p>کارنامه‌ای وجود ندارد</p>';
}

function downloadReport(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return alert('کارنامه یافت نشد');
    // Simulate PDF download (use jsPDF if included)
    alert(`دانلود کارنامه: ${report.notes} - نمره: ${JSON.stringify(report.grades)}`);
    // Real impl: const { jsPDF } = window.jspdf; ... doc.save();
}

// Admin
function renderAdmin() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    usersList.innerHTML = users.filter(u => u.role !== 'admin').map(u => `
        <div class="p-4 border rounded mb-4 flex justify-between items-center bg-gray-50">
            <span class="font-bold">${u.name} (${u.email}) - ${u.approved ? 'تاییدشده' : 'در انتظار'}</span>
            <div class="space-x-2 space-x-reverse">
                <button onclick="approveUser('${u.email}')" class="bg-green-600 text-white px-2 py-1 rounded text-sm ${u.approved ? 'hidden' : ''}">تایید</button>
                <button onclick="muteUser('${u.email}')" class="bg-yellow-600 text-white px-2 py-1 rounded text-sm">Mute</button>
                <button onclick="suspendUser('${u.email}')" class="bg-red-600 text-white px-2 py-1 rounded text-sm">Suspend</button>
            </div>
        </div>
    `).join('');
}

function createUser() {
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const pass = document.getElementById('newPass').value.trim();
    if (!name || !email || !pass) return alert('همه فیلدها الزامی!');
    if (users.find(u => u.email === email)) return alert('ایمیل تکراری!');
    users.push({ name, email, password: pass, role: 'student', approved: false });
    localStorage.setItem('users', JSON.stringify(users));
    alert('کاربر ایجاد شد - منتظر تایید خودت');
    document.getElementById('newName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newPass').value = '';
    renderAdmin();
}

function approveUser(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        user.approved = true;
        localStorage.setItem('users', JSON.stringify(users));
        alert('تایید شد');
        renderAdmin();
    }
}

function uploadReport() {
    const studentId = document.getElementById('reportStudentId').value.trim();
    const notes = document.getElementById('reportNotes').value.trim();
    const file = document.getElementById('reportFile').files[0];
    if (!studentId || !notes) return alert('ID دانشجو و یادداشت الزامی!');
    if (!file && !notes) return alert('فایل PDF یا یادداشت اضافه کن');
    // Simulate upload - save to JSON
    const id = Date.now();
    reports.push({ id, studentId, notes, grades: { grammar: 'A', vocab: 'B+' }, date: new Date().toLocaleString('fa-IR') });
    localStorage.setItem('reports', JSON.stringify(reports));
    alert('کارنامه ذخیره شد - دانشجو در داشبورد می‌بینه');
    document.getElementById('reportStudentId').value = '';
    document.getElementById('reportNotes').value = '';
    document.getElementById('reportFile').value = '';
    renderDashboard(); // Refresh for student view
}

function muteUser(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        user.mutedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week
        localStorage.setItem('users', JSON.stringify(users));
        alert('Mute تا ' + new Date(user.mutedUntil).toLocaleDateString('fa-IR'));
        renderAdmin();
    }
}

function suspendUser(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        user.suspended = !user.suspended;
        localStorage.setItem('users', JSON.stringify(users));
        alert(user.suspended ? 'Suspend شد' : 'فعال شد');
        renderAdmin();
    }
}

// Mobile Menu
document.getElementById('mobile-menu-button').onclick = () => document.getElementById('mobile-menu').classList.add('open');
document.getElementById('close-mobile-menu').onclick = () => document.getElementById('mobile-menu').classList.remove('open');

function closeMobile() {
    document.getElementById('mobile-menu').classList.remove('open');
}

// Search
document.getElementById('searchInput').onkeyup = (e) => {
    const query = e.target.value.toLowerCase();
    filteredCourses = courses.filter(c => c.title.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));
    renderCourses();
};

// FAQ Toggle (جدید)
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    answer.classList.toggle('open');
    if (icon) icon.style.transform = answer.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Other sections (about, contact) - static
if (document.getElementById('about')) {
    document.getElementById('about').innerHTML = '<div class="container mx-auto px-4 py-16"><h2 class="text-3xl font-bold mb-4">درباره ما</h2><p class="text-gray-600">پلتفرم آموزش رایگان زبان انگلیسی با تمرکز روی متون و کوئیز.</p></div>';
}
