export class CreateCaminhaoDto {
    modelo: string;
    ano: Date;
    placa: string;

    constructor(modelo: string, ano: Date, placa: string) {
        this.modelo = modelo;
        this.ano = ano;
        this.placa = placa;
    }
}
