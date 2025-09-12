import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Política de Privacidade e Proteção de Dados
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Informações Gerais</h2>
                <p className="text-gray-700 leading-relaxed">
                  Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                  suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                  e demais regulamentações aplicáveis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Dados Coletados</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Coletamos as seguintes informações quando você preenche nosso formulário:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Nome completo:</strong> Para identificação e contato personalizado</li>
                  <li><strong>Email:</strong> Para comunicação e envio de informações relevantes</li>
                  <li><strong>Telefone:</strong> Para contato direto quando necessário</li>
                  <li><strong>Empresa:</strong> Para contextualização do seu perfil profissional</li>
                  <li><strong>Data e hora do preenchimento:</strong> Para controle interno</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Finalidade do Tratamento</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Utilizamos seus dados pessoais para as seguintes finalidades:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Entrar em contato para apresentar nossos produtos e serviços</li>
                  <li>Enviar informações comerciais relevantes ao seu perfil</li>
                  <li>Realizar análises estatísticas para melhoria dos nossos serviços</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Base Legal</h2>
                <p className="text-gray-700 leading-relaxed">
                  O tratamento dos seus dados pessoais é baseado no seu <strong>consentimento expresso</strong>, 
                  conforme previsto no Art. 7º, I da LGPD, manifestado através do aceite desta política 
                  no momento do preenchimento do formulário.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
                <p className="text-gray-700 leading-relaxed">
                  Seus dados pessoais <strong>não serão compartilhados</strong> com terceiros, exceto:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Para prestadores de serviços essenciais (hospedagem, email), sempre com contratos de confidencialidade</li>
                  <li>Com seu consentimento expresso para finalidades específicas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Armazenamento e Segurança</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controle de acesso restrito aos dados</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Backups seguros e regulares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Retenção de Dados</h2>
                <p className="text-gray-700 leading-relaxed">
                  Seus dados serão mantidos pelo período necessário para cumprir as finalidades descritas, 
                  ou conforme exigido por lei. Você pode solicitar a exclusão dos seus dados a qualquer momento, 
                  exceto quando houver obrigação legal de retenção.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Seus Direitos</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Conforme a LGPD, você possui os seguintes direitos:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Eliminação:</strong> Solicitar a exclusão dos seus dados</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                  <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Como Exercer Seus Direitos</h2>
                <p className="text-gray-700 leading-relaxed">
                  Para exercer qualquer dos seus direitos ou esclarecer dúvidas sobre esta política, 
                  entre em contato conosco através dos seguintes canais:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mt-3">
                  <p><strong>Email:</strong> privacidade@datascope.com.br</p>
                  <p><strong>Telefone:</strong> (11) 9999-9999</p>
                  <p><strong>Endereço:</strong> [Endereço da empresa]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Alterações na Política</h2>
                <p className="text-gray-700 leading-relaxed">
                  Esta política pode ser atualizada periodicamente. Quando isso ocorrer, 
                  notificaremos você através do email cadastrado e a nova versão será disponibilizada 
                  nesta página com a data de atualização.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Autoridade Nacional de Proteção de Dados (ANPD)</h2>
                <p className="text-gray-700 leading-relaxed">
                  Caso não esteja satisfeito com nossas respostas, você pode contatar a ANPD através 
                  do site <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.gov.br/anpd</a> 
                  ou pelos canais oficiais disponibilizados pelo órgão.
                </p>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-600 text-center">
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;