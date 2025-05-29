import { Customer } from '../models/customer.entity';

export interface CustomerRepository {
  findBy(id: string): Promise<Customer | null>;
  findByName(name: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
}
