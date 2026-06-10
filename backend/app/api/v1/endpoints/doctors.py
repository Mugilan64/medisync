from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from app.database.session import get_db
from app.models.models import Doctor, User, Specialization
from app.schemas.schemas import DoctorResponse, DoctorCreate, SpecializationResponse
from app.middleware.auth import get_current_user, get_admin

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/", response_model=List[DoctorResponse])
async def list_doctors(
    specialization_id: Optional[int] = None,
    search: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_fee: Optional[float] = None,
    is_available: Optional[bool] = True,
    min_rating: Optional[float] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).options(
        joinedload(Doctor.user),
        joinedload(Doctor.specialization),
        joinedload(Doctor.hospital),
    ).filter(Doctor.deleted_at == None)

    if is_available is not None:
        query = query.filter(Doctor.is_available == is_available)
    if specialization_id:
        query = query.filter(Doctor.specialization_id == specialization_id)
    if min_experience:
        query = query.filter(Doctor.experience_years >= min_experience)
    if max_fee:
        query = query.filter(Doctor.consultation_fee <= max_fee)
    if min_rating:
        query = query.filter(Doctor.rating >= min_rating)
    if search:
        query = query.join(User).filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )

    doctors = query.order_by(Doctor.rating.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return doctors


@router.get("/specializations", response_model=List[SpecializationResponse])
async def list_specializations(db: Session = Depends(get_db)):
    return db.query(Specialization).all()


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).options(
        joinedload(Doctor.user),
        joinedload(Doctor.specialization),
        joinedload(Doctor.hospital),
    ).filter(Doctor.id == doctor_id, Doctor.deleted_at == None).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.get("/me/profile", response_model=DoctorResponse)
async def get_my_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).options(
        joinedload(Doctor.specialization),
        joinedload(Doctor.hospital),
    ).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.patch("/{doctor_id}/availability")
async def toggle_availability(
    doctor_id: int,
    is_available: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if current_user.role.name == "doctor" and doctor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    doctor.is_available = is_available
    db.commit()
    return {"message": "Availability updated", "is_available": is_available}
