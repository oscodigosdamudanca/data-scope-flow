Documento de Requisitos de Produto (PRD) - Aplicação "DataScope"
1. Objetivo e Proposta de Valor A aplicação DataScope será um hub de inteligência de mercado para eventos corporativos. Sua proposta de valor se divide em dois pilares:
Para o Expositor: Proporcionar uma ferramenta ágil e eficiente para captação, qualificação e análise de leads em tempo real, maximizando o retorno sobre o investimento em feiras.
Para a Organização da Feira: Oferecer um sistema estratégico para coletar feedback detalhado e quantificável sobre a experiência de expositores e outros públicos, permitindo melhorias contínuas nas próximas edições do evento.
2. Arquitetura Tecnológica A aplicação será construída sobre uma pilha de tecnologia moderna e escalável:
Frontend: lovable.dev
Backend & Banco de Dados: Supabase
IDE: trae.ai
Integração de IA: API de um modelo de linguagem (como Gemini) para análise de dados e sugestão de perguntas.
3. Funcionalidades da Aplicação (Módulos) A aplicação será estruturada em cinco módulos principais, com acesso controlado por níveis de permissão.
Módulo 1: Captação de Leads e Pesquisa
Formulário "Turbo": Interface simples e rápida para cadastro de visitantes, utilizando perguntas diretas de múltipla escolha para otimizar a experiência do usuário em campo.
Conformidade com a LGPD: Inclusão de um checkbox de consentimento explícito para garantir a permissão de contato dos leads, protegendo a empresa expositora.
Recomendação de Perguntas por IA: A aplicação usará a inteligência artificial para sugerir perguntas de qualificação personalizadas para os expositores, com base no perfil da sua empresa e setor.
Módulo 2: Sorteios
Interface Visual: O sorteio terá uma tela com uma simulação de roleta e um botão "Start" para iniciar o processo.
Sorteio Multi-Prêmios: O administrador da empresa expositora poderá cadastrar múltiplos prêmios. A funcionalidade permitirá sortear ganhadores para o 1º, 2º, 3º lugar, e assim consecutivamente.
Gestão de Prêmios: Será incluído um campo especial no painel do administrador para que o expositor possa cadastrar os produtos ou serviços que serão sorteados, vinculando-os a uma ordem de premiação.
Configuração de Participação: O usuário poderá definir se uma pessoa já sorteada em algum momento deve continuar participando dos sorteios futuros ou se deve ser removida da lista de participantes após ser premiada.
Exibição dos Resultados: Imediatamente após o sorteio, a tela exibirá o nome completo e o número de celular dos ganhadores em suas respectivas posições e prêmios.
Compartilhamento em Redes Sociais: Após o sorteio, a aplicação permitirá que o expositor compartilhe o resultado nas principais redes sociais (Instagram, Facebook e WhatsApp) de forma rápida e intuitiva.
Gatilho de Participação: Somente visitantes que consentiram com a LGPD poderão ser incluídos no sorteio, garantindo a qualificação da lista.
Módulo 3: Painéis de Business Intelligence (B.I.) por Nível de Usuário
Painel do Desenvolvedor: Acesso a um B.I. completo, com todas as informações geradas pela aplicação, de todos os usuários.
Painel do Organizador da Feira: Acesso a um B.I. relacionado à feira no geral e a um B.I. por expositor, permitindo uma análise detalhada do desempenho de cada um durante o evento.
Painel do Administrador (Expositor): Dois tipos de B.I. estarão à sua disposição: um com os dados das perguntas pré-configuradas da aplicação e outro com as informações geradas a partir das perguntas que ele mesmo criou. A visualização dos dados será em tempo real com o auxílio do recurso Realtime do Supabase, e o painel poderá enviar notificações personalizáveis quando leads de alto potencial forem cadastrados.
Gamificação para Entrevistadores: Um ranking será disponibilizado para os administradores, onde os entrevistadores poderão acumular pontos por cada lead captado, gerando uma competição saudável.
Entrevistador: Não terá acesso a nenhum painel de B.I.
Chat de IA para Análise: Integrado ao painel, o chat de IA permitirá que os usuários façam perguntas em linguagem natural para obter análises e insights sobre os dados coletados.
Módulo 4: Feedback da Feira
Formulário de Feedback: Módulo exclusivo para a organização da feira, com um questionário digital baseado nos formulários da Expomarau 2023. O formulário será disponibilizado aos administradores expositores através de um "sininho de notificação" piscante e só poderá ser respondido uma única vez. Ao ser aberto, ele já trará os dados de perfil da empresa preenchidos. As perguntas abrangem a satisfação com a infraestrutura do parque, serviços de limpeza, shows e atrações, entre outros.
Painel de B.I. para a Organização: Relatórios detalhados com gráficos e notas médias sobre a infraestrutura, serviços e organização do evento, proporcionando insights estratégicos para aprimoramento.
Módulo 5: Pesquisas Personalizadas
Formulário Exclusivo: Módulo visível apenas para o Organizador da Feira, permitindo a criação de questionários personalizados para coletar dados de um público selecionado, além dos expositores. As perguntas, respostas e dados de perfil captados neste módulo serão integrados aos painéis de B.I. do Organizador.
4. Estrutura de Usuários e Níveis de Permissão A segurança e a usabilidade da aplicação são garantidas por uma estrutura de controle de acesso baseada em funções (RBAC).
Desenvolvedor: Nível de acesso mais alto, com controle total sobre o banco de dados e todas as funcionalidades da aplicação. Possui sua própria Área de Administração, que inclui:
Configuração de Dados: Inserção e edição de dados do próprio desenvolvedor.
Gestão de Usuários: Habilidade para bloquear e desbloquear usuários, além de resetar senhas para qualquer usuário da plataforma.
Logs de Uso: Acesso a logs detalhados de uso de todos os usuários para monitoramento e auditoria.
Painel de Configuração de Perguntas: Módulo exclusivo para o desenvolvedor, onde ele poderá pré-cadastrar todos os tipos de perguntas (texto curto, texto longo, múltipla escolha, sim/não, etc.). A aplicação analisará de forma imediata a estrutura de cada pergunta para o melhor desenvolvimento dos dashboards de B.I. para os expositores.
Controle de Permissões: Painel de controle para habilitar ou desabilitar módulos e funcionalidades para os demais tipos de usuário.
Organizador da Feira: Acesso exclusivo ao Módulo de Feedback da Feira, ao Módulo de Pesquisas Personalizadas e a um B.I. completo com informações detalhadas sobre a performance geral do evento.
Administrador (Expositor): Acesso completo aos módulos de Captação de Leads, Sorteios e Painel de B.I. da sua empresa. Possui uma área de configuração dedicada, dividida em:
Configuração da Empresa: Permite ao administrador gerenciar informações como logo, nome, razão social, CNPJ, endereço completo, telefone e e-mail.
Gerenciamento de Usuários: Permite ao administrador cadastrar novos entrevistadores, gerenciar seus dados e resetar a senha de cada um.
Reset de Senha Pessoal: O próprio administrador pode resetar sua senha.
Entrevistador: Acesso restrito ao formulário de captação de leads. Não pode visualizar relatórios, sortear ou alterar configurações da conta, garantindo foco na coleta de dados.
A implementação do Row-Level Security (RLS) no Supabase garantirá que cada empresa só tenha acesso aos seus próprios dados, protegendo a confidencialidade e integridade das informações.
5. Plano de Desenvolvimento em Fases (Hierarquia) Para garantir que a equipe da Lovable.dev siga a ordem correta de desenvolvimento, o projeto será executado nas seguintes fases, de forma sequencial e obrigatória:
Fase 1: Fundação e Acesso
Objetivo: Construir a base de autenticação e a estrutura de hierarquia de usuários.
Escopo: Implementação da identidade visual, telas de Login/Cadastro, estrutura de perfis no Supabase e a área de controle do desenvolvedor.
Fase 2: Módulo Essencial
Objetivo: Desenvolver a funcionalidade central de captação de dados e o B.I. básico.
Escopo: Módulo de Captação de Leads, primeira versão do painel de B.I. do Expositor e o painel de configuração de perguntas do Desenvolvedor.
Fase 3: Módulos de Expansão
Objetivo: Adicionar as funcionalidades secundárias e de valor agregado.
Escopo: Módulo de Sorteios, Módulo de Feedback da Feira e Módulo de Pesquisas Personalizadas.
Fase 4: Otimização e Inteligência
Objetivo: Aprimorar a experiência com funcionalidades avançadas.
Escopo: B.I. em tempo real, gamificação, B.I. completo de todos os perfis e a integração do Chat de IA.

