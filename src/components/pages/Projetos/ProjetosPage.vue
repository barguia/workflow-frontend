<template>
  <div>
    <!-- Seção: Destaques de Projetos -->
    <section class="py-16" id="projetos">
      <v-container>
        <h2 class="text-h4 font-weight-bold text-center mb-8 fade-in">Projetos que Impactam</h2>

        <v-row>
          <projeto-card-component
              v-for="(project, idx) in projects"
              :key="project.titulo"
              :project="project"
              :index="idx"
              :expanded-index="expandedProject"
              @toggle="toggleProject"
          />
        </v-row>
<!--        <v-list class="projects-list">-->
<!--          <div v-for="(project, idx) in projects" :key="idx" class="project-containers">-->
<!--            <v-list-item-->
<!--                @click="toggleProject(idx)"-->
<!--                class="project-item text-wrap"-->
<!--                :title="project.titulo"-->
<!--            >-->
<!--              <v-icon :icon="expandedProject === idx ? 'mdi-chevron-up' : 'mdi-chevron-down'"/>-->
<!--            </v-list-item>-->
<!--            <v-expand-transition>-->
<!--              <div v-if="expandedProject === idx" class="project-details text-wrap">-->
<!--                <projeto-detalhe-component :project="project"/>-->
<!--              </div>-->
<!--            </v-expand-transition>-->
<!--          </div>-->
<!--        </v-list>-->

        <p class="mt-8 text-center fade-in">Pronto para o próximo sucesso? <a href="/contatos" class="text-blue-600 hover:underline">Entre em contato conosco</a>.</p>
      </v-container>
    </section>

    <!-- Nova Seção: Nossas Tecnologias -->
    <section class="py-16" style="background-color: #ffffff;">
      <v-container>
        <h2 class="text-h4 font-weight-bold text-center mb-8 fade-in">Nossas Tecnologias</h2>
        <p class="text-h6 text-center mb-6 fade-in">Utilizamos ferramentas modernas e robustas para entregar soluções escaláveis, seguras e inovadoras, com destaque para IA generativa e automação.</p>
        <v-row>
          <tecnologia-component v-for="(tecnologia, idx) in tecnologias" :key="idx"
              :title="tecnologia.titulo"
              :text="tecnologia.descricao"
          />
        </v-row>
      </v-container>
    </section>
  </div>
</template>


<script>
import {ref} from 'vue';

