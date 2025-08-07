// Tipos para os serviços da API

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface EmployeeData {
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export interface AuthService {
  signup(userData: SignupData): Promise<AuthResponse>;
  signin(credentials: SigninData): Promise<AuthResponse>;
}

export interface EmployeeService {
  create(employeeData: EmployeeData): Promise<AuthResponse>;
  getAll(): Promise<AuthResponse>;
  getById(id: string): Promise<AuthResponse>;
  update(id: string, employeeData: Partial<EmployeeData>): Promise<AuthResponse>;
  delete(id: string): Promise<AuthResponse>;
}

export declare const authService: AuthService;
export declare const employeeService: EmployeeService;
