// domain/repository/list_product_repository.ts
import type { Product } from "../entities/product";
import type { Failure } from '@/core/errors/failure';

export interface ListProductRepository {
  /**
   * Récupère la liste de tous les produits
   * Retourne une liste de produits ou une Failure en cas d'erreur
   */
  getProducts(): Promise<Product[] | Failure>;
}