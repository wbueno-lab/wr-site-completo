import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminPageWorking = () => {
  console.log('🚀 AdminPageWorking - Iniciando renderização...');
  
  const { user, profile } = useAuth();
  const { products, orders, contactMessages, isLoading } = useRealtime();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  // Estados para produtos
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    is_promo: false,
    is_new: false,
    image_url: ''
  });

  console.log('🔍 AdminPageWorking - Dados carregados:');
  console.log('👤 User:', user);
  console.log('👤 Profile:', profile);
  console.log('👤 Is Admin:', profile?.is_admin);
  console.log('📦 Products:', products?.length || 0);
  console.log('📋 Orders:', orders?.length || 0);
  console.log('⏳ IsLoading:', isLoading);

  // Função de criação de produtos
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name.trim()) {
      toast({
        title: "Erro!",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast({
        title: "Erro!",
        description: "Preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.stock_quantity || parseInt(newProduct.stock_quantity) < 0) {
      toast({
        title: "Erro!",
        description: "Quantidade em estoque deve ser maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('🔄 Criando produto com dados:', newProduct);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          is_promo: newProduct.is_promo,
          is_new: newProduct.is_new,
          image_url: newProduct.image_url || null,
          is_active: true
        }])
        .select();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Produto criado com sucesso:', data);

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso!",
      });

      // Limpar formulário
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_promo: false,
        is_new: false,
        image_url: ''
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar produto:', error);
      
      let errorMessage = "Erro ao criar produto. Tente novamente.";
      
      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "Já existe um produto com este nome.";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Categoria ou marca selecionada não é válida.";
        } else if (error.message.includes('not-null')) {
          errorMessage = "Todos os campos obrigatórios devem ser preenchidos.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_promo: product.is_promo || false,
      is_new: product.is_new || false,
      image_url: product.image_url || ''
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          is_promo: newProduct.is_promo,
          is_new: newProduct.is_new,
          image_url: newProduct.image_url || null,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso!",
      });

      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_promo: false,
        is_new: false,
        image_url: ''
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar produto:', error);
      toast({
        title: "Erro!",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      is_promo: false,
      is_new: false,
      image_url: ''
    });
  };

  const confirmDeleteProduct = (product: any) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso!",
      });

      setDeletingProduct(null);

    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro!",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Status do pedido atualizado para ${newStatus}`,
      });

    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast({
        title: "Erro!",
        description: "Erro ao atualizar status do pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
      padding: '2rem 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#e6ffe6',
      margin: '0.5rem 0 0 0'
    },
    userInfo: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.9rem'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    tabsContainer: {
      marginBottom: '2rem'
    },
    tabsList: {
      background: '#333',
      borderRadius: '0.75rem',
      padding: '0.25rem',
      display: 'flex',
      gap: '0.25rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    tabButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      background: 'transparent',
      color: '#ccc',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    tabButtonActive: {
      background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
      color: 'white'
    },
    tabContent: {
      marginTop: '2rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: '#333',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #444'
    },
    statContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    statInfo: {
      flex: 1
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#999',
      margin: 0
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem'
    },
    formCard: {
      background: '#333',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    formHeader: {
      background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
      padding: '1.5rem',
      color: 'white'
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    },
    formSubtitle: {
      fontSize: '1rem',
      color: '#e6ffe6',
      margin: '0.5rem 0 0 0'
    },
    formContent: {
      padding: '2rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: 'white'
    },
    formInput: {
      height: '3rem',
      padding: '0.75rem',
      border: '2px solid #666',
      borderRadius: '0.75rem',
      background: '#222',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.2s'
    },
    formInputFocus: {
      borderColor: '#00ff00',
      boxShadow: '0 0 0 3px rgba(0, 255, 0, 0.1)'
    },
    formTextarea: {
      minHeight: '100px',
      padding: '0.75rem',
      border: '2px solid #666',
      borderRadius: '0.75rem',
      background: '#222',
      color: 'white',
      fontSize: '1rem',
      resize: 'vertical' as const,
      transition: 'all 0.2s'
    },
    formButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonPrimary: {
      background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
      color: 'white',
      flex: 1
    },
    buttonSecondary: {
      background: 'transparent',
      color: '#ccc',
      border: '1px solid #666',
      padding: '0.75rem 1.5rem'
    },
    productsList: {
      background: '#333',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    productItem: {
      background: '#222',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid #444',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s'
    },
    productInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flex: 1
    },
    productImage: {
      width: '4rem',
      height: '4rem',
      objectFit: 'cover' as const,
      borderRadius: '0.5rem',
      border: '1px solid #666'
    },
    productDetails: {
      flex: 1
    },
    productName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    productType: {
      fontSize: '0.875rem',
      color: '#999',
      margin: 0
    },
    productPrice: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#00ff00',
      margin: '0.25rem 0 0 0'
    },
    productActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    editButton: {
      borderColor: '#00ff00',
      color: '#00ff00'
    },
    deleteButton: {
      borderColor: '#ff4444',
      color: '#ff4444'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#333',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center' as const,
      border: '1px solid #444'
    },
    modalIcon: {
      width: '4rem',
      height: '4rem',
      borderRadius: '50%',
      background: 'rgba(255, 68, 68, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      fontSize: '2rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 1rem 0'
    },
    modalText: {
      color: '#ccc',
      margin: '0 0 1.5rem 0'
    },
    modalButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    loading: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    loadingSpinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid #333',
      borderTop: '4px solid #00ff00',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Painel Administrativo</h1>
            <p style={styles.subtitle}>Gerencie produtos, pedidos e muito mais</p>
          </div>
          <div style={styles.userInfo}>
            <p>Bem-vindo, {profile?.full_name || 'Admin'}</p>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabsList}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'dashboard' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'products' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('products')}
            >
              📦 Produtos
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'orders' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Pedidos
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'messages' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('messages')}
            >
              💬 Mensagens
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {activeTab === 'dashboard' && (
            <div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statContent}>
                    <div style={styles.statInfo}>
                      <p style={styles.statLabel}>Produtos Ativos</p>
                      <p style={styles.statValue}>{products?.length || 0}</p>
                    </div>
                    <div style={{...styles.statIcon, background: 'rgba(0, 255, 0, 0.2)'}}>
                      📦
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statContent}>
                    <div style={styles.statInfo}>
                      <p style={styles.statLabel}>Pedidos Hoje</p>
                      <p style={styles.statValue}>
                        {orders?.filter(order => {
                          const today = new Date().toDateString();
                          const orderDate = new Date(order.created_at).toDateString();
                          return today === orderDate;
                        }).length || 0}
                      </p>
                    </div>
                    <div style={{...styles.statIcon, background: 'rgba(59, 130, 246, 0.2)'}}>
                      🛒
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statContent}>
                    <div style={styles.statInfo}>
                      <p style={styles.statLabel}>Receita Total</p>
                      <p style={styles.statValue}>
                        {formatPrice(orders?.reduce((total, order) => total + (order.total_amount || 0), 0) || 0)}
                      </p>
                    </div>
                    <div style={{...styles.statIcon, background: 'rgba(34, 197, 94, 0.2)'}}>
                      💰
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statContent}>
                    <div style={styles.statInfo}>
                      <p style={styles.statLabel}>Estoque Baixo</p>
                      <p style={styles.statValue}>
                        {products?.filter(product => product.stock_quantity < 10).length || 0}
                      </p>
                    </div>
                    <div style={{...styles.statIcon, background: 'rgba(239, 68, 68, 0.2)'}}>
                      ⚠️
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              {/* Formulário de Produtos */}
              <div style={styles.formCard}>
                <div style={styles.formHeader}>
                  <h2 style={styles.formTitle}>
                    {editingProduct ? 'Editar Produto' : 'Criar Novo Produto'}
                  </h2>
                  <p style={styles.formSubtitle}>
                    {editingProduct ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
                  </p>
                </div>
                <div style={styles.formContent}>
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Nome do Produto *</label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          required
                          style={styles.formInput}
                          placeholder="Digite o nome do produto"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Preço *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          required
                          style={styles.formInput}
                          placeholder="0.00"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Quantidade em Estoque *</label>
                        <input
                          type="number"
                          min="0"
                          value={newProduct.stock_quantity}
                          onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                          required
                          style={styles.formInput}
                          placeholder="0"
                        />
                      </div>

                      <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                        <label style={styles.formLabel}>Descrição</label>
                        <textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          style={styles.formTextarea}
                          placeholder="Descreva o produto..."
                        />
                      </div>
                    </div>

                    <div style={styles.formButtons}>
                      <button
                        type="submit"
                        style={{...styles.button, ...styles.buttonPrimary}}
                      >
                        {editingProduct ? '✏️ Atualizar Produto' : '➕ Criar Produto'}
                      </button>
                      
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{...styles.button, ...styles.buttonSecondary}}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Lista de Produtos */}
              <div style={styles.productsList}>
                <div style={styles.formHeader}>
                  <h2 style={styles.formTitle}>Produtos Cadastrados</h2>
                  <p style={styles.formSubtitle}>Gerencie todos os produtos do catálogo</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {!products || products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>
                        Nenhum produto encontrado
                      </h3>
                      <p style={{ color: '#999', margin: 0 }}>Comece criando seu primeiro produto.</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} style={styles.productItem}>
                        <div style={styles.productInfo}>
                          <img
                            src={product.image_url || '/placeholder.svg'}
                            alt={product.name}
                            style={styles.productImage}
                          />
                          <div style={styles.productDetails}>
                            <h3 style={styles.productName}>{product.name}</h3>
                            <p style={styles.productType}>Produto</p>
                            <p style={styles.productPrice}>{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        <div style={styles.productActions}>
                          <button
                            onClick={() => handleEditProduct(product)}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => confirmDeleteProduct(product)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>
                  Gerenciamento de Pedidos
                </h2>
                <p style={{ color: '#999', margin: 0 }}>
                  Gerencie todos os pedidos da loja
                </p>
              </div>

              {orders?.length === 0 ? (
                <div style={styles.formCard}>
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>
                      Nenhum pedido encontrado
                    </h3>
                    <p style={{ color: '#999', margin: 0 }}>
                      Os pedidos aparecerão aqui quando os clientes fizerem compras.
                    </p>
                  </div>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} style={styles.formCard}>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.25rem 0' }}>
                            Pedido #{order.id.slice(-8)}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#999', margin: 0 }}>
                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: order.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
                                     order.status === 'confirmed' ? 'rgba(59, 130, 246, 0.2)' :
                                     order.status === 'shipped' ? 'rgba(147, 51, 234, 0.2)' :
                                     order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' :
                                     'rgba(239, 68, 68, 0.2)',
                          color: order.status === 'pending' ? '#fbbf24' :
                                 order.status === 'confirmed' ? '#3b82f6' :
                                 order.status === 'shipped' ? '#9333ea' :
                                 order.status === 'delivered' ? '#22c55e' :
                                 '#ef4444',
                          border: `1px solid ${order.status === 'pending' ? '#fbbf24' :
                                           order.status === 'confirmed' ? '#3b82f6' :
                                           order.status === 'shipped' ? '#9333ea' :
                                           order.status === 'delivered' ? '#22c55e' :
                                           '#ef4444'}`
                        }}>
                          {order.status === 'pending' ? 'Pendente' :
                           order.status === 'confirmed' ? 'Confirmado' :
                           order.status === 'shipped' ? 'Enviado' :
                           order.status === 'delivered' ? 'Entregue' :
                           'Cancelado'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#999', margin: '0 0 0.5rem 0' }}>Cliente</h4>
                          <p style={{ color: 'white', margin: 0 }}>{order.customer_name || 'Nome não informado'}</p>
                          <p style={{ fontSize: '0.875rem', color: '#999', margin: 0 }}>{order.customer_email || 'Email não informado'}</p>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#999', margin: '0 0 0.5rem 0' }}>Total</h4>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff00', margin: 0 }}>
                            {formatPrice(order.total_amount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>
                  Central de Mensagens
                </h2>
                <p style={{ color: '#999', margin: 0 }}>
                  Gerencie mensagens de clientes e suporte
                </p>
              </div>

              <div style={styles.formCard}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>
                    Central de Mensagens
                  </h3>
                  <p style={{ color: '#999', margin: '0 0 1rem 0' }}>
                    Sistema de mensagens em desenvolvimento
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                    Total de mensagens: {contactMessages?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deletingProduct && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>🗑️</div>
            <h3 style={styles.modalTitle}>Confirmar Exclusão</h3>
            <p style={styles.modalText}>
              Tem certeza que deseja excluir o produto <strong>"{deletingProduct.name}"</strong>?
              <br />
              <span style={{ color: '#ff4444', fontSize: '0.875rem' }}>Esta ação não pode ser desfeita.</span>
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setDeletingProduct(null)}
                style={{...styles.button, ...styles.buttonSecondary, flex: 1}}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{...styles.button, ...styles.buttonPrimary, flex: 1, background: '#ff4444'}}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #00ff00 !important;
          box-shadow: 0 0 0 3px rgba(0, 255, 0, 0.1) !important;
        }
        
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default AdminPageWorking;

