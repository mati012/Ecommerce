import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DefaultBackendService } from '../service/default-backend.service';

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
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;

  constructor(private backendService: DefaultBackendService,private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    this.backendService.consumirBackendGet().subscribe({
      next: (response: any) => {
        this.products = Array.isArray(response) ? response : [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.hasError = true;
        this.errorMessage = 'No se pudieron cargar los productos. Por favor, intenta nuevamente.';
        this.isLoading = false;
        
        // Productos de ejemplo mientras no haya backend
        this.products = [
          { id: 1, nombre: 'Producto de Ejemplo 1', precio: 29990, categoria: 'Electrónicos', descripcion: 'Un producto increíble de alta calidad' },
          { id: 2, nombre: 'Producto de Ejemplo 2', precio: 19990, categoria: 'Ropa', descripcion: 'Estilo y comodidad en una sola prenda' },
          { id: 3, nombre: 'Producto de Ejemplo 3', precio: 39990, categoria: 'Hogar', descripcion: 'Transforma tu hogar con este producto' },
          { id: 4, nombre: 'Producto de Ejemplo 4', precio: 15990, categoria: 'Tecnología', descripcion: 'La última tecnología a tu alcance' }
        ];
        this.hasError = false; // Reset error since we have fallback data
      }
    });
  }

  handleAddToCart(product: Product): void {
    // Recupera el carrito actual desde localStorage (o un array vacío si no existe)
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    // Busca si el producto ya está en el carrito
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      // Si existe, aumenta la cantidad
      existing.cantidad++;
    } else {
      // Si no, lo añade con cantidad inicial de 1
      cart.push({ ...product, cantidad: 1 });
    }

    // Guarda de nuevo el carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Carrito actualizado:', cart);
  }

  goToCart(): void {
    this.router.navigate(['/carrito']);
  }
} 