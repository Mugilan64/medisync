from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, Time,
    Text, ForeignKey, Enum, DECIMAL, JSON, TIMESTAMP, func, SmallInteger
)
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class RoleEnum(str, enum.Enum):
    super_admin = "super_admin"
    doctor = "doctor"
    patient = "patient"
    staff = "staff"


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class AppointmentType(str, enum.Enum):
    in_person = "in_person"
    video = "video"
    phone = "phone"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    profile_image = Column(String(500))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(TIMESTAMP, nullable=True)
    refresh_token_hash = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    role = relationship("Role", back_populates="users")
    doctor = relationship("Doctor", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class Specialization(Base):
    __tablename__ = "specializations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
    doctors = relationship("Doctor", back_populates="specialization")


class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(500))
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)
    doctors = relationship("Doctor", back_populates="hospital")
    appointments = relationship("Appointment", back_populates="hospital")


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    registration_number = Column(String(100), unique=True, nullable=False)
    qualification = Column(String(500))
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(DECIMAL(10, 2), default=500.00)
    bio = Column(Text)
    languages = Column(String(255), default="English")
    rating = Column(DECIMAL(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    total_consultations = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    available_days = Column(String(255), default="Monday,Tuesday,Wednesday,Thursday,Friday")
    slot_duration_minutes = Column(Integer, default=30)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    user = relationship("User", back_populates="doctor")
    specialization = relationship("Specialization", back_populates="doctors")
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    availability = relationship("DoctorAvailability", back_populates="doctor")
    reviews = relationship("DoctorReview", back_populates="doctor")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    day_of_week = Column(Enum("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    doctor = relationship("Doctor", back_populates="availability")


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(Enum("Male", "Female", "Other", "Prefer not to say"))
    blood_group = Column(String(5))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(20))
    allergies = Column(Text)
    chronic_conditions = Column(Text)
    current_medications = Column(Text)
    insurance_provider = Column(String(200))
    insurance_number = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    user = relationship("User", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    reviews = relationship("DoctorReview", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    appointment_number = Column(String(20), unique=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(Enum("pending","confirmed","completed","cancelled","no_show"), default="pending")
    appointment_type = Column(Enum("in_person","video","phone"), default="in_person")
    reason_for_visit = Column(Text)
    cancellation_reason = Column(Text)
    cancelled_by = Column(Enum("patient","doctor","admin"), nullable=True)
    fee_amount = Column(DECIMAL(10, 2))
    payment_status = Column(Enum("pending","paid","refunded"), default="pending")
    payment_method = Column(String(50))
    payment_reference = Column(String(100))
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    hospital = relationship("Hospital", back_populates="appointments")
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)
    review = relationship("DoctorReview", back_populates="appointment", uselist=False)


class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    chief_complaint = Column(Text)
    diagnosis = Column(Text)
    prescription = Column(Text)
    notes = Column(Text)
    follow_up_date = Column(Date, nullable=True)
    follow_up_notes = Column(Text)
    vital_signs = Column(JSON)
    attachments = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    appointment = relationship("Appointment", back_populates="consultation")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum("appointment","reminder","system","payment","general"), default="general")
    is_read = Column(Boolean, default=False)
    extra_data = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())


class SystemSetting(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    description = Column(String(500))
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class DoctorReview(Base):
    __tablename__ = "doctor_reviews"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    rating = Column(SmallInteger, nullable=False)
    review = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    doctor = relationship("Doctor", back_populates="reviews")
    patient = relationship("Patient", back_populates="reviews")
    appointment = relationship("Appointment", back_populates="review")