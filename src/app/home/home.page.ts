import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSpinner,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barcodeOutline, searchOutline } from 'ionicons/icons';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Product, ProductsService } from '../services/products.service';
import { ScannerService } from '../services/scanner.service';

const HISTORY_KEY = 'scanner.history';
const HISTORY_SIZE = 15;

interface Recent {
  id: number;
  name: string;
  brand: string;
  weight: string;
  image_url: string;
}

function readHistory(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonSpinner,
    IonThumbnail,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  private products = inject(ProductsService);
  private router = inject(Router);
  private toasts = inject(ToastController);
  readonly scanner = inject(ScannerService);

  code = '';
  readonly busy = signal(false);
  readonly history = signal<Recent[]>(readHistory());

  constructor() {
    addIcons({ barcodeOutline, searchOutline });
    // Loads the catalogue in the background, so the first scan is instant
    this.products.all().catch(() => undefined);
  }

  async scan() {
    try {
      const code = await this.scanner.scan();
      if (code) await this.lookup(code);
    } catch (e) {
      this.toast((e as Error).message || 'Não foi possível ler o código.');
    }
  }

  async search() {
    const code = this.code.trim();
    if (code) await this.lookup(code);
  }

  open(id: number) {
    this.router.navigate(['/product', id]);
  }

  private async lookup(code: string) {
    this.busy.set(true);
    try {
      const product = await this.products.byCode(code);
      if (!product) {
        this.vibrate(NotificationType.Error);
        this.toast(`Nenhum produto com o código ${code}.`);
        return;
      }
      this.vibrate(NotificationType.Success);
      this.code = '';
      this.remember(product);
      this.open(product.id);
    } catch {
      this.toast('Sem ligação à API. Verifica a internet e tenta de novo.');
    } finally {
      this.busy.set(false);
    }
  }

  private remember({ id, name, brand, weight, image_url }: Product) {
    const list = [{ id, name, brand, weight, image_url }, ...this.history().filter((r) => r.id !== id)];
    this.history.set(list.slice(0, HISTORY_SIZE));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history()));
    } catch {
      // History is a convenience; nothing to do when storage is unavailable
    }
  }

  private vibrate(type: NotificationType) {
    Haptics.notification({ type }).catch(() => undefined);
  }

  private async toast(message: string) {
    const toast = await this.toasts.create({ message, duration: 2500, position: 'top' });
    await toast.present();
  }
}
