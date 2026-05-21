export class CreateCaminhaoMotoristaDto {
    data: Date;
    motoristaId: number;
    caminhaoId: number;

    constructor(data: Date, motoristaId: number, caminhaoId: number) {
        this.data = data;
        this.motoristaId = motoristaId;
        this.caminhaoId = caminhaoId;
    }
}
