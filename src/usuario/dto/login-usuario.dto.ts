import { ApiProperty } from '@nestjs/swagger';

export class LoginUsuarioDto {
  @ApiProperty({ example: 'email@example.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
