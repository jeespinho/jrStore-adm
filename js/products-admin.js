// frontend-admin/js/products-admin.js
console.log('✅ products-admin.js carregado!');

// Funções para gerenciar produtos
async function loadProducts() {
    try {
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '<div class="loading">Carregando produtos organizados por categoria...</div>';

        // Busca categorias que têm produtos
        const categoriesResponse = await fetch(`${window.API_URL}/categories/with-products`);
        if (!categoriesResponse.ok) throw new Error('Erro ao carregar categorias');

        const categoriesWithProducts = await categoriesResponse.json();

        if (categoriesWithProducts.length === 0) {
            productsList.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
            return;
        }

        displayCategoriesWithProducts(categoriesWithProducts);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '<div class="message error">Erro ao carregar produtos</div>';
    }
}

function displayCategoriesWithProducts(categories) {
    const productsList = document.getElementById('products-list');

    let html = '';

    categories.forEach(category => {
        html += `
            <div class="category-section">
                <div class="category-header">
                    <h3 class="category-title">${category.name}</h3>
                    <span class="product-count">${category._count.products} produto(s)</span>
                </div>
                <div class="category-products">
                    ${category.products.map(product => `
                        <div class="product-item" data-id="${product.id}">
                            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" 
                                 onerror="this.src='https://via.placeholder.com/300x300?text=Imagem+Não+Encontrada'">
                            <div class="product-details">
                                <h4 class="product-name">${product.name}</h4>
                                <p class="product-description">${product.description}</p>
                                <div class="product-meta">
                                    <div class="product-prices">
                                        ${product.oldPrice ? `
                                            <span class="product-old-price">R$ ${product.oldPrice.toFixed(2)}</span>
                                            <span class="product-price discount">R$ ${product.price.toFixed(2)}</span>
                                        ` : `
                                            <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                                        `}
                                    </div>
                                    <span class="product-category-badge">${category.name}</span>
                                </div>
                            </div>
                            <div class="product-actions">
                                <button class="btn-edit" onclick="openEditModal('${product.id}')">Editar</button>
                                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    productsList.innerHTML = html;
}

async function addProduct(productData) {
    try {
        console.log('📤 Enviando produto:', productData);
        const response = await fetch(`${window.API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
                categoryId: productData.categoryId,
                imageUrl: productData.imageUrl
            })
        });

        console.log('📊 Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro detalhado:', errorText);
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        showMessage('✅ Produto adicionado com sucesso!', 'success');
        console.log('✅ Produto criado:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao adicionar produto:', error);
        showMessage('❌ Erro ao adicionar produto: ' + error.message, 'error');
        return null;
    }
}

async function updateProduct(id, productData) {
    try {
        console.log('📤 Atualizando produto:', id, productData);
        const response = await fetch(`${window.API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
                categoryId: productData.categoryId,
                imageUrl: productData.imageUrl
            })
        });

        console.log('📊 Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro detalhado:', errorText);
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        showMessage('✅ Produto atualizado com sucesso!', 'success');
        console.log('✅ Produto atualizado:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        showMessage('❌ Erro ao atualizar produto: ' + error.message, 'error');
        return null;
    }
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    try {
        console.log('🗑️ Excluindo produto:', id);
        const response = await fetch(`${window.API_URL}/products/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        showMessage('✅ Produto excluído com sucesso!', 'success');
        loadProducts();
        
    } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        showMessage('❌ Erro ao excluir produto: ' + error.message, 'error');
    }
}

// Modal functions
async function openEditModal(productId) {
    try {
        console.log('🎯 Abrindo modal de edição para produto:', productId);
        const response = await fetch(`${window.API_URL}/products/${productId}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro ao carregar produto:', errorText);
            throw new Error('Erro ao carregar produto');
        }

        const product = await response.json();
        console.log('✅ Produto carregado para edição:', product);

        // Preenche o formulário de edição
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-old-price').value = product.oldPrice || '';
        document.getElementById('edit-product-image').value = product.imageUrl;

        // Seleciona a categoria correta
        const categorySelect = document.getElementById('edit-product-category');
        if (categorySelect && product.categoryId) {
            categorySelect.value = product.categoryId;
            console.log('✅ Categoria selecionada:', product.categoryId);
        }

        // Abre o modal
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'flex';
        console.log('✅ Modal de edição aberto');
        
    } catch (error) {
        console.error('❌ Erro ao abrir modal de edição:', error);
        showMessage('❌ Erro ao carregar dados do produto para edição', 'error');
    }
}

function closeEditModal() {
    console.log('🎯 Fechando modal de edição...');
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('✅ Modal de edição fechado');
    }
}

