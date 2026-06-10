from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database.session import get_db
from app.models.models import Notification, Patient, User
from app.schemas.schemas import NotificationResponse, PatientResponse, PatientCreate
from app.middleware.auth import get_current_user

notif_router = APIRouter(prefix="/notifications", tags=["Notifications"])
patient_router = APIRouter(prefix="/patients", tags=["Patients"])


@notif_router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()


@notif_router.patch("/{notif_id}/read")
async def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@notif_router.patch("/mark-all-read")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


@notif_router.get("/unread-count")
async def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).count()
    return {"count": count}


# ── Patients ──

@patient_router.get("/me", response_model=PatientResponse)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).options(joinedload(Patient.user)).filter(
        Patient.user_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient


@patient_router.patch("/me", response_model=PatientResponse)
async def update_my_profile(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return db.query(Patient).options(joinedload(Patient.user)).filter(Patient.id == patient.id).first()


@patient_router.get("/", response_model=List[PatientResponse])
async def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name not in ["super_admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(Patient).options(joinedload(Patient.user)).filter(Patient.deleted_at == None).limit(100).all()
