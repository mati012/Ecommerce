import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultBackendService } from '../service/default-backend.service';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  descripcion?: string;
  categoria?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private backendService: DefaultBackendService) {}

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
    console.log('Agregado al carrito:', product);
    // Aquí integrarás con el servicio del carrito más adelante
  }
} 