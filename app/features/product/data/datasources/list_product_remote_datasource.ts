// data/datasources/list_product_remote_datasource.ts
import { DatabaseException } from '@/core/errors/exception'
import { ProductModel } from '../models/product_model'

export class ListProductRemoteDatasource {
  constructor(private supabase: any) {}

  async getProducts(): Promise<ProductModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          photo_url,
          price,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(error.message);
      }

      // Utilisation de la méthode statique que nous avons créée dans le modèle
      return ProductModel.fromSupabaseList(data || []);

    } catch (error: any) {
      // Si c'est déjà une DatabaseException, on la relance telle quelle
      if (error instanceof DatabaseException) throw error;

      // Sinon, on encapsule l'erreur inconnue
      throw new DatabaseException(
        error.message || "Erreur lors de la récupération des produits depuis le serveur"
      );
    }
  }
}