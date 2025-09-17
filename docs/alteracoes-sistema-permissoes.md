# Documentação das Alterações no Sistema de Permissões

## Visão Geral

Este documento descreve as alterações implementadas no sistema de gerenciamento de usuários e permissões da aplicação DataScope. As melhorias incluem a adição de filtros e paginação na listagem de usuários, além da implementação do gerenciamento de permissões por usuário.

## Alterações Realizadas

### 1. Listagem de Usuários

#### 1.1 Filtros
- Implementado filtro de busca por texto para encontrar usuários por nome, email ou telefone
- Adicionado filtro por papel (role) do usuário, permitindo visualizar apenas usuários com determinada função
- Os filtros são aplicados em tempo real, atualizando a lista conforme o usuário digita ou seleciona opções

#### 1.2 Paginação
- Implementada paginação na listagem de usuários para melhorar a performance e usabilidade
- Adicionados controles de navegação entre páginas (anterior/próxima)
- Implementado seletor de itens por página, permitindo ao usuário escolher quantos registros deseja visualizar
- Adicionado contador de registros exibidos e total de registros

### 2. Gerenciamento de Permissões

#### 2.1 Interface de Permissões
- Criado componente `UserPermissions` para gerenciar as permissões de cada usuário
- Implementada visualização em cards para cada módulo do sistema
- Adicionados checkboxes para ativar/desativar permissões específicas

#### 2.2 Fluxo de Navegação
- Adicionado botão de "Gerenciar Permissões" na listagem de usuários
- Implementada navegação entre a listagem, o formulário de edição e a tela de permissões
- Adicionados botões de "Voltar" e "Salvar" para facilitar a navegação

## Estrutura de Permissões

O sistema utiliza uma abordagem baseada em módulos e permissões específicas:

| Módulo | Permissões |
|--------|------------|
| Dashboard | Visualizar |
| Usuários | Gerenciar |
| Pesquisas | Criar |
| Relatórios | Visualizar |
| Eventos | Gerenciar |
| Sorteios | Executar |

## Próximos Passos

1. Integrar o componente de permissões com a API do backend para persistência dos dados
2. Implementar validação de permissões nas rotas e componentes da aplicação
3. Adicionar testes automatizados para garantir o funcionamento correto do sistema de permissões
4. Expandir o sistema para suportar permissões mais granulares por módulo

## Considerações Técnicas

- A implementação atual utiliza estados locais para gerenciar as permissões, mas deve ser integrada com o Supabase para persistência
- O sistema foi projetado para ser escalável, permitindo a adição de novos módulos e permissões no futuro
- A interface foi otimizada para dispositivos móveis e desktop, utilizando um layout responsivo