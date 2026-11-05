import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { Product, ProductsService } from '../services/products.service';

// Long texts of the product page, in the order the store shows them
const SECTIONS: { key: keyof Product; title: string }[] = [
  { key: 'description', title: 'Descrição' },
  { key: 'characteristics', title: 'Características' },
  { key: 'composition', title: 'Composição' },
  { key: 'nutrition', title: 'Conteúdo nutricional' },
  { key: 'daily_doses', title: 'Doses diárias' },
  { key: 'usage_instructions', title: 'Instruções de uso' },
  { key: 'precautions', title: 'Precauções' },
];

@Component({
  selector: 'app-product',
  templateUrl: 'product.page.html',
  styleUrls: ['product.page.scss'],
  imports: [
    CurrencyPipe,
    IonAccordion,
    IonAccordionGroup,
    IonBackButton,
    IonBadge,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class ProductPage {
  private products = inject(ProductsService);

  /** Route parameter */
  readonly id = input.required({ transform: numberAttribute });

  readonly product = resource({
    params: () => this.id(),
    loader: ({ params }) => this.products.byId(params),
  });

  readonly sections = computed(() => {
    const p = this.product.value();
    if (!p) return [];
    return SECTIONS.map((s) => ({ ...s, html: String(p[s.key] ?? '').trim() })).filter((s) => s.html);
  });

  readonly details = computed(() => {
    const p = this.product.value();
    if (!p) return [];
    return [
      ['Categoria', [p.category, p.subcategory].filter(Boolean).join(' › ')],
      ['Idade', p.age],
      ['Tamanho', p.size],
      ['SKU', p.sku],
      ['EAN', p.ean],
    ].filter(([, value]) => value);
  });

  /** Badge colour of the availability text the store gives */
  stockColor(p: Product) {
    if (p.stock_quantity !== null) return p.stock_quantity > 0 ? 'success' : 'danger';
    if (/esgotado|sem stock/i.test(p.stock_status)) return 'danger';
    if (/encomenda/i.test(p.stock_status)) return 'warning';
    return 'success';
  }
}
