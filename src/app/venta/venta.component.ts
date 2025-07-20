import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ApiClientService } from '../service/api-client.service';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  descripcion?: string;
  categoria?: string;
}

interface CartItem extends Product {
  cantidad: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class VentaComponent implements OnInit {
  idCarrito: number | null = null;
  cartItems: CartItem[] = [];
  totalVenta: number = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiClient: ApiClientService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  /**  
   * Carga el último carrito guardado en localStorage bajo 'ultimaVenta',  
   * que debe tener la forma { idCarrito: number, items: CartItem[] }  
   */
  private loadCart(): void {
    const raw = localStorage.getItem('ultimaVenta');
    if (!raw) {
      this.cartItems = [];
      this.idCarrito = null;
      this.totalVenta = 0;
      return;
    }

    try {
      const record = JSON.parse(raw) as {
        idCarrito: number;
        items: CartItem[];
        totalVenta: number;
      };

      this.idCarrito = record.idCarrito;
      this.cartItems = Array.isArray(record.items) ? record.items : [];
      this.totalVenta = typeof record.totalVenta === 'number'
        ? record.totalVenta
        : this.cartItems.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    } catch (e) {
      console.error('Error parseando última venta:', e);
      this.cartItems = [];
      this.idCarrito = null;
      this.totalVenta = 0;
    }
  }

  /** Si quieres recalcular en vuelo */
  getTotal(): number {
    return this.totalVenta;
  }

  /** Envía el objeto { idCarrito, totalVenta } a tu endpoint para encolar la venta */
  postVenta(): void {
    if (this.idCarrito === null) {
      console.error('idCarrito no definido');
      return;
    }

    const payload = {
      idCarrito: this.idCarrito,
      totalVenta: this.getTotal()
    };

    this.http.post(this.apiClient.endpoints.detalleVenta, payload)
      .subscribe({
        next: response => {
          console.log('Venta enviada:', response);
          // por ejemplo, navegar a una confirmación
          this.router.navigate(['/products']);
        },
        error: err => {
          console.error('Error al enviar venta:', err);
        }
      });
  }

  /** Regresa al listado de productos */
  backToProducts(): void {
    this.router.navigate(['/products']);
  }
}