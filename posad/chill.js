const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.getElementById('mainNav');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('nav--open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('nav--open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Открыть меню');
            document.body.style.overflow = '';
        });
    });
}

const header     = document.querySelector('.header');
const hero       = document.querySelector('.hero');
const demoBanner = document.querySelector('.demo-banner');

function fixLayout() {
    if (!header) return;
    const bannerH = demoBanner ? demoBanner.offsetHeight : 0;
    const headerH = header.offsetHeight;
    document.documentElement.style.setProperty('--banner-h', bannerH + 'px');
    if (hero) hero.style.paddingTop = (bannerH + headerH) + 'px';
}

function onScroll() {
    if (!header || !hero) return;
    const bannerH = demoBanner ? demoBanner.offsetHeight : 0;
    header.classList.toggle('header--solid', hero.getBoundingClientRect().bottom <= bannerH + header.offsetHeight);
}

fixLayout();
window.addEventListener('load', fixLayout);
window.addEventListener('resize', fixLayout, { passive: true });
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Загрузка туров из БД в select
const tourSelect = document.getElementById('f-tour');
if (tourSelect) {
    // Статичная демо-версия (GitHub Pages): туры встроены, без PHP
    Promise.resolve({ ok: true, tours: [
        { id: 1, title: 'Троице-Сергиева Лавра', price: 900, duration_hours: 2 },
        { id: 2, title: 'Пешком по старому городу', price: 700, duration_hours: 1.5 },
        { id: 3, title: 'Музей игрушки', price: 500, duration_hours: 1 },
        { id: 4, title: 'Гефсиманский скит', price: 1200, duration_hours: 3 },
    ] })
        .then(({ ok, tours }) => {
            if (!ok || !tours) throw new Error();
            tours.forEach(({ id, title, price, duration_hours }) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `${title} — ${duration_hours} ч, ${price} ₽`;
                tourSelect.appendChild(opt);
            });
        })
        .catch(() => {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Не удалось загрузить список — обновите страницу';
            opt.disabled = true;
            tourSelect.appendChild(opt);
        });
}

// Кнопка "Записаться" на карточке тура подставляет tour_id в select
document.querySelectorAll('.tour button[data-tour]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const tourName = btn.dataset.tour;
        if (tourSelect) {
            const opt = Array.from(tourSelect.options).find((o) =>
                o.textContent.startsWith(tourName)
            );
            if (opt) tourSelect.value = opt.value;
        }
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
});

const demoCheck = document.getElementById('demoConfirm');
const submitBtn = document.getElementById('submitBtn');

if (demoCheck && submitBtn) {
    demoCheck.addEventListener('change', () => {
        submitBtn.disabled = false;
    });
}

const form = document.getElementById('bookingForm');
const msg  = document.getElementById('formMsg');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем…';
        msg.textContent = '';

        try {
            // Демо: заявка никуда не отправляется
            await new Promise((r) => setTimeout(r, 600));
            const data = { ok: true };

            if (data.ok) {
                const name     = form.querySelector('[name="name"]').value;
                const tourText = tourSelect.options[tourSelect.selectedIndex].textContent.split(' —')[0];
                msg.style.color = '#166534';
                msg.textContent = `Спасибо, ${name}! Заявка на «${tourText}» принята, мы перезвоним в течение часа.`;
                form.reset();
                setTimeout(() => { msg.textContent = ''; }, 7000);
            } else {
                msg.style.color = '#b91c1c';
                msg.textContent = data.error ?? 'Что-то пошло не так, попробуйте снова.';
            }
        } catch {
            msg.style.color = '#b91c1c';
            msg.textContent = 'Нет связи с сервером, попробуйте позже.';
        } finally {
            submitBtn.textContent = 'Отправить заявку';
            submitBtn.disabled = false;
        }
    });
}

const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

const COOKIE_KEY = 'posad_cookie_consent';
const banner     = document.getElementById('cookieBanner');
const acceptBtn  = document.getElementById('cookieAccept');
const declineBtn = document.getElementById('cookieDecline');

if (banner && !localStorage.getItem(COOKIE_KEY)) {
    banner.hidden = false;
}

function closeBanner(value) {
    if (!banner) return;
    localStorage.setItem(COOKIE_KEY, value);
    banner.hidden = true;
}

if (acceptBtn)  acceptBtn.addEventListener('click',  () => closeBanner('accepted'));
if (declineBtn) declineBtn.addEventListener('click', () => closeBanner('declined'));

window.addEventListener('error', (event) => {
    console.warn('[client error]', event.message, event.filename + ':' + event.lineno);
});
