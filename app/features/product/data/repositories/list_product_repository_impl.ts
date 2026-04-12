// data/repositories/list_product_repository_impl.ts
import { ListProductRemoteDatasource } from '../datasources/list_product_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListProductRepository } from '../../domain/repository/list_product_repository'
import type { Product } from '../../domain/entities/product'
import { useApi } from '@/core/constants/supabase_client'

export class ListProductRepositoryImpl implements ListProductRepository {
  private datasource: ListProductRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListProductRemoteDatasource(supabase)
  }

  /**
   * Récupère la liste des produits et gère les erreurs via DatabaseFailure
   */
  async getProducts(): Promise<Product[] | DatabaseFailure> {
    try {
      const products = await this.datasource.getProducts()
      return products;
      
    } catch (error: any) {
      // Conversion de l'exception technique en Failure pour le domaine
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      
      return new DatabaseFailure(
        error.message || "Erreur lors de la récupération des produits."
      )
    }
  }
}