function showMessage(message, type) {
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

// Função alternativa para agrupamento manual (caso a rota /with-products não exista)
function displayProductsByCategory(products) {
    const productsList = document.getElementById('products-list');

    if (products.length === 0) {
        productsList.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
        return;
    }

    // Agrupa produtos por categoria
    const productsByCategory = {};
    products.forEach(product => {
        const categoryName = product.category?.name || 'Sem Categoria';
        if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = [];
        }
        productsByCategory[categoryName].push(product);
    });

    // Cria o HTML organizado por categoria
    let html = '';

    Object.keys(productsByCategory).forEach(categoryName => {
        const categoryProducts = productsByCategory[categoryName];

        html += `
            <div class="category-section">
                <div class="category-header">
                    <h3 class="category-title">${categoryName}</h3>
                    <span class="product-count">${categoryProducts.length} produto(s)</span>
                </div>
                <div class="category-products">
                    ${categoryProducts.map(product => `
                        <div class="product-item" data-id="${product.id}">
                            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" 
                                 onerror="this.src='https://via.placeholder.com/300x300?text=Imagem+Não+Encontrada'">
                            <div class="product-details">
                                <h4 class="product-name">${product.name}</h4>
                                <p class="product-description">${product.description}</p>
                                <div class="product-meta">
                                    <div class="product-prices">
                                        ${product.oldPrice ? `
                                            <span class="product-old-price">R$ ${product.oldPrice.toFixed(2)}</span>
                                            <span class="product-price discount">R$ ${product.price.toFixed(2)}</span>
                                        ` : `
                                            <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                                        `}
                                    </div>
                                    <span class="product-category-badge">${categoryName}</span>
                                </div>
                            </div>
                            <div class="product-actions">
                                <button class="btn-edit" onclick="openEditModal('${product.id}')">Editar</button>
                                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    productsList.innerHTML = html;
}

// Event Listeners para produtos
document.addEventListener('DOMContentLoaded', function() {
    const addProductForm = document.getElementById('add-product-form');
    const editProductForm = document.getElementById('edit-product-form');
    const cancelAddBtn = document.getElementById('cancel-add');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Navegação entre seções
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);

            // Atualizar navegação ativa
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Mostrar seção correspondente
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = 'none';
            });

            document.getElementById(`${target}-section`).style.display = 'block';

            // Se for a seção de produtos, carregar a lista
            if (target === 'products') {
                loadProducts();
            }
        });
    });

    // Adicionar produto
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const productData = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            oldPrice: document.getElementById('product-old-price').value || null,
            categoryId: document.getElementById('product-category').value,
            imageUrl: document.getElementById('product-image').value
        };

        console.log('📝 Dados do produto:', productData);

        const result = await addProduct(productData);
        if (result) {
            addProductForm.reset();
            // Volta para a lista de produtos
            document.querySelector('.nav-link[href="#products"]').click();
        }
    });

    // Editar produto
    editProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const productId = document.getElementById('edit-product-id').value;
        const productData = {
            name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            oldPrice: document.getElementById('edit-product-old-price').value || null,
            categoryId: document.getElementById('edit-product-category').value,
            imageUrl: document.getElementById('edit-product-image').value
        };

        console.log('📝 Editando produto:', productId, productData);

        const result = await updateProduct(productId, productData);
        if (result) {
            closeEditModal();
            loadProducts();
        }
    });

    // Cancelar adição
    cancelAddBtn.addEventListener('click', function() {
        document.getElementById('add-product-form').reset();
        document.querySelector('.nav-link[href="#products"]').click();
    });

    // Fechar modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeEditModal);
    });

    // Fechar modal clicando fora
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    // Fechar modal de categoria clicando fora
    document.getElementById('category-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCategoryModal();
        }
    });
});

// Exportar funções para uso global
window.loadProducts = loadProducts;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.displayProductsByCategory = displayProductsByCategory;