export const PRODUCT_CATEGORIES = {
  iPhone: [
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
    'iPhone 17', 'iPhone 17 Plus', 'iPhone 17 Pro', 'iPhone 17 Pro Max',
  ],
  MacBook: [
    'MacBook Air M1', 'MacBook Air M2', 'MacBook Air M3',
    'MacBook Pro 14" M1', 'MacBook Pro 14" M2', 'MacBook Pro 14" M3',
    'MacBook Pro 16" M1', 'MacBook Pro 16" M2', 'MacBook Pro 16" M3',
    'MacBook Pro 16" M3 Max', 'MacBook Pro 16" M3 Pro',
  ],
  iPad: [
    'iPad 9ª geração', 'iPad 10ª geração',
    'iPad Air M1', 'iPad Air M2',
    'iPad Pro 11" M4', 'iPad Pro 13" M4',
    'iPad mini 6ª geração',
  ],
  'Apple Watch': [
    'Apple Watch Series 8', 'Apple Watch Series 9', 'Apple Watch Series 10',
    'Apple Watch Ultra', 'Apple Watch Ultra 2',
    'Apple Watch SE 2ª geração',
  ],
  AirPods: [
    'AirPods 3ª geração',
    'AirPods Pro 2ª geração',
    'AirPods Max (USB-C)',
  ],
  Acessórios: [
    'Magic Keyboard', 'Magic Mouse', 'Magic Trackpad',
    'Apple Pencil 2ª geração', 'Apple Pencil USB-C',
    'HomePod', 'HomePod mini',
    'MagSafe Charger', 'Cabo MagSafe 3',
  ],
}

export const ALL_PRODUCTS = Object.entries(PRODUCT_CATEGORIES).flatMap(
  ([category, products]) => products.map((name) => ({ name, category }))
)

export const CATEGORIES = Object.keys(PRODUCT_CATEGORIES)
