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
    
    .success-animation {
      animation: successPulse 2s ease-in-out;
    }
    
    @keyframes successPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .product-card {
      transition: all 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
    
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
      border-radius: 50%;
      animation: confetti-fall 3s linear infinite;
    }
    
    @keyframes confetti-fall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `]
})
export class VentaComponent implements OnInit {
  idCarrito: number | null = null;
  cartItems: CartItem[] = [];
  totalVenta: number = 0;
  showConfetti = true;
  currentDate = new Date();

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiClient: ApiClientService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    // Ocultar confeti después de 3 segundos
    setTimeout(() => {
      this.showConfetti = false;
    }, 3000);
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

  /** Calcula el número total de ítems */
  getTotalItems(): number {
    return this.cartItems
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  /** TrackBy function para optimizar el rendimiento */
  trackByItemId(index: number, item: CartItem): number {
    return item.id;
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