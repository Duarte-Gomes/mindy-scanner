# O Meu Animal Scanner

App Ionic + Capacitor (Angular) que lê o código de barras de um produto e mostra a informação
dele: foto, marca, peso, preço, disponibilidade, categoria e os textos da ficha da loja
(descrição, características, composição, instruções de uso, etc.).

Os produtos vêm da API Mindy (`GET https://mindynode.omeuanimal.pt/api/products`), que os
sincroniza da loja WooCommerce. O código lido é procurado no **EAN** e, se não houver, no **SKU**.

> Os EANs só são sincronizados quando o `mindy-node` tem as chaves `WC_CONSUMER_KEY` /
> `WC_CONSUMER_SECRET` configuradas. Sem elas, só se encontram produtos pelo SKU.

## Desenvolver

```bash
npm install
npm start            # browser em http://localhost:4200 (sem câmara; pesquisa manual)
```

## Correr no telemóvel

```bash
npm run build && npx cap sync
npx cap open ios       # Xcode: escolhe a equipa em Signing & Capabilities e corre no iPhone
npx cap open android   # Android Studio: corre num dispositivo com Google Play services
```

A leitura usa `@capacitor-mlkit/barcode-scanning` (ML Kit) com o ecrã de leitura nativo.
Formatos: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39 e QR.
