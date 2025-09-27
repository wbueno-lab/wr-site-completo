# Marcas de Jaquetas Adicionadas

## 🏷️ Marcas Incluídas

As seguintes marcas foram adicionadas ao banco de dados para o módulo de jaquetas:

### 1. **Alpinestars** 🇮🇹
- **País**: Itália
- **Fundada**: 1963
- **Descrição**: Marca italiana líder mundial em equipamentos de proteção para motociclismo, conhecida por suas jaquetas técnicas e inovadoras
- **Especialidades**: Jaquetas de couro, têxtil, equipamentos de corrida

### 2. **LS2** 🇪🇸
- **País**: Espanha  
- **Fundada**: 1990
- **Descrição**: Marca espanhola conhecida por capacetes e equipamentos de proteção, incluindo jaquetas de alta qualidade com boa relação custo-benefício
- **Especialidades**: Jaquetas esportivas, equipamentos completos

### 3. **Norisk** 🇧🇷
- **País**: Brasil
- **Fundada**: 2010
- **Descrição**: Fabricante brasileiro de equipamentos de proteção individual, incluindo jaquetas e acessórios para motociclistas
- **Especialidades**: Equipamentos nacionais, boa relação custo-benefício

### 4. **Texx** 🇧🇷
- **País**: Brasil
- **Fundada**: 1985
- **Descrição**: Marca brasileira especializada em equipamentos de proteção para motociclistas, oferecendo produtos de qualidade com excelente custo-benefício
- **Especialidades**: Jaquetas impermeáveis, equipamentos para touring

### 5. **X11** 🇧🇷
- **País**: Brasil
- **Fundada**: 1995
- **Descrição**: Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas, incluindo jaquetas, capacetes e acessórios
- **Especialidades**: Equipamentos completos, jaquetas urbanas e esportivas

## 📋 Migração Aplicada

A migração `20250927000002_add_jacket_brands.sql` foi criada com:

```sql
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo, conhecida por suas jaquetas técnicas e inovadoras', 'Itália', 1963, true),
('Texx', 'Marca brasileira especializada em equipamentos de proteção para motociclistas, oferecendo produtos de qualidade com excelente custo-benefício', 'Brasil', 1985, true),
('Norisk', 'Fabricante brasileiro de equipamentos de proteção individual, incluindo jaquetas e acessórios para motociclistas', 'Brasil', 2010, true),
('X11', 'Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas, incluindo jaquetas, capacetes e acessórios', 'Brasil', 1995, true)
ON CONFLICT (name) DO NOTHING;
```

## 🎯 Como Usar

### No Admin Panel
1. Acesse `/admin` → Aba "Jaquetas"
2. Clique em "Nova Jaqueta"
3. No campo "Marca", agora você verá todas essas opções disponíveis:
   - Alpinestars
   - LS2
   - Norisk
   - Texx
   - X11

### Exemplos de Produtos
Você pode criar jaquetas como:

**Jaqueta Alpinestars T-GP Plus R V3**
- Marca: Alpinestars
- Tipo: Têxtil
- Material: Cordura
- Nível de Proteção: CE Nível 2

**Jaqueta Texx Armor Impermeável**
- Marca: Texx
- Tipo: Impermeável
- Material: Nylon
- Nível de Proteção: CE Nível 1

**Jaqueta X11 Urban**
- Marca: X11
- Tipo: Couro
- Material: Couro bovino
- Nível de Proteção: Básica

## 🔧 Verificação

Para confirmar que as marcas foram adicionadas corretamente, execute:

```sql
SELECT name, description, country_of_origin, founded_year 
FROM public.brands 
WHERE name IN ('Alpinestars', 'LS2', 'Norisk', 'Texx', 'X11') 
ORDER BY name;
```

## 📈 Próximos Passos

1. **Teste a criação** de jaquetas com essas marcas
2. **Adicione imagens** de logos das marcas se necessário
3. **Crie produtos reais** usando essas marcas
4. **Considere adicionar mais marcas** conforme necessário:
   - Dainese
   - Rev'it
   - Joe Rocket
   - Icon
   - Spidi

## 🌟 Benefícios

- **Variedade**: Mix de marcas internacionais e nacionais
- **Faixas de preço**: Desde opções econômicas até premium
- **Especialidades**: Diferentes focos (corrida, touring, urbano)
- **Qualidade**: Todas são marcas reconhecidas no mercado brasileiro
