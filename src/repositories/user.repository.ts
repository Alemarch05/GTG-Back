import { pool } from '../config/database';
import { User, CreateUserDTO } from '../types/user.type';

export class UserRepository {
 // Se usa asincrono para que no pare el servidor cuando estemos ejecutando la consulta esta por asi
 //decirlo se ejecuta en segundo plano y cuando termine de ejecutarse nos devuelve el resultado   
  async create(userData: CreateUserDTO): Promise<User> { //Promise<User>, le estás diciendo al compilador:
    // "Esta funcion asoncrona promete resolver y entregar al final un objeto que cumple exactamente
    //  con la interfaz User
    const { name, email, password, role = 'USER' } = userData; //Aquí le digo que los datos que ingresen deben cumplir con los del CreateUserDto
    const query = `
      INSERT INTO public.users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    //En el metodo query le envío values me imagino que toma el orden, o sea $1 será name y así sucesivamente
    const values = [name, email, password, role];
    const { rows } = await pool.query(query, values); // metodo de pool que es la conexion a la base de datos
    //  query es la consulta y values son los valores que se van a insertar en la base de datos
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password, role, created_at
      FROM public.users
      WHERE email = $1;
    `;
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }
  

}