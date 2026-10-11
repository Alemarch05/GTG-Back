import { pool } from '../config/database';
import { User, CreateUserDTO } from '../types/user.type';

export class UserRepository {

    
  async create(userData: CreateUserDTO): Promise<User> {
    const { name, email, password, role = 'USER' } = userData;
    const query = `
      INSERT INTO public.users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, password, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

}