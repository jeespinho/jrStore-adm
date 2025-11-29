// frontend-admin/js/main.js
// Configuração inicial do admin
document.addEventListener('DOMContentLoaded', async function() {
    // Configurar navegação padrão
    const productsLink = document.querySelector('.nav-link[href="#products"]');
    if (productsLink) {
        productsLink.click();
    }
    
    // Verificar autenticação e carregar dados se estiver logado
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        setTimeout(async () => {
            // Carrega categorias
            if (window.populateCategorySelects) {
                await window.populateCategorySelects();
            }
            
            // Carrega produtos
            if (window.loadProducts) {
                await window.loadProducts();
            }
        }, 100);
    }
    
    // Event listener para navegação entre seções
    document.addEventListener('click', function(e) {
        if (e.target.matches('.nav-link')) {
            const target = e.target.getAttribute('href').substring(1);
            
            if (target === 'orders' && window.loadOrders) {
                setTimeout(() => window.loadOrders(), 100);
            }
            
            if (target === 'products' && window.loadProducts) {
                setTimeout(() => window.loadProducts(), 100);
            }
        }
    });
});