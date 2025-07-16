export function redirectTo(page) {
    const base = window.location.pathname.replace(/\/[^/]*$/, '/');
    window.location.href = base + page;
}