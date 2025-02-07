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
};

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

interface HotelViewProps {
  park: string; // Recibimos el nombre del hotel
}