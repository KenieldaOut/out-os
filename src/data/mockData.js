// ─── DASHBOARD CHARTS ──────────────────────────────────────────────────────────

export const salesChartData = {
  hoje: [
    { name: '08h', faturamento: 4500, vendas: 2 },
    { name: '10h', faturamento: 1299, vendas: 1 },
    { name: '12h', faturamento: 8700, vendas: 3 },
    { name: '14h', faturamento: 6200, vendas: 2 },
    { name: '16h', faturamento: 12000, vendas: 4 },
    { name: '18h', faturamento: 3500, vendas: 1 },
  ],
  semana: [
    { name: 'Seg', faturamento: 24500, vendas: 8 },
    { name: 'Ter', faturamento: 38200, vendas: 12 },
    { name: 'Qua', faturamento: 21300, vendas: 7 },
    { name: 'Qui', faturamento: 45600, vendas: 15 },
    { name: 'Sex', faturamento: 62000, vendas: 20 },
    { name: 'Sáb', faturamento: 54800, vendas: 18 },
    { name: 'Dom', faturamento: 15200, vendas: 5 },
  ],
  mes: [
    { name: 'Sem 1', faturamento: 138000, vendas: 45 },
    { name: 'Sem 2', faturamento: 159000, vendas: 52 },
    { name: 'Sem 3', faturamento: 116000, vendas: 38 },
    { name: 'Sem 4', faturamento: 187000, vendas: 61 },
  ],
  ano: [
    { name: 'Jan', faturamento: 445000, vendas: 145 },
    { name: 'Fev', faturamento: 405000, vendas: 132 },
    { name: 'Mar', faturamento: 515000, vendas: 168 },
    { name: 'Abr', faturamento: 580000, vendas: 189 },
    { name: 'Mai', faturamento: 617000, vendas: 201 },
    { name: 'Jun', faturamento: 546000, vendas: 178 },
    { name: 'Jul', faturamento: 598000, vendas: 195 },
    { name: 'Ago', faturamento: 678000, vendas: 221 },
    { name: 'Set', faturamento: 607000, vendas: 198 },
    { name: 'Out', faturamento: 718000, vendas: 234 },
    { name: 'Nov', faturamento: 819000, vendas: 267 },
    { name: 'Dez', faturamento: 958000, vendas: 312 },
  ],
}

export const kpiData = {
  hoje: { faturamento: 36200, vendas: 13, ticketMedio: 2784, clientesNovos: 5 },
  semana: { faturamento: 261600, vendas: 85, ticketMedio: 3078, clientesNovos: 32 },
  mes: { faturamento: 600000, vendas: 196, ticketMedio: 3061, clientesNovos: 78 },
  ano: { faturamento: 7486000, vendas: 2440, ticketMedio: 3068, clientesNovos: 876 },
}

export const cashFlowData = [
  { month: 'Jan', entradas: 445000, saidas: 268500 },
  { month: 'Fev', entradas: 405000, saidas: 225000 },
  { month: 'Mar', entradas: 515000, saidas: 289000 },
  { month: 'Abr', entradas: 580000, saidas: 310000 },
  { month: 'Mai', entradas: 617000, saidas: 335000 },
  { month: 'Jun', entradas: 546000, saidas: 298000 },
  { month: 'Jul', entradas: 598000, saidas: 312000 },
  { month: 'Ago', entradas: 678000, saidas: 378000 },
  { month: 'Set', entradas: 607000, saidas: 325000 },
  { month: 'Out', entradas: 718000, saidas: 390000 },
  { month: 'Nov', entradas: 819000, saidas: 440000 },
  { month: 'Dez', entradas: 958000, saidas: 510000 },
]

// ─── CLIENTES ────────────────────────────────────────────────────────────────

export const initialClients = [
  { id: '1', name: 'Carlos Silva', phone: '(11) 99999-1234', email: 'carlos@email.com', date: '2024-01-15' },
  { id: '2', name: 'Ana Souza', phone: '(11) 98888-5678', email: 'ana@email.com', date: '2024-01-18' },
  { id: '3', name: 'Roberto Lima', phone: '(11) 97777-9012', email: 'roberto@email.com', date: '2024-01-20' },
  { id: '4', name: 'Fernanda Costa', phone: '(11) 96666-3456', email: 'fernanda@email.com', date: '2024-01-22' },
  { id: '5', name: 'Pedro Alves', phone: '(11) 95555-7890', email: 'pedro@email.com', date: '2024-01-25' },
  { id: '6', name: 'Juliana Martins', phone: '(11) 94444-2345', email: 'juliana@email.com', date: '2024-02-01' },
]

