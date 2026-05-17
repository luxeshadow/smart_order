// data/models/user_detail_model.ts
import type { UserDetail, ChildDetail } from '../../domain/entities/user_detail'

export class UserDetailModel implements UserDetail {
  id: string
  username: string
  email: string
  role: string
  mainBalance: number
  refundBalance: number
  levelNames: string[]
  childrenDetails: ChildDetail[] // <-- Ajout de la propriété requise par l'interface

  constructor(data: UserDetail) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.role = data.role
    this.mainBalance = data.mainBalance
    this.refundBalance = data.refundBalance
    this.levelNames = data.levelNames
    this.childrenDetails = data.childrenDetails // <-- Initialisation
  }

  static fromSupabase(data: any): UserDetailModel {
    // 1. Parser et convertir la liste des enfants reçue de la vue SQL
    const rawChildren = Array.isArray(data.children_details) ? data.children_details : [];
    
    const mappedChildren: ChildDetail[] = rawChildren.map((child: any) => ({
      id: child.id,
      username: child.username,
      mainBalance: Number(child.main_balance || 0),
      phoneNumber: child.phone_number || '',
      activeLevels: Array.isArray(child.active_levels) ? child.active_levels : []
    }));

    // 2. Retourner l'instance du modèle principal
    return new UserDetailModel({
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      mainBalance: Number(data.main_balance || 0),
      refundBalance: Number(data.refund_balance || 0),
      levelNames: Array.isArray(data.level_names) 
        ? data.level_names 
        : data.level_names ? [data.level_names] : [],
      childrenDetails: mappedChildren // <-- Injection des enfants mappés
    });
  }

  toSupabase(): any {
    return {
      username: this.username,
      role: this.role,
      main_balance: this.mainBalance,
      refund_balance: this.refundBalance
      // On ne renvoie pas children_details car c'est une vue en lecture seule
    }
  }
}