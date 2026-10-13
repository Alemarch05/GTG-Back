import { Request, Response } from 'express';
import { UserService } from '../services/user.services';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> { //el req es el objeto que contiene toda la informacion de la peticion que se hace al servidor 
    //y el res es el objeto que contiene toda la informacion de la respuesta que se va a enviar al cliente
    try {
      const { name, email, password, role } = req.body;
      const newUser = await userService.registerUser({ name, email, password, role });
      res.status(201).json({ success: true, data: newUser });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

}