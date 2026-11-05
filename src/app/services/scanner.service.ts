import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

// Product barcodes, plus Code 128/39 and QR in case labels with the SKU are used
const FORMATS = [
  BarcodeFormat.Ean13,
  BarcodeFormat.Ean8,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
  BarcodeFormat.Code128,
  BarcodeFormat.Code39,
  BarcodeFormat.QrCode,
];

@Injectable({ providedIn: 'root' })
export class ScannerService {
  /** The camera scanner only exists in the iOS/Android app, not in the browser */
  readonly available = Capacitor.isNativePlatform();

  /** Opens the camera and resolves with the code read, or null when the user cancels */
  async scan(): Promise<string | null> {
    const { supported } = await BarcodeScanner.isSupported();
    if (!supported) throw new Error('Este dispositivo não suporta a leitura de códigos.');

    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera !== 'granted' && camera !== 'limited') {
      throw new Error('É preciso dar acesso à câmara nas definições para ler códigos.');
    }

    // On Android the scanner screen is a Google Play services module, installed on first use
    if (Capacitor.getPlatform() === 'android') {
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        throw new Error('A instalar o leitor de códigos. Tenta de novo dentro de momentos.');
      }
    }

    try {
      const { barcodes } = await BarcodeScanner.scan({ formats: FORMATS });
      return barcodes[0]?.rawValue ?? null;
    } catch (e) {
      // Closing the scanner rejects with "canceled"
      if (String((e as Error)?.message ?? e).toLowerCase().includes('cancel')) return null;
      throw e;
    }
  }
}
