// Load data from JSON (simulate DB)
let courses = JSON.parse(localStorage.getItem('courses')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { name: 'Admin', email: 'admin@lingplus.com', password: 'admin123', role: 'admin', approved: true }
];
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
        }).catch(err => console.error('Error loading courses:', err));
    } else {
        renderCourses();
    }
    if (currentUser) {
        updateUIForUser();
        renderDashboard();
        if (currentUser.role === 'admin') renderAdmin();
    }
    
    // Scroll Animation Observer (شیک و سبک)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // trigger کمی قبل scroll
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // فقط یکبار
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    
    showSection('home');
});

// UI Functions
function showSection(section) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(section);
    if (target) {
        target.classList.remove('hidden');
    } else {
        document.getElementById('home').classList.remove('hidden');
    }
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
    renderDashboard(); // Refresh
}

function showAdmin() {
    if (!currentUser || currentUser.role !== 'admin') return alert('فقط ادمین!');
    showSection('admin');
    renderAdmin(); // Refresh
}

function updateUIForUser() {
    document.getElementById('loginBtn')?.classList.add('hidden');
    document.getElementById('logoutBtn')?.classList.remove('hidden');
    document.getElementById('dashboardBtn')?.classList.remove('hidden');
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn')?.classList.remove('hidden');
    }
    // Update user name in dashboard
    document.getElementById('userName')?.textContent = currentUser.name;
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload();
}

// Auth
function handleAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPass').value;
    const isAdminLogin = document.getElementById('adminLogin')?.checked || false;

    if (isAdminLogin && email === 'admin@lingplus.com' && pass === 'admin123') {
        currentUser = { name: 'Admin', email, role: 'admin', approved: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        closeAuth();
        alert('ورود ادمین موفق');
        showDashboard();
        return;
    }

    const user = users.find(u => u.email === email && u.password === pass && u.approved);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        closeAuth();
        alert('ورود موفق');
        showDashboard();
    } else {
        alert('ایمیل یا رمز اشتباه - یا منتظر تایید ادمین');
    }
}

// Courses
function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    grid.innerHTML = filteredCourses.map(c => `
        <div class="course-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-on-scroll">
            <img src="${c.image}" alt="${c.title}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200?text=Course'">
            <span class="discount-badge">۹۰٪ تخفیف</span>
            <div class="p-6">
                <h3 class="font-bold text-xl mb-2 text-gray-800">${c.title}</h3>
                <p class="text-gray-600 mb-4">${c.desc}</p>
                <span class="text-sm text-blue-600 mb-4 block">${c.level}</span>
                <button onclick="openLesson(${c.id})" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition animate-on-scroll">شروع درس رایگان</button>
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
    // Simple modal or redirect - for now, alert sample
    alert(`درس: ${course.title}\nتوضیح: ${course.lessons[0]?.content || 'محتوا در دسترس نیست'}`);
    // TODO: Open full lesson modal or page
}

// Dashboard Render (جدید: کامل)
function renderDashboard() {
    if (!currentUser) return;
    const reportsContainer = document.getElementById('userReports');
    if (!reportsContainer) return;
    
    const userReports = reports.filter(r => r.studentId === currentUser.email);
    if (userReports.length === 0) {
        reportsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">هنوز گزارشی ندارید. منتظر آپلود ادمین باشید!</p>';
        return;
    }
    
    reportsContainer.innerHTML = userReports.map(report => `
        <div class="report-card p-4 border rounded-lg bg-white">
            <h3 class="font-bold text-lg mb-2">کارنامه ${report.id}</h3>
            <p class="text-gray-600 mb-2">تاریخ: ${report.date}</p>
            <p class="mb-2"><strong>نمرات:</strong> ${JSON.stringify(report.grades)}</p>
            <p class="text-sm text-green-600"><strong>یادداشت:</strong> ${report.notes}</p>
            <button onclick="downloadReport(${report.id})" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">دانلود PDF</button>
        </div>
    `).join('');
    
    // Update user name
    document.getElementById('userName').textContent = currentUser.name;
}

// Download Report PDF (حفظ، با jsPDF - CDN در HTML اضافه کن)
function downloadReport(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return alert('گزارش یافت نشد');
    
    // Assume jsPDF loaded
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.text(`کارنامه دانشجو: ${report.studentId}`, 20, 30);
    doc.text(`تاریخ: ${report.date}`, 20, 40);
    doc.text(`نمرات: ${JSON.stringify(report.grades)}`, 20, 50);
    doc.text(`یادداشت ادمین: ${report.notes}`, 20, 60);
    doc.save(`karname-${id}.pdf`);
}

// Admin Render (جدید: کامل)
function renderAdmin() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    usersList.innerHTML = users.filter(u => u.role !== 'admin').map(u => `
        <div class="p-4 border rounded mb-4 flex justify-between items-center bg-gray-50 animate-on-scroll">
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
    reports.push({ 
        id, 
        studentId, 
        notes, 
        grades: { grammar: 'A', vocab: 'B+' }, // Default, or parse from file
        date: new Date().toLocaleDateString('fa-IR') 
    });
    localStorage.setItem('reports', JSON.stringify(reports));
    alert('کارنامه ذخیره شد - دانشجو در داشبورد می‌بینه');
    document.getElementById('reportStudentId').value = '';
    document.getElementById('reportNotes').value = '';
    document.getElementById('reportFile').value = '';
    // Refresh dashboard for potential student view
    if (currentUser) renderDashboard();
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
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('open');
    });
    document.getElementById('close-mobile-menu')?.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.remove('open');
    });
});

function closeMobile() {
    document.getElementById('mobile-menu').classList.remove('open');
}

// Search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.onkeyup = (e) => {
            const query = e.target.value.toLowerCase();
            filteredCourses = courses.filter(c => 
                c.title.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)
            );
            renderCourses();
        };
    }
});

// Other sections (about, contact) - static
document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.innerHTML = '<div class="container mx-auto px-4 py-16"><h2 class="text-3xl font-bold mb-4">درباره ما</h2><p class="text-gray-600">پلتفرم آموزش رایگان زبان انگلیسی با تمرکز روی متون و کوئیز.</p></div>';
    }
});
