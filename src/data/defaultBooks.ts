import { Book } from '../types';

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'cf88',
    title: 'Constituição Federal de 1988',
    author: 'Assembleia Nacional Constituinte',
    category: 'Constitucional',
    description: 'A Carta Magna do Brasil, promulgada em 5 de outubro de 1988, que estabelece o Estado Democrático de Direito e assegura os direitos fundamentais do cidadão.',
    coverColor: 'from-blue-700 to-indigo-900',
    chapters: [
      {
        id: 'cf88-cap1',
        title: 'Dos Princípios Fundamentais (Art. 1º ao 4º)',
        paragraphs: [
          'Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político.',
          'Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
          'Art. 2º São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
          'Art. 3º Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.',
          'Art. 4º A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios: I - independência nacional; II - prevalência dos direitos humanos; III - autodeterminação dos povos; IV - não-intervenção; V - igualdade entre os Estados; VI - defesa da paz; VII - solução pacífica dos conflitos; VIII - repúdio ao terrorismo e ao racismo; IX - cooperação entre os povos para o progresso da humanidade; X - concessão de asilo político.'
        ]
      },
      {
        id: 'cf88-cap2',
        title: 'Dos Direitos e Deveres Individuais e Coletivos (Art. 5º - Exc.)',
        paragraphs: [
          'Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
          'I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;',
          'II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;',
          'III - ninguém será submetido a tortura nem a tratamento desumano ou degradante;',
          'IV - é livre a manifestação do pensamento, sendo vedado o anonimato;',
          'V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem;',
          'VI - é inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias;',
          'IX - é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença;',
          'X - são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação;',
          'XI - a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.'
        ]
      }
    ]
  },
  {
    id: 'cc02',
    title: 'Código Civil Brasileiro (Lei 10.406/02)',
    author: 'Congresso Nacional',
    category: 'Civil',
    description: 'A lei que rege as relações jurídicas das pessoas naturais e jurídicas no âmbito privado, abrangendo bens, fatos jurídicos, direito de família, obrigações e sucessões.',
    coverColor: 'from-amber-700 to-amber-950',
    chapters: [
      {
        id: 'cc02-cap1',
        title: 'Da Personalidade e da Capacidade (Art. 1º ao 6º)',
        paragraphs: [
          'Art. 1º Toda pessoa é capaz de direitos e deveres na ordem civil.',
          'Art. 2º A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
          'Art. 3º São absolutamente incapazes de exercer pessoalmente os atos da vida civil os menores de 16 (dezesseis) anos.',
          'Art. 4º São incapazes, relativamente a certos atos ou à maneira de os exercer: I - os maiores de dezesseis e menores de dezoito anos; II - os ébrios habituais e os viciados em tóxico; III - aqueles que, por causa transitória ou permanente, não puderem exprimir sua vontade; IV - os pródigos. Parágrafo único. A capacidade dos indígenas será regulada por legislação especial.',
          'Art. 5º A menoridade cessa aos dezoito anos completos, quando a pessoa fica habilitada para a prática de todos os atos da vida civil.',
          'Art. 6º A existência da pessoa natural termina com a morte; presume-se esta, quanto aos ausentes, nos casos em que a lei autoriza a abertura de sucessão definitiva.'
        ]
      },
      {
        id: 'cc02-cap2',
        title: 'Dos Direitos da Personalidade (Art. 11 ao 15)',
        paragraphs: [
          'Art. 11. Com exceção dos casos previstos em lei, os direitos da personalidade são intransmissíveis e irrenunciáveis, não podendo o seu exercício sofrer limitação voluntária.',
          'Art. 12. Pode-se exigir que cesse a ameaça, ou a lesão, a direito da personalidade, e reclamar perdas e danos, sem prejuízo de outras sanções previstas em lei.',
          'Art. 13. Salvo por exigência médica, é defeso o ato de disposição do próprio corpo, quando importar diminuição permanente da integridade física, ou contrariar os bons costumes.',
          'Art. 14. É válida, com objetivo científico, ou altruístico, a disposição gratuita do próprio corpo, no todo ou em parte, para depois da morte.',
          'Art. 15. Ninguém pode ser constrangido a submeter-se, com risco de vida, a tratamento médico ou a intervenção cirúrgica.'
        ]
      }
    ]
  },
  {
    id: 'cdc90',
    title: 'Código de Defesa do Consumidor',
    author: 'Lei nº 8.078/1990',
    category: 'Consumidor',
    description: 'Normas de proteção e defesa do consumidor, de ordem pública e interesse social, restabelecendo o equilíbrio nas relações de consumo.',
    coverColor: 'from-emerald-700 to-teal-950',
    chapters: [
      {
        id: 'cdc-cap1',
        title: 'Dos Direitos Básicos do Consumidor (Art. 6º)',
        paragraphs: [
          'Art. 6º São direitos básicos do consumidor:',
          'I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados nocivos ou perigosos;',
          'II - a educação e divulgação sobre o consumo adequado dos produtos e serviços, assegurada a liberdade de escolha e a igualdade nas contratações;',
          'III - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;',
          'IV - a proteção contra a publicidade enganosa e abusiva, métodos comerciais coercitivos ou desleais, bem como contra práticas e cláusulas abusivas ou impostas no fornecimento de produtos e serviços;',
          'V - a modificação das cláusulas contratuais que estabeleçam prestações desproporcionais ou sua revisão em razão de fatos supervenientes que as tornem excessivamente onerosas;',
          'VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos;',
          'VII - o acesso aos órgãos judiciários e administrativos com vistas à prevenção ou reparação de danos, assegurada a proteção Jurídica, administrativa e técnica aos necessitados;',
          'VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiência.'
        ]
      },
      {
        id: 'cdc-cap2',
        title: 'Das Práticas Abusivas (Art. 39 - Exc.)',
        paragraphs: [
          'Art. 39. É vedado ao fornecedor de produtos ou serviços, dentre outras práticas abusivas:',
          'I - condicionar o fornecimento de produto ou de serviço ao fornecimento de outro produto ou serviço, bem como, sem justa causa, a limites quantitativos (venda casada);',
          'II - recusar atendimento às demandas dos consumidores, na exata medida de suas disponibilidades de estoque, e, ainda, de conformidade com os usos e costumes;',
          'III - enviar ou entregar ao consumidor, sem solicitação prévia, qualquer produto, ou fornecer qualquer serviço;',
          'IV - prevalecer-se da fraqueza ou ignorância do consumidor, tendo em vista sua idade, saúde, conhecimento ou condição social, para impingir-lhe seus produtos ou serviços;',
          'V - exigir do consumidor vantagem manifestamente excessiva;',
          'VI - executar serviços sem a prévia elaboração de orçamento e autorização expressa do consumidor, ressalvadas as decorrentes de práticas anteriores entre as partes.'
        ]
      }
    ]
  },
  {
    id: 'lgpd18',
    title: 'Lei Geral de Proteção de Dados (LGPD)',
    author: 'Lei nº 13.709/2018',
    category: 'Digital / Privacidade',
    description: 'Lei federal que regulamenta as atividades de tratamento de dados pessoais de cidadãos no Brasil, tanto por pessoas físicas quanto jurídicas de direito público ou privado.',
    coverColor: 'from-purple-700 to-purple-950',
    chapters: [
      {
        id: 'lgpd-cap1',
        title: 'Dos Princípios do Tratamento de Dados (Art. 6º)',
        paragraphs: [
          'Art. 6º As atividades de tratamento de dados pessoais deverão observar a boa-fé e os seguintes princípios:',
          'I - finalidade: realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular, sem possibilidade de tratamento posterior de forma incompatível com essas finalidades;',
          'II - adequação: compatibilidade do tratamento com as finalidades informadas ao titular, de acordo com o contexto do tratamento;',
          'III - necessidade: limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos em relação às finalidades do tratamento de dados;',
          'IV - livre acesso: garantia, aos titulares, de consulta facilitada e gratuita sobre a forma e a duração do tratamento, bem como sobre a integralidade de seus dados pessoais;',
          'V - qualidade dos dados: garantia, aos titulares, de exatidão, clareza, relevância e atualização dos dados, de acordo com a necessidade e para o cumprimento da finalidade de seu tratamento;',
          'VI - transparência: garantia, aos titulares, de informações claras, precisas e facilmente acessíveis sobre a realização do tratamento e os respectivos agentes de tratamento, observados os segredos comercial e industrial;'
        ]
      },
      {
        id: 'lgpd-cap2',
        title: 'Dos Direitos do Titular (Art. 18)',
        paragraphs: [
          'Art. 18. O titular dos dados pessoais tem direito a obter do controlador, em relação aos dados do titular por ele tratados, a qualquer momento e mediante requisição:',
          'I - confirmação da existência de tratamento;',
          'II - acesso aos dados;',
          'III - correção de dados incompletos, inexatos ou desatualizados;',
          'IV - anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto nesta Lei;',
          'V - portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa, de acordo com a regulamentação da autoridade nacional, observados os segredos comercial e industrial;',
          'VI - eliminação dos dados pessoais tratados com o consentimento do titular, exceto nas hipóteses previstas no art. 16 desta Lei;',
          'VII - informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;',
          'VIII - informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;'
        ]
      }
    ]
  }
];