import TecnologiaComponent from "@/components/pages/Projetos/Components/TecnologiaComponent.vue";
import ProjetoCardComponent from "@/components/pages/Projetos/Components/ProjetoCardComponent.vue";
export default {
  components: {ProjetoCardComponent, TecnologiaComponent},
  setup() {
    const expandedProject = ref(null);
    const tecnologias = ref([
      {
        titulo: 'Laravel',
        descricao: 'Framework PHP para aplicações web rápidas e seguras.',
      },
      {
        titulo: 'Vue.js',
        descricao: 'Interfaces dinâmicas e interativas para experiências modernas.',
      },
      {
        titulo: 'Kafka',
        descricao: 'Escalabilidade para fluxos de dados em tempo real.',
        alt: 'Kafka',
        src: 'imgs/tecnologias/kafka-escalabilidade.png',
      },
      {
        titulo: 'Apache Airflow',
        descricao: 'Automação eficiente de pipelines ETL.',
        alt: 'Apache Airflow',
        src: 'imgs/tecnologias/airflow-etl.png',
      },
      {
        titulo: 'Python',
        descricao: 'Versatilidade para automações e IA generativa.',
      },
      {
        titulo: 'MySQL',
        descricao: 'Banco de dados robusto para gestão eficiente.',
      },
    ]);
    const projects = ref([
      {
        titulo: 'Otimização de Agendamentos',
        resumo: 'Gestão de filas, controle de produtividade.',
        imagem: 'imgs/table-critical.webp',
        tecnologia: 'Laravel, AngularJS, MySQL',
        detalhes: [
          {
            titulo: 'Fila de Agendamentos com Priorização',
            descricao: 'Organiza filas de clientes para agendamento, aplicando níveis de prioridade e métricas de produtividade para acompanhar o desempenho das equipes.',
          },
          {
            title: 'Análise Automatizada de Propostas',
            description: 'Permite ao administrador definir regras para análise automática, agilizando o fluxo de trabalho e reduzindo a sobrecarga manual.',
          },
          {
            title: 'Gestão de Chamados e Controle de Agendas',
            description: 'Fornece uma visão completa das cotas e agendas para uma equipe especializada e integra o sistema a uma plataforma legada.',
          },
        ],
      },
      {
        titulo: 'Gestão de Cadeia de Valor',
        resumo: 'Fluxos configuráveis sem código, dashboards interativos e integrações flexíveis.',
        imagem: 'imgs/flow-process.webp',
        tecnologia: 'Laravel, Vue, Kafka',
        detalhes: [
          {
            titulo: 'Configuração de Fluxos sem Necessidade de Código',
            descricao: 'Permite que a equipe de gestão configure processos sem alterar o código, organizando a estrutura em macroprocessos, processos e tarefas.',
          },
          {
            titulo: 'Controle de Acesso e Gestão de Filas de Trabalho',
            descricao: 'Controle de acesso por áreas e equipes, garantindo um fluxo hierárquico que se adapta às operações.',
          },
          {
            titulo: 'Integrações Flexíveis com Sistemas Legados',
            descricao: 'Integra com sistemas internos configuráveis pelo administrador sem necessidade de mudanças no código.',
          },
          {
            titulo: 'Dashboards Interativos e Indicadores de Desempenho',
            descricao: 'Painéis que monitoram indicadores em tempo real, facilitando a análise de desempenho e tomada de decisões.',
          },
        ],
      },
      {
        titulo: 'Gestão de Produção',
        resumo: 'Controle de clientes, fornecedores e relatórios mensais automatizados.',
        imagem: 'imgs/gestao.webp',
        tecnologia: 'Laravel, MySQL, Bootstrap',
        detalhes: [
          {
            titulo: 'Gestão de Clientes e Fornecedores',
            descricao: 'Permite o cadastro, atualização e visualização de informações sobre clientes e fornecedores, oferecendo uma visão completa de cada relacionamento.',
          },
          {
            titulo: 'Controle de Produção por Cliente',
            descricao: 'Facilita o monitoramento das produções específicas para cada cliente, permitindo que o gestor acompanhe o progresso e desempenho das atividades de produção.',
          },
          {
            titulo: 'Geração de Relatórios Mensais',
            descricao: 'Automatiza a criação de relatórios mensais detalhados de produção, fornecendo informações para análise e acompanhamento de produtividade ao longo do tempo.',
          },
        ],
      },


      {
        titulo: 'Automação de ETL',
        resumo: 'Pipeline eficiente para extração, transformação e carregamento de dados com Apache Airflow.',
        imagem: 'imgs/tecnologias/etl.png',
        tecnologia: 'Apache Airflow, Python',
        detalhes: [
          {
            titulo: 'Extração de Dados',
            descricao: 'Automatiza a coleta de dados de múltiplas fontes, como APIs, bancos de dados e arquivos CSV, garantindo integração eficiente e confiável.',
          },
          {
            titulo: 'Transformação Personalizada',
            descricao: 'Permite a aplicação de regras de negócio para limpeza, agregação e enriquecimento de dados, otimizando os dados para análises.',
          },
          {
            titulo: 'Carregamento Automatizado',
            descricao: 'Gerencia o carregamento de dados processados em data warehouses ou bancos de dados, com agendamento e monitoramento via Airflow.',
          },
        ],
      },
      {
        titulo: 'Escalabilidade com Kafka',
        resumo: 'Automação robusta e escalável usando Kafka e Supervisor.',
        imagem: 'imgs/tecnologias/kafka-escalabilidade.png',
        tecnologia: 'Kafka, Supervisor',
        detalhes: [
          {
            titulo: 'Processamento em Tempo Real',
            descricao: 'Utiliza Kafka para gerenciar fluxos de dados em tempo real, permitindo o processamento contínuo de grandes volumes de informações.',
          },
          {
            titulo: 'Escalabilidade Horizontal',
            descricao: 'Permite a adição de novos nós ao cluster Kafka para suportar o aumento de carga, garantindo desempenho estável em alta escala.',
          },
          {
            titulo: 'Gerenciamento de Processos',
            descricao: 'Emprega Supervisor para monitoramento e reinicialização automática de processos, assegurando alta disponibilidade do sistema.',
          },
        ],
      },
      {
        titulo: 'Gestão de Chamados',
        resumo: 'Sistema para ordens de serviço com rastreamento e priorização.',
        imagem: 'imgs/tecnologias/service-desk.png',
        tecnologia: 'Laravel, Vue',
        detalhes: [
          {
            titulo: 'Criação e Rastreamento de Chamados',
            descricao: 'Permite a abertura de ordens de serviço com rastreamento em tempo real, incluindo status, responsável e histórico de interações.',
          },
          {
            titulo: 'Priorização Inteligente',
            descricao: 'Classifica chamados com base em urgência e impacto, utilizando regras configuráveis para otimizar o atendimento.',
          },
          {
            titulo: 'Interface Interativa',
            descricao: 'Oferece uma interface amigável em Vue para visualização e gerenciamento de chamados, com filtros e dashboards personalizados.',
          },
        ],
      },
      {
        titulo: 'Chatbot com WhatsApp',
        resumo: 'Chatbot integrado ao WhatsApp para atendimento automatizado.',
        imagem: 'imgs/tecnologias/whatsapp.png',
        tecnologia: 'Laravel, WhatsApp API',
        detalhes: [
          {
            titulo: 'Atendimento Automatizado',
            descricao: 'Responde perguntas frequentes e realiza ações como agendamentos ou consultas de status diretamente no WhatsApp, 24/7.',
          },
          {
            titulo: 'Integração com Sistemas',
            descricao: 'Conecta-se a bancos de dados e APIs via Laravel para fornecer respostas personalizadas baseadas em dados do cliente.',
          },
          {
            titulo: 'Gestão de Conversas',
            descricao: 'Permite o acompanhamento e análise de interações do chatbot, com relatórios de engajamento e satisfação do usuário.',
          },
        ],
      },
      {
        titulo: 'Integração com IA',
        resumo: 'Soluções com IA generativa (ChatGPT, Grok, etc.) para automação inteligente.',
        imagem: 'imgs/tecnologias/llms.png',
        tecnologia: 'Python, Langchain',
        detalhes: [
          {
            titulo: 'Automação Inteligente',
            descricao: 'Utiliza modelos de linguagem (LLMs) para automatizar tarefas como geração de conteúdo, análise de dados e respostas contextuais.',
          },
          {
            titulo: 'Escalabilidade e Monitoramento',
            descricao: 'Oferece pipelines escaláveis em Python para processamento de grandes volumes de dados, com monitoramento de performance e resultados.',
          },
        ],
      },
    ]);

    const toggleProject = (idx) => {
      expandedProject.value = expandedProject.value === idx ? null : idx;
    };

    return {
      projects,
      tecnologias,
      expandedProject,
      toggleProject,
    };
  },
};
</script>

<style scoped>
.project-item {
  cursor: pointer;
  background: #c3c3c3;
}

.projects-section {
  padding: 20px;
}

.projects-title {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.text-paragraph {
  margin: 10px 0;
  color: #555;
  line-height: 1.6;
}

.projects-list {
  padding: 0;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.project-container {
  border-bottom: 1px solid #e0e0e0;
}

.project-item {
  cursor: pointer;
  padding: 10px;
  transition: background-color 0.3s ease;
}

.project-item:hover {
  background-color: #f0f0f0;
}

.project-title {
  font-weight: bold;
  color: #2c3e50;
  white-space: normal;
}

.project-subtitle {
  color: #7f8c8d;
  white-space: normal;
}

.project-details {
  padding: 10px 20px;
  background-color: #c3c3c3;
  color: #555;
  transition: all 0.3s ease;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 600px) {
  .project-item {
    flex-direction: column; /* Coloca título e subtítulo em linhas separadas */
    align-items: flex-start;
  }

  .project-title {
    font-size: 1.1em; /* Ajuste do tamanho do título */
    margin-bottom: 4px;
  }

  .project-subtitle {
    font-size: 0.9em; /* Tamanho menor para subtítulo em telas pequenas */
    color: #7f8c8d;
  }
}
</style>
