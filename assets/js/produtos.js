/* =========================================================
   Júnior Tech · CATÁLOGO DE PRODUTOS
   ---------------------------------------------------------
   Este é o único arquivo que precisa ser editado para
   atualizar produtos, preços e promoções.

   Campos de cada produto:
     id          identificador único (sem espaços nem acentos)
     categoria   uma das chaves de CATEGORIAS abaixo
     nome        nome do produto como aparece no site
     imagem      nome do arquivo em assets/img/produtos/ (sem .webp)
                 ou null quando ainda não houver foto
     icone       ícone usado quando não há foto
     preco       preço atual em reais, ex.: 39.9   (null = "Consulte o preço")
     precoAnterior  preencha SOMENTE se houver promoção real.
                 Precisa ser maior que "preco". Ex.: preco 29.9 e
                 precoAnterior 39.9 mostram o valor riscado e o
                 desconto calculado automaticamente.
     disponivel  true = "Disponível", false = "Indisponível",
                 null = não mostra nada
     destaque    true = aparece na seção "Em destaque"

   Use ponto como separador decimal (39.9, não 39,90).
   ========================================================= */
window.JT_CATALOGO = {

  categorias: {
    capinhas: {
      nome: 'Capinhas e películas',
      curto: 'Capinhas',
      descricao: 'Capinha e película de vidro para o seu modelo de celular.',
      imagem: 'cat-capinhas',
      principal: true
    },
    carregadores: {
      nome: 'Carregadores e cabos',
      curto: 'Carregadores',
      descricao: 'Carregador turbo USB-C, cabo reforçado, carregador veicular e power bank.',
      imagem: 'cat-carregadores',
      principal: true
    },
    fones: {
      nome: 'Fones de ouvido',
      curto: 'Fones',
      descricao: 'Bluetooth TWS, com fio P2, esportivo e headset gamer.',
      imagem: 'cat-fones',
      principal: true
    },
    outros: {
      nome: 'Outros acessórios',
      curto: 'Outros',
      descricao: 'Suporte veicular e smartwatch.',
      imagem: null,
      principal: true
    },
    sons: {
      nome: 'Caixas de som',
      curto: 'Caixas de som',
      descricao: 'Caixas Bluetooth compactas, portáteis grandes, mini speaker USB e soundbar.',
      imagem: 'cat-sons',
      principal: false
    },
    perfumes: {
      nome: 'Perfumes',
      curto: 'Perfumes',
      descricao: 'Contratipos masculinos, femininos e unissex, e kit com nécessaire.',
      imagem: 'cat-perfumes',
      principal: false
    }
  },

  produtos: [
    // ---------- Capinhas e películas ----------
    { id: 'capinha', categoria: 'capinhas', nome: 'Capinha de Celular', imagem: 'capinha', preco: null, precoAnterior: null, disponivel: null, destaque: true },
    { id: 'pelicula', categoria: 'capinhas', nome: 'Película de Vidro', imagem: null, icone: 'pelicula', preco: null, precoAnterior: null, disponivel: null, destaque: false },

    // ---------- Carregadores e cabos ----------
    { id: 'carregador-turbo', categoria: 'carregadores', nome: 'Carregador Turbo USB-C', imagem: 'carregador-turbo', preco: null, precoAnterior: null, disponivel: null, destaque: true },
    { id: 'cabo-reforcado', categoria: 'carregadores', nome: 'Cabo Reforçado', imagem: 'cabo-reforcado', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'carregador-veicular', categoria: 'carregadores', nome: 'Carregador Veicular', imagem: 'carregador-veicular', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'power-bank', categoria: 'carregadores', nome: 'Power Bank', imagem: null, icone: 'bateria', preco: null, precoAnterior: null, disponivel: null, destaque: false },

    // ---------- Fones de ouvido ----------
    { id: 'fone-tws', categoria: 'fones', nome: 'Fone Bluetooth TWS', imagem: 'fone-tws', preco: null, precoAnterior: null, disponivel: null, destaque: true },
    { id: 'fone-fio', categoria: 'fones', nome: 'Fone com Fio P2', imagem: 'fone-fio', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'headset-gamer', categoria: 'fones', nome: 'Headset Gamer', imagem: 'headset-gamer', preco: null, precoAnterior: null, disponivel: null, destaque: true },
    { id: 'fone-esportivo', categoria: 'fones', nome: 'Fone Bluetooth Esportivo', imagem: 'fone-esportivo', preco: null, precoAnterior: null, disponivel: null, destaque: false },

    // ---------- Outros acessórios ----------
    { id: 'suporte-veicular', categoria: 'outros', nome: 'Suporte Veicular', imagem: null, icone: 'suporte', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'smartwatch', categoria: 'outros', nome: 'Relógio Smartwatch', imagem: null, icone: 'relogio', preco: null, precoAnterior: null, disponivel: null, destaque: false },

    // ---------- Caixas de som ----------
    { id: 'caixa-compacta', categoria: 'sons', nome: 'Caixa de Som Bluetooth Compacta', imagem: 'caixa-compacta', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'caixa-grande', categoria: 'sons', nome: 'Caixa de Som Portátil Grande', imagem: 'caixa-grande', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'mini-speaker', categoria: 'sons', nome: 'Mini Speaker USB', imagem: 'mini-speaker', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'soundbar', categoria: 'sons', nome: 'Soundbar Compacta', imagem: 'soundbar', preco: null, precoAnterior: null, disponivel: null, destaque: false },

    // ---------- Perfumes ----------
    { id: 'perfume-masculino', categoria: 'perfumes', nome: 'Perfume Masculino Contratipo', imagem: 'perfume-masculino', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'perfume-feminino', categoria: 'perfumes', nome: 'Perfume Feminino Contratipo', imagem: 'perfume-feminino', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'perfume-unissex', categoria: 'perfumes', nome: 'Perfume Unissex', imagem: 'perfume-unissex', preco: null, precoAnterior: null, disponivel: null, destaque: false },
    { id: 'perfume-kit', categoria: 'perfumes', nome: 'Kit Perfume + Nécessaire', imagem: 'perfume-kit', preco: null, precoAnterior: null, disponivel: null, destaque: false }
  ]
};
