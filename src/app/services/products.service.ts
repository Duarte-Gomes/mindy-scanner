import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/** A product as the Mindy API returns it (GET /api/products) */
export interface Product {
  id: number;
  sku: string;
  ean: string;
  name: string;
  brand: string;
  weight: string;
  category: string;
  subcategory: string;
  age: string;
  size: string;
  price: number;
  description: string | null;
  image_url: string;
  stock_status: string;
  stock_quantity: number | null;
  characteristics: string | null;
  composition: string | null;
  nutrition: string | null;
  daily_doses: string | null;
  usage_instructions: string | null;
  precautions: string | null;
}

// The catalogue is small (a few hundred products), so it is read whole and kept for a while
const MAX_AGE_MS = 5 * 60 * 1000;

const normalize = (code: string) => code.trim().toUpperCase();
// EAN-13 "0123456789012" and UPC-A "123456789012" are the same code
const withoutLeadingZeros = (code: string) => code.replace(/^0+/, '');

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Product[] = [];
  private loadedAt = 0;
  private loading?: Promise<Product[]>;

  /** All products, from the cache when it is recent */
  async all(force = false): Promise<Product[]> {
    if (!force && this.products.length && Date.now() - this.loadedAt < MAX_AGE_MS) {
      return this.products;
    }
    this.loading ??= this.load().finally(() => (this.loading = undefined));
    return this.loading;
  }

  async byId(id: number): Promise<Product | undefined> {
    return (await this.all()).find((p) => p.id === id);
  }

  /**
   * The product with this barcode: matched on the EAN first, then on the SKU (for products
   * without an EAN).
   */
  async byCode(code: string): Promise<Product | undefined> {
    const wanted = normalize(code);
    if (!wanted) return undefined;
    const find = (products: Product[]) =>
      products.find((p) => p.ean && withoutLeadingZeros(normalize(p.ean)) === withoutLeadingZeros(wanted)) ??
      products.find((p) => p.sku && normalize(p.sku) === wanted);
    // A product added since the last read is only found after reloading
    return find(await this.all()) ?? find(await this.all(true));
  }

  private async load(): Promise<Product[]> {
    const res = await fetch(`${environment.apiUrl}/products`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`A API respondeu ${res.status}`);
    this.products = await res.json();
    this.loadedAt = Date.now();
    return this.products;
  }
}
