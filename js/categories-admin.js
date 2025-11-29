// frontend-admin/js/categories-admin.js
console.log('✅ categories-admin.js carregado!');

// Funções para gerenciar categorias
async function loadCategories() {
    try {
        console.log('📦 Carregando categorias...');
        const response = await fetch(`${window.API_URL}/categories`);
        if (!response.ok) throw new Error('Erro ao carregar categorias');
        const categories = await response.json();
        console.log('✅ Categorias carregadas:', categories.length);
        return categories;
    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        showMessage('Erro ao carregar categorias', 'error');
        return [];
    }
}

async function populateCategorySelects() {
    try {
        console.log('🔄 Populando selects de categoria...');
        const categories = await loadCategories();
        const categorySelects = [
            document.getElementById('product-category'),
            document.getElementById('edit-product-category')
        ];
        
        categorySelects.forEach((select, index) => {
            if (select) {
                console.log(`📝 Atualizando select ${index + 1}...`);
                
                // Salva o valor atual
                const currentValue = select.value;
                
                // Limpa todas as options
                select.innerHTML = '';
                
                // Adiciona opção padrão
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecione...';
                select.appendChild(defaultOption);
                
                // Adiciona categorias
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
                
                // Restaura o valor anterior se ainda existir
                if (currentValue && categories.find(c => c.id === currentValue)) {
                    select.value = currentValue;
                }
                
                console.log(`✅ Select ${index + 1} atualizado com ${categories.length} categorias`);
            } else {
                console.log(`❌ Select ${index + 1} não encontrado`);
            }
        });
        
        return categories;
    } catch (error) {
        console.error('❌ Erro ao popular selects de categoria:', error);
        return [];
    }
}

async function createCategory(categoryData) {
    try {
        console.log('➕ Criando categoria:', categoryData);
        const response = await fetch(`${window.API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar categoria');
        }
        
        const result = await response.json();
        showMessage('✅ Categoria criada com sucesso!', 'success');
        console.log('✅ Categoria criada:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao criar categoria:', error);
        showMessage('❌ Erro ao criar categoria: ' + error.message, 'error');
        return null;
    }
}

function openCategoryModal() {
    console.log('🎯 Abrindo modal de categoria...');
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('category-name').focus();
        console.log('✅ Modal aberto');
    } else {
        console.error('❌ Modal de categoria não encontrado');
    }
}

function closeCategoryModal() {
    console.log('🎯 Fechando modal de categoria...');
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('add-category-form').reset();
        console.log('✅ Modal fechado');
    }
}

// Função auxiliar para mostrar mensagens
function showMessage(message, type) {
    console.log(`💬 Mensagem [${type}]:`, message);
    
    // Remove mensagens anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Adiciona no topo do dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.insertBefore(messageDiv, dashboard.firstChild);
        
        // Remove após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Event Listeners para categorias
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 categories-admin.js: DOM carregado');
    
    const addCategoryForm = document.getElementById('add-category-form');
    console.log('📝 Formulário de categoria:', addCategoryForm ? 'encontrado' : 'não encontrado');
    
    // Criar categoria
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📤 Enviando formulário de categoria...');
            
            const categoryName = document.getElementById('category-name').value.trim();
            const categoryDescription = document.getElementById('category-description').value.trim();
            
            console.log('📝 Dados do formulário:', { categoryName, categoryDescription });
            
            if (!categoryName) {
                showMessage('❌ Por favor, insira um nome para a categoria', 'error');
                return;
            }
            
            const categoryData = {
                name: categoryName,
                description: categoryDescription || null
            };
            
            const result = await createCategory(categoryData);
            if (result) {
                closeCategoryModal();
                // Atualiza os selects de categoria
                await populateCategorySelects();
                // Seleciona a nova categoria automaticamente
                const categorySelect = document.getElementById('product-category');
                if (categorySelect) {
                    categorySelect.value = result.id;
                    console.log('✅ Nova categoria selecionada automaticamente');
                }
            }
        });
    }
    
    // Fechar modal clicando fora
    const categoryModal = document.getElementById('category-modal');
    if (categoryModal) {
        categoryModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCategoryModal();
            }
        });
    }
    
    // Carregar categorias quando o admin fizer login
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        console.log('🔐 Admin autenticado, carregando categorias...');
        setTimeout(() => {
            populateCategorySelects();
        }, 1000);
    }
});

// Exportar funções para uso global
window.loadCategories = loadCategories;
window.populateCategorySelects = populateCategorySelects;
window.createCategory = createCategory;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.debugCategories = function() {
    console.log('🔍 Debug Categories:');
    console.log('- openCategoryModal:', typeof openCategoryModal);
    console.log('- window.openCategoryModal:', typeof window.openCategoryModal);
    console.log('- populateCategorySelects:', typeof populateCategorySelects);
    
    const modal = document.getElementById('category-modal');
    console.log('- Modal encontrado:', !!modal);
    console.log('- Modal display:', modal ? modal.style.display : 'N/A');
};