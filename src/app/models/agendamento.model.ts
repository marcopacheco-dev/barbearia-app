export interface Agendamento {
  id?: number;
  nomeCliente: string;
  dataHora: string; // Formato ISO: 'YYYY-MM-DDTHH:mm:ss'
  telefone?: string;
  servico?: string;
  confirmado?: boolean;
  cancelado?: boolean; // novo campo
}