from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List, Any
from datetime import date, time, datetime
from decimal import Decimal


# ========================
# AUTH SCHEMAS
# ========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None
    role: str = "patient"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ========================
# USER SCHEMAS
# ========================

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    profile_image: Optional[str]
    is_active: bool
    role: Optional["RoleResponse"]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


# ========================
# PATIENT SCHEMAS
# ========================

class PatientCreate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    date_of_birth: Optional[date]
    gender: Optional[str]
    blood_group: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    allergies: Optional[str]
    chronic_conditions: Optional[str]
    user: Optional[UserResponse]

    class Config:
        from_attributes = True


# ========================
# DOCTOR SCHEMAS
# ========================

class DoctorCreate(BaseModel):
    specialization_id: int
    hospital_id: Optional[int] = None
    registration_number: str
    qualification: Optional[str] = None
    experience_years: int = 0
    consultation_fee: float = 500.0
    bio: Optional[str] = None
    languages: str = "English"
    available_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday"
    slot_duration_minutes: int = 30


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    specialization_id: int
    registration_number: str
    qualification: Optional[str]
    experience_years: int
    consultation_fee: float
    bio: Optional[str]
    languages: Optional[str]
    rating: float
    total_reviews: int
    total_consultations: int
    is_available: bool
    available_days: Optional[str]
    slot_duration_minutes: int
    user: Optional[UserResponse]
    specialization: Optional["SpecializationResponse"]
    hospital: Optional["HospitalResponse"]

    class Config:
        from_attributes = True


class SpecializationResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]

    class Config:
        from_attributes = True


class HospitalResponse(BaseModel):
    id: int
    name: str
    address: str
    city: Optional[str]
    state: Optional[str]
    phone: Optional[str]

    class Config:
        from_attributes = True


class HospitalCreate(BaseModel):
    name: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


# ========================
# APPOINTMENT SCHEMAS
# ========================

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    start_time: time
    appointment_type: str = "in_person"
    reason_for_visit: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    appointment_number: str
    patient_id: int
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    appointment_type: str
    reason_for_visit: Optional[str]
    fee_amount: Optional[float]
    payment_status: str
    created_at: Optional[datetime]
    patient: Optional[PatientResponse]
    doctor: Optional[DoctorResponse]
    hospital: Optional[HospitalResponse]

    class Config:
        from_attributes = True


# ========================
# CONSULTATION SCHEMAS
# ========================

class ConsultationCreate(BaseModel):
    appointment_id: int
    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    follow_up_notes: Optional[str] = None
    vital_signs: Optional[dict] = None


class ConsultationResponse(BaseModel):
    id: int
    appointment_id: int
    chief_complaint: Optional[str]
    diagnosis: Optional[str]
    prescription: Optional[str]
    notes: Optional[str]
    follow_up_date: Optional[date]
    vital_signs: Optional[dict]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ========================
# NOTIFICATION SCHEMAS
# ========================

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    metadata: Optional[dict]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ========================
# ANALYTICS SCHEMAS
# ========================

class DashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    pending_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    monthly_revenue: float
    today_appointments: int


class PatientDashboardStats(BaseModel):
    upcoming_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    total_consultations: int


class DoctorDashboardStats(BaseModel):
    today_appointments: int
    pending_requests: int
    completed_today: int
    total_patients: int
    monthly_earnings: float


# ========================
# PAGINATION
# ========================

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    total_pages: int


UserResponse.model_rebuild()
TokenResponse.model_rebuild()
DoctorResponse.model_rebuild()
