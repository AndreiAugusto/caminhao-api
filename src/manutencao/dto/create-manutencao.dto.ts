export class CreateManutencaoDto {
    descricao: string;
    custo: number;
    data: Date;
    caminhaoId: number;
    oficinaId: number;

    constructor(descricao: string, custo: number, data: Date, caminhaoId: number, oficinaId: number) {
        this.descricao = descricao;
        this.custo = custo;
        this.data = data;
        this.caminhaoId = caminhaoId;
        this.oficinaId = oficinaId;
    }
}
