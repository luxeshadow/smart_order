import type { UseCase } from '@/core/usecase/usecase'
import type { Product } from "../../domain/entities/product";
import { Failure } from '@/core/errors/failure';
import type { ListProductRepository } from "../../domain/repository/list_product_repository";

export class ListProductUseCase implements UseCase<Product[] | Failure, void> {
  private repository: ListProductRepository;

  constructor(repository: ListProductRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Product[] | Failure> {
    return await this.repository.getProducts();
  }
}