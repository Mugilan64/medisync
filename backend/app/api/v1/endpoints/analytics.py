from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta

from app.database.session import get_db
from app.models.models import User, Doctor, Patient, Appointment, Notification
from app.schemas.schemas import DashboardStats, PatientDashboardStats, DoctorDashboardStats
from app.middleware.auth import get_current_user, get_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/admin/dashboard", response_model=DashboardStats)
async def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin),
):
    today = date.today()
    first_of_month = today.replace(day=1)

    total_patients = db.query(func.count(Patient.id)).filter(Patient.deleted_at == None).scalar()
    total_doctors = db.query(func.count(Doctor.id)).filter(Doctor.deleted_at == None).scalar()
    total_appointments = db.query(func.count(Appointment.id)).filter(Appointment.deleted_at == None).scalar()
    pending = db.query(func.count(Appointment.id)).filter(Appointment.status == "pending", Appointment.deleted_at == None).scalar()
    completed = db.query(func.count(Appointment.id)).filter(Appointment.status == "completed", Appointment.deleted_at == None).scalar()
    cancelled = db.query(func.count(Appointment.id)).filter(Appointment.status == "cancelled", Appointment.deleted_at == None).scalar()
    today_apts = db.query(func.count(Appointment.id)).filter(Appointment.appointment_date == today, Appointment.deleted_at == None).scalar()

    monthly_revenue = db.query(func.sum(Appointment.fee_amount)).filter(
        Appointment.appointment_date >= first_of_month,
        Appointment.status == "completed",
        Appointment.deleted_at == None,
    ).scalar() or 0.0

    return DashboardStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        pending_appointments=pending,
        completed_appointments=completed,
        cancelled_appointments=cancelled,
        monthly_revenue=float(monthly_revenue),
        today_appointments=today_apts,
    )


@router.get("/admin/monthly-trend")
async def monthly_appointment_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin),
):
    today = date.today()
    months = []
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        month_end = (month_start.replace(month=month_start.month % 12 + 1, day=1) - timedelta(days=1)) if month_start.month < 12 else month_start.replace(day=31)

        count = db.query(func.count(Appointment.id)).filter(
            Appointment.appointment_date >= month_start,
            Appointment.appointment_date <= month_end,
            Appointment.deleted_at == None,
        ).scalar()

        revenue = db.query(func.sum(Appointment.fee_amount)).filter(
            Appointment.appointment_date >= month_start,
            Appointment.appointment_date <= month_end,
            Appointment.status == "completed",
            Appointment.deleted_at == None,
        ).scalar() or 0

        months.append({
            "month": month_start.strftime("%b %Y"),
            "appointments": count,
            "revenue": float(revenue),
        })

    return {"data": months}


@router.get("/patient/dashboard", response_model=PatientDashboardStats)
async def patient_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return PatientDashboardStats(
            upcoming_appointments=0, completed_appointments=0,
            cancelled_appointments=0, total_consultations=0,
        )

    today = date.today()
    upcoming = db.query(func.count(Appointment.id)).filter(
        Appointment.patient_id == patient.id,
        Appointment.appointment_date >= today,
        Appointment.status.in_(["pending", "confirmed"]),
    ).scalar()
    completed = db.query(func.count(Appointment.id)).filter(
        Appointment.patient_id == patient.id,
        Appointment.status == "completed",
    ).scalar()
    cancelled = db.query(func.count(Appointment.id)).filter(
        Appointment.patient_id == patient.id,
        Appointment.status == "cancelled",
    ).scalar()

    return PatientDashboardStats(
        upcoming_appointments=upcoming,
        completed_appointments=completed,
        cancelled_appointments=cancelled,
        total_consultations=completed,
    )


@router.get("/doctor/dashboard", response_model=DoctorDashboardStats)
async def doctor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        return DoctorDashboardStats(
            today_appointments=0, pending_requests=0,
            completed_today=0, total_patients=0, monthly_earnings=0.0,
        )

    today = date.today()
    first_of_month = today.replace(day=1)

    today_apts = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date == today,
        Appointment.status.in_(["pending", "confirmed"]),
    ).scalar()

    pending = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status == "pending",
    ).scalar()

    completed_today = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date == today,
        Appointment.status == "completed",
    ).scalar()

    total_patients = db.query(func.count(func.distinct(Appointment.patient_id))).filter(
        Appointment.doctor_id == doctor.id,
    ).scalar()

    monthly_earnings = db.query(func.sum(Appointment.fee_amount)).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date >= first_of_month,
        Appointment.status == "completed",
    ).scalar() or 0.0

    return DoctorDashboardStats(
        today_appointments=today_apts,
        pending_requests=pending,
        completed_today=completed_today,
        total_patients=total_patients,
        monthly_earnings=float(monthly_earnings),
    )


@router.get("/admin/status-distribution")
async def appointment_status_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin),
):
    statuses = ["pending", "confirmed", "completed", "cancelled", "no_show"]
    result = []
    for s in statuses:
        count = db.query(func.count(Appointment.id)).filter(
            Appointment.status == s, Appointment.deleted_at == None
        ).scalar()
        result.append({"status": s, "count": count})
    return {"data": result}
