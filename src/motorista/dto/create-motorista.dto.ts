export class CreateMotoristaDto {
    nomeMotorista: string;
    nascimento: Date;
    nCarteira: string;

    constructor(nomeMotorista: string, nascimento: Date, nCarteira: string) {
        this.nomeMotorista = nomeMotorista;
        this.nascimento = nascimento;
        this.nCarteira = nCarteira;
    }
}