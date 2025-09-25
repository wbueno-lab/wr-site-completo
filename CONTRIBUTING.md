# Guia de Contribuição

## Estrutura do Código

### Componentes

- Use componentes funcionais com TypeScript
- Documente props com interfaces
- Use hooks para lógica reutilizável
- Mantenha componentes pequenos e focados

Exemplo:
```tsx
interface ButtonProps {
  /** O texto a ser exibido no botão */
  children: React.ReactNode;
  /** Função chamada quando o botão é clicado */
  onClick: () => void;
  /** Se o botão está desabilitado */
  disabled?: boolean;
}

/**
 * Botão customizado com estilo consistente
 */
const Button = ({ children, onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="..."
    >
      {children}
    </button>
  );
};
```

### Hooks

- Prefixe com `use`
- Documente parâmetros e retorno
- Trate erros adequadamente
- Use TypeScript para tipagem

Exemplo:
```tsx
/**
 * Hook para gerenciar estado de carregamento
 * @param initialState Estado inicial do loading
 * @returns Tupla com estado e funções para controle
 */
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return [isLoading, startLoading, stopLoading] as const;
};
```

### Contextos

- Use para estado global
- Documente o propósito do contexto
- Forneça hook para acesso
- Valide uso do contexto

Exemplo:
```tsx
interface AuthContextType {
  /** Usuário atual */
  user: User | null;
  /** Função para fazer login */
  signIn: (email: string, password: string) => Promise<void>;
  /** Função para fazer logout */
  signOut: () => Promise<void>;
}

/**
 * Contexto para gerenciar autenticação
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook para acessar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Serviços

- Use para lógica de negócio
- Documente funções e parâmetros
- Trate erros adequadamente
- Use TypeScript para tipagem

Exemplo:
```tsx
interface Product {
  id: string;
  name: string;
  price: number;
}

/**
 * Serviço para gerenciar produtos
 */
class ProductService {
  /**
   * Busca um produto por ID
   * @param id ID do produto
   * @returns Produto encontrado ou null
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
}
```

## Padrões de Código

### Nomenclatura

- Use PascalCase para componentes
- Use camelCase para funções e variáveis
- Use UPPER_SNAKE_CASE para constantes
- Use kebab-case para arquivos CSS

### Organização de Arquivos

- Um componente por arquivo
- Agrupe arquivos relacionados em pastas
- Use index.ts para exportar
- Mantenha hierarquia clara

### Imports

- Use imports absolutos (@/components)
- Agrupe imports por tipo
- Remova imports não utilizados
- Use named exports

### Estilização

- Use TailwindCSS
- Mantenha classes organizadas
- Use variantes para estados
- Evite CSS inline

### Acessibilidade

- Use roles ARIA
- Forneça labels
- Suporte navegação por teclado
- Teste com leitores de tela

### Internacionalização

- Use o hook useI18n
- Evite textos hardcoded
- Suporte múltiplos idiomas
- Use formatação local

### Performance

- Use React.memo quando necessário
- Evite re-renders desnecessários
- Otimize imagens
- Use lazy loading

### Testes

- Escreva testes unitários
- Teste componentes isoladamente
- Teste casos de erro
- Mantenha cobertura alta

## Fluxo de Trabalho

### Git

- Use branches por feature
- Faça commits atômicos
- Escreva mensagens descritivas
- Faça rebase antes do merge

### Pull Requests

- Descreva as mudanças
- Adicione screenshots
- Marque issues relacionadas
- Peça review apropriado

### Code Review

- Verifique tipos
- Verifique acessibilidade
- Verifique performance
- Verifique documentação

### Deploy

- Teste em staging
- Verifique logs
- Monitore métricas
- Faça rollback se necessário
