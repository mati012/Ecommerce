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
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .cart-item {
      transition: all 0.3s ease;
    }
    
    .cart-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .quantity-control {
      transition: all 0.2s ease;
    }
    
    .quantity-control:hover {
      transform: scale(1.1);
    }
    
    .checkout-button {
      transition: all 0.3s ease;
    }
    
    .checkout-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }
    
    .empty-cart-animation {
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  `]
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  private idCarrito: number | null = null;
  isCheckingOut = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiClient: ApiClientService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  /** Carga los ítems del carrito desde localStorage */
  loadCart(): void {
    const data = localStorage.getItem('cart');
    this.cartItems = data
      ? JSON.parse(data) as CartItem[]
      : [];
  }

  /** Guarda el carrito en localStorage */
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  /** Calcula el total del carrito */
  getTotal(): number {
    return this.cartItems
      .reduce((sum, item) => sum + item.precio * item.cantidad, 0);
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

  /** Elimina un ítem del carrito */
  removeFromCart(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.saveCart();
  }

  /** Incrementa la cantidad de un ítem */
  incrementQuantity(item: CartItem): void {
    const idx = this.cartItems.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      this.cartItems[idx].cantidad += 1;
      this.saveCart();
    }
  }

  /** Decrementa la cantidad de un ítem */
  decrementQuantity(item: CartItem): void {
    const idx = this.cartItems.findIndex(i => i.id === item.id);
    if (idx >= 0 && this.cartItems[idx].cantidad > 1) {
      this.cartItems[idx].cantidad -= 1;
      this.saveCart();
    } else if (idx >= 0 && this.cartItems[idx].cantidad === 1) {
      this.removeFromCart(item);
    }
  }

  /** Actualiza la cantidad de un ítem */
  updateQuantity(item: CartItem, cantidad: number): void {
    const idx = this.cartItems.findIndex(i => i.id === item.id);
    if (idx >= 0 && cantidad > 0) {
      this.cartItems[idx].cantidad = cantidad;
      this.saveCart();
    } else if (idx >= 0 && cantidad <= 0) {
      this.removeFromCart(item);
    }
  }

  /**
   * Finaliza la compra:
   * 1) genera un ID autoincremental
   * 2) guarda {idCarrito, items} en 'ultimaVenta'
   * 3) limpia el carrito
   * 4) envía la venta al endpoint
   * 5) navega a la vista de detalle de venta
   */
  checkout(): void {
    this.isCheckingOut = true;
    
    // Simular delay para mejor UX
    setTimeout(() => {
      // 1) ID autoincremental
      const lastId = Number(localStorage.getItem('lastSaleId')) || 0;
      this.idCarrito = lastId + 1;
      localStorage.setItem('lastSaleId', this.idCarrito.toString());

      // 2) Prepara el payload (incluye totalVenta)
      const totalVenta = this.getTotal();
      const saleRecord = { 
        idCarrito: this.idCarrito,
        items: this.cartItems,
        totalVenta 
      };

      // 3) Guarda la venta completa en localStorage
      localStorage.setItem('ultimaVenta', JSON.stringify(saleRecord));

      // 4) Envía la venta a tu endpoint
      this.postVenta(saleRecord);

      // 5) Limpia el carrito
      localStorage.removeItem('cart');
      this.cartItems = [];

      // 6) Navega al detalle de la venta
      this.router.navigate(['/venta']);
    }, 1000);
  }

  /**
   * Envía { idCarrito, totalVenta } a tu endpoint para encolarlo
   * Ahora recibe directamente el objeto saleRecord
   */
  private postVenta(sale: { idCarrito: number; totalVenta: number; items: CartItem[] }): void {
    const payload = {
      idCarrito: sale.idCarrito,
      totalVenta: sale.totalVenta
    };
    this.http.post(this.apiClient.endpoints.detalleVenta, payload)
      .subscribe({
        next: res => console.log('Venta enviada con éxito', res),
        error: err => console.error('Error al enviar venta:', err)
      });
  }
}