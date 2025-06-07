import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  productCount: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    // Simulación de carga de datos
    setTimeout(() => {
      try {
        this.categories = [
          { id: 1, nombre: 'Electrónicos', descripcion: 'Última tecnología y gadgets', productCount: 25 },
          { id: 2, nombre: 'Ropa', descripcion: 'Moda y estilo para todos', productCount: 42 },
          { id: 3, nombre: 'Hogar', descripcion: 'Todo para tu casa', productCount: 18 },
          { id: 4, nombre: 'Deportes', descripcion: 'Vida activa y saludable', productCount: 31 },
          { id: 5, nombre: 'Libros', descripcion: 'Conocimiento y entretenimiento', productCount: 67 },
          { id: 6, nombre: 'Juguetes', descripcion: 'Diversión para toda la familia', productCount: 23 },
          { id: 7, nombre: 'Tecnología', descripcion: 'Innovación y futuro', productCount: 15 },
          { id: 8, nombre: 'Belleza', descripcion: 'Cuidado personal y cosmética', productCount: 38 }
        ];
        this.isLoading = false;
      } catch (error) {
        this.hasError = true;
        this.errorMessage = 'Error al cargar las categorías';
        this.isLoading = false;
      }
    }, 1500);
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Electrónicos': '📱',
      'Ropa': '👕',
      'Hogar': '🏠',
      'Deportes': '⚽',
      'Libros': '📚',
      'Juguetes': '🧸',
      'Tecnología': '💻',
      'Belleza': '💄'
    };
    
    return iconMap[categoryName] || '📦';
  }
} 