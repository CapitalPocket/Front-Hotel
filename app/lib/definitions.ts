export type Ticket = {
  idticket: number;
  namepark: string;
  ticket_code: string;
  type_pay: string;
  type_money: string;
  name: string;
  lastname: string;
  email_person: string;
  phone_number: string;
  identity_type: string;
  identity_number: string;
  date_ticket: string;
  status: string;
  type_ticket_adults: string;
  count_adult: number;
  type_ticket_kids: string;
  count_kid: number;
  invoice_electronic: number;
  created_at: string;
  updated_at: string;
  ticket_info: TicketInfo[];
  price_ticket: number;
  id_operation:string;
  motive:string;
};
export type TicketInfo = {
  type: string;
  count: number;
};
export type LoginResponse = { user?: User; message: string ; token?: string; };

export type User = {
  idUser: string;
  name: string;
  email: string;
  password: string;
  rol: string;
  park: string;
  changePass?: string;
  statusprofile?: string;
  token?: string;
};

export type ApiResponse = {

  user?: {
    id_user: string;
    name: string;
    email: string;
    password: string;
    rol: string;
    idpark: string;
    changepassword?: string;
    statusprofile?: string;
  }; 
   message: string;
   token?: string;
};

export type UserProfile = {
  id_user: number;
  name: string;
  email: string;
  password: string;
  rol: string;
  created_at: string;
  updated_at: string;
  idpark: number;
  changepassword: number;
  statusprofile: 'Habilitado' | 'Desahbilitado';  // solo "Enable" o "Disable"
};

export type CandidatosTable = {
  id: string;
  tipoid: string;
  nombre: string;
  celular: string;
  cargo: string;
  correo: string;
  motivo: string;
  estado_proceso: string;
  fecha_envio: string;
  fecha_ingreso: string | null;
  grupo: string;
  usuario_activo: string;
  estadoCandidato: number;
  user_creo: number;
};

export type CustomerField = {
  id: string;
  name: string;
};