// ─── VENDAS ──────────────────────────────────────────────────────────────────
// totalValue é a soma de payments[].value

export const initialSales = [
  {
    id: '1', clientName: 'Carlos Silva', product: 'iPhone 15 Pro',
    totalValue: 8999, payments: [{ type: 'Cartão Crédito', value: 8999 }],
    status: 'pago', date: '2026-04-10',
  },
  {
    id: '2', clientName: 'Ana Souza', product: 'MacBook Air M2',
    totalValue: 12999, payments: [{ type: 'PIX', value: 12999 }],
    status: 'pago', date: '2026-04-12',
  },
  {
    id: '3', clientName: 'Roberto Lima', product: 'iPad Pro 11" M4',
    totalValue: 9499, payments: [{ type: 'Cartão Débito', value: 9499 }],
    status: 'pendente', date: '2026-04-14',
  },
  {
    id: '4', clientName: 'Fernanda Costa', product: 'Apple Watch Series 9',
    totalValue: 4299, payments: [{ type: 'PIX', value: 4299 }],
    status: 'pago', date: '2026-04-17',
  },
  {
    id: '5', clientName: 'Pedro Alves', product: 'AirPods Pro 2ª geração',
    totalValue: 2299,
    payments: [{ type: 'Dinheiro', value: 1000 }, { type: 'PIX', value: 1299 }],
    status: 'pendente', date: '2026-04-19',
  },
  {
    id: '6', clientName: 'Juliana Martins', product: 'iPhone 15',
    totalValue: 6999, payments: [{ type: 'PIX', value: 6999 }],
    status: 'pago', date: '2026-04-21',
  },
  {
    id: '7', clientName: 'Marcos Paulo', product: 'MacBook Pro 14" M3',
    totalValue: 19999,
    payments: [{ type: 'Cartão Crédito', value: 10000 }, { type: 'PIX', value: 9999 }],
    status: 'pago', date: '2026-04-22',
  },
  {
    id: '8', clientName: 'Larissa Mendes', product: 'iPhone 15 Plus',
    totalValue: 7999, payments: [{ type: 'Cartão Crédito', value: 7999 }],
    status: 'pendente', date: '2026-04-23',
  },
]

// ─── CRM ─────────────────────────────────────────────────────────────────────
// Pipeline: novo-lead → negociacao → follow-up → fechado / perdido

export const initialCRMData = {
  'novo-lead': [
    { id: 'c1', name: 'Marcos Paulo', note: 'Muito interessado, já fez cotação online', value: 9499, product: 'iPhone 15 Pro Max', followUpDate: null, lossReason: null },
    { id: 'c2', name: 'Larissa Mendes', note: 'Quer trocar MacBook velho + complementar em dinheiro', value: 12999, product: 'MacBook Air M2', followUpDate: null, lossReason: null },
    { id: 'c3', name: 'Diego Santos', note: 'Perguntou sobre Apple Watch Ultra 2', value: 7999, product: 'Apple Watch Ultra 2', followUpDate: null, lossReason: null },
  ],
  negociacao: [
    { id: 'c4', name: 'Camila Torres', note: 'Aguardando aprovação de crédito no cartão', value: 8999, product: 'iPhone 15 Pro', followUpDate: '2024-04-28', lossReason: null },
    { id: 'c5', name: 'Bruno Ferreira', note: 'Comparando com Samsung Galaxy S24 Ultra', value: 6999, product: 'iPhone 15', followUpDate: null, lossReason: null },
  ],
  'follow-up': [
    { id: 'c8', name: 'Amanda Cruz', note: 'Demonstrou produto, quer pensar mais dois dias', value: 9499, product: 'iPad Pro 11" M4', followUpDate: '2024-04-26', lossReason: null },
    { id: 'c9', name: 'Felipe Rocha', note: 'Aguarda próximo salário para fechar', value: 19999, product: 'MacBook Pro 14" M3', followUpDate: '2024-05-02', lossReason: null },
  ],
  fechado: [
    { id: 'c6', name: 'Patrícia Lima', note: 'Comprou à vista no PIX com desconto de 5%', value: 19999, product: 'MacBook Pro 14" M3', followUpDate: null, lossReason: null },
    { id: 'c7', name: 'Ricardo Oliveira', note: 'Comprou combo: iPhone 15 + AirPods Pro', value: 9298, product: 'iPhone 15', followUpDate: null, lossReason: null },
  ],
  perdido: [
    { id: 'c10', name: 'Thiago Nascimento', note: 'Preferiu comprar online mais barato', value: 8999, product: 'iPhone 15 Pro', followUpDate: null, lossReason: 'Preço — encontrou mais barato em e-commerce' },
  ],
}

// ─── ESTOQUE ────────────────────────────────────────────────────────────────

export const initialInventory = [
  { id: 'inv1', name: 'iPhone 15 Pro', category: 'iPhone', code: '354901234567890', price: 8999, status: 'disponível' },
  { id: 'inv2', name: 'iPhone 15 Pro Max', category: 'iPhone', code: '354901234567891', price: 9499, status: 'disponível' },
  { id: 'inv3', name: 'iPhone 15', category: 'iPhone', code: '354901234567892', price: 6999, status: 'vendido' },
  { id: 'inv4', name: 'MacBook Air M2', category: 'MacBook', code: 'C02XG2JGJGH7', price: 12999, status: 'vendido' },
  { id: 'inv5', name: 'MacBook Pro 14" M3', category: 'MacBook', code: 'C02XG2JGJGH8', price: 19999, status: 'disponível' },
  { id: 'inv6', name: 'iPad Pro 11" M4', category: 'iPad', code: 'DLXWK2QFQKR9', price: 9499, status: 'disponível' },
  { id: 'inv7', name: 'Apple Watch Series 9', category: 'Apple Watch', code: 'H4T7K9M2N1P3', price: 4299, status: 'vendido' },
  { id: 'inv8', name: 'AirPods Pro 2ª geração', category: 'AirPods', code: 'H4T7K9M2N1P4', price: 2299, status: 'disponível' },
  { id: 'inv9', name: 'iPhone 16 Pro', category: 'iPhone', code: '354901234567893', price: 10999, status: 'disponível' },
  { id: 'inv10', name: 'Apple Watch Ultra 2', category: 'Apple Watch', code: 'H4T7K9M2N1P5', price: 7999, status: 'disponível' },
]

// ─── FINANCEIRO ──────────────────────────────────────────────────────────────

export const financialData = {
  entradas: [
    { id: 'e1', description: 'Venda iPhone 15 Pro — Carlos Silva', value: 8999, date: '2024-01-15' },
    { id: 'e2', description: 'Venda MacBook Air M2 — Ana Souza', value: 12999, date: '2024-01-18' },
    { id: 'e3', description: 'Venda iPad Pro M4 — Roberto Lima', value: 9499, date: '2024-01-20' },
    { id: 'e4', description: 'Venda Apple Watch S9 — Fernanda Costa', value: 4299, date: '2024-01-22' },
    { id: 'e5', description: 'Venda AirPods Pro — Pedro Alves', value: 2299, date: '2024-01-25' },
    { id: 'e6', description: 'Venda iPhone 15 — Juliana Martins', value: 6999, date: '2024-02-01' },
    { id: 'e7', description: 'Venda MacBook Pro M3 — Marcos Paulo', value: 19999, date: '2024-02-05' },
  ],
  custoFixo: [
    { id: 'cf1', description: 'Aluguel da loja', value: 8000, date: '2024-01-05' },
    { id: 'cf2', description: 'Salários — 3 vendedores', value: 15000, date: '2024-01-05' },
    { id: 'cf3', description: 'Internet e telefone', value: 450, date: '2024-01-10' },
    { id: 'cf4', description: 'Seguro patrimonial', value: 1200, date: '2024-01-10' },
    { id: 'cf5', description: 'Sistema de gestão (SaaS)', value: 350, date: '2024-01-10' },
  ],
  custoVariavel: [
    { id: 'cv1', description: 'Reposição estoque iPhone 15 Pro (10 un)', value: 71990, date: '2024-01-02' },
    { id: 'cv2', description: 'Reposição estoque MacBook Air (5 un)', value: 54995, date: '2024-01-02' },
    { id: 'cv3', description: 'Comissão vendedores (jan)', value: 3200, date: '2024-01-31' },
    { id: 'cv4', description: 'Marketing digital — Meta Ads', value: 2500, date: '2024-01-15' },
    { id: 'cv5', description: 'Frete e logística', value: 800, date: '2024-01-20' },
  ],
}
