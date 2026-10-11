import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, User } from '../types/user.type';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async registerUser(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    if (!data.password) {
      throw new Error('La contraseña es obligatoria.');
    }

    const saltRounds = 10; // Número de rondas de sal para el hash de la contraseña el metodo hash de bcrypt 
    // necesita un segundo parametro que es el numero de rondas de sal para el hash de la contraseña,
    //  entre mas alto sea el numero mas seguro sera el hash pero tambien sera mas lento
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    return await this.userRepository.create({
      ...data, // estos tres puntos son el operador Spread copiamos automaticamente todas las propiedades de data 
      // y luego sobrescribimos únicamente la propiedad password con el valor encriptado (hashedPassword):
      password: hashedPassword,
    });
  }
}