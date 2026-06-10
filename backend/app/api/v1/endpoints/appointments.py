from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import date, time, datetime, timedelta
from typing import Optional, List
import random
import string

from app.database.session import get_db
from app.models.models import Appointment, Doctor, Patient, User, Notification
from app.schemas.schemas import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def generate_appointment_number():
    prefix = "APT"
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{prefix}{suffix}"


def get_end_time(start: time, duration_minutes: int) -> time:
    start_dt = datetime.combine(date.today(), start)
    end_dt = start_dt + timedelta(minutes=duration_minutes)
    return end_dt.time()


@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name not in ["patient", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only patients can book appointments")

    # Get patient profile
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient and current_user.role.name == "patient":
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Get doctor
    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id, Doctor.is_available == True).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found or unavailable")

    # Check for slot conflict
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == payload.doctor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.start_time == payload.start_time,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.deleted_at == None,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    end_time = get_end_time(payload.start_time, doctor.slot_duration_minutes)

    appointment = Appointment(
        appointment_number=generate_appointment_number(),
        patient_id=patient.id if patient else 1,
        doctor_id=payload.doctor_id,
        hospital_id=doctor.hospital_id,
        appointment_date=payload.appointment_date,
        start_time=payload.start_time,
        end_time=end_time,
        appointment_type=payload.appointment_type,
        reason_for_visit=payload.reason_for_visit,
        fee_amount=float(doctor.consultation_fee),
        status="pending",
    )
    db.add(appointment)
    db.flush()

    # Notify doctor
    notif = Notification(
        user_id=doctor.user_id,
        title="New Appointment Request",
        message=f"New appointment request from {current_user.first_name} {current_user.last_name} on {payload.appointment_date}",
        type="appointment",
        metadata={"appointment_id": appointment.id},
    )
    db.add(notif)
    db.commit()
    db.refresh(appointment)

    return db.query(Appointment).options(
        joinedload(Appointment.patient).joinedload(Patient.user),
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.hospital),
    ).filter(Appointment.id == appointment.id).first()


@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Appointment).options(
        joinedload(Appointment.patient).joinedload(Patient.user),
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.hospital),
    ).filter(Appointment.deleted_at == None)

    # Role-based filtering
    if current_user.role.name == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient:
            query = query.filter(Appointment.patient_id == patient.id)
    elif current_user.role.name == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)

    if status:
        query = query.filter(Appointment.status == status)
    if date_from:
        query = query.filter(Appointment.appointment_date >= date_from)
    if date_to:
        query = query.filter(Appointment.appointment_date <= date_to)

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apt = db.query(Appointment).options(
        joinedload(Appointment.patient).joinedload(Patient.user),
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.hospital),
    ).filter(Appointment.id == appointment_id, Appointment.deleted_at == None).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return apt


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.deleted_at == None).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if payload.status:
        apt.status = payload.status
    if payload.cancellation_reason:
        apt.cancellation_reason = payload.cancellation_reason
    if payload.cancelled_by:
        apt.cancelled_by = payload.cancelled_by

    db.commit()
    db.refresh(apt)

    # Load relationships
    return db.query(Appointment).options(
        joinedload(Appointment.patient).joinedload(Patient.user),
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.hospital),
    ).filter(Appointment.id == appointment_id).first()


@router.get("/slots/{doctor_id}")
async def get_available_slots(
    doctor_id: int,
    appointment_date: date,
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Get booked slots
    booked = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.deleted_at == None,
    ).all()
    booked_times = {a.start_time.strftime("%H:%M") for a in booked}

    # Generate slots 9 AM to 5 PM
    slots = []
    current = datetime.combine(appointment_date, time(9, 0))
    end = datetime.combine(appointment_date, time(17, 0))
    duration = doctor.slot_duration_minutes

    while current < end:
        slot_time = current.time().strftime("%H:%M")
        slots.append({
            "time": slot_time,
            "available": slot_time not in booked_times,
        })
        current += timedelta(minutes=duration)

    return {"slots": slots, "date": str(appointment_date)}
