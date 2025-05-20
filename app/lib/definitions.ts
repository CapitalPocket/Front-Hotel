export type LoginResponse = { user?: User; message: string };

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

export interface ApiResponse {
  user?: {
    idUser: number;
    name: string;
    email: string;
    password: string;
    rol: string;
    idpark: string;
    changepassword: boolean;
    statusprofile: string;
  };
  message: string;
  token?: string; // Added the token property
}

export type UserProfile = {
  id_employee: number;
  name: string;
  phone_number: string;
  password: string;
  rol: string;
  start_time: string;
  end_time: string;
  hourly_wage: number;
  statusprofile: 'Habilitado' | 'Deshabilitado' | 'Eliminado';  // solo "Enable" o "Disable"
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

export type Shedule = {                                          
  start_time: string;
  end_time: string;
  range_hours: string;
}

interface Employee {
  employeeName: string;
  hotelName: string;
  currentRoom: string; // Incluye la categoría como "101A" o "101B"
}

interface RoomStatus {
  id_room: number;
  hotel_id: number;
  room_number: string;
  category: 'A' | 'B';
  status: string; // El estado de la habitación, por ejemplo, "V/C" o "Ocupado"
  created_at: string; // Fecha de creación del estado de la habitación
}

export interface HotelViewProps {
  // ¿Está hotelId definido aquí? ¿O tiene otro nombre?
  hotelId: number;
}

export type DateRangePickerProps = {

  startDate: Date;

  endDate: Date;

  id: string;

  name: string;

  className: string;

}
interface MapProps {
  lat: number;
  lng: number;
}

// Add the missing Ticket export
export interface Ticket {
  idticket: string;
  namepark: string;
  id_operation: string;
  name: string;
  lastname: string;
  identity_type: string;
  identity_number: string;
  price_ticket: number;
  date_ticket: string;
  status: string;
  invoice_electronic?: number;
  email_person?: string;
  phone_number?: string;
  ticket_code?: string;
  ticket_info?: { type: string; count: number }[];
}
