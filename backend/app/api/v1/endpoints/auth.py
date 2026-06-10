from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
import random
import string

from app.database.session import get_db
from app.models.models import User, Role, Patient, Doctor
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def generate_reg_number():
    return "DR" + "".join(random.choices(string.digits, k=8))


@router.post("/register", response_model=dict)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check email exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Get role
    role = db.query(Role).filter(Role.name == payload.role).first()
    if not role:
        role = db.query(Role).filter(Role.name == "patient").first()

    # Create user
    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role_id=role.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()

    # Create patient/doctor profile
    if role.name == "patient":
        patient = Patient(user_id=user.id)
        db.add(patient)
    elif role.name == "doctor":
        from app.models.models import Specialization
        spec = db.query(Specialization).first()
        doctor = Doctor(
            user_id=user.id,
            specialization_id=spec.id if spec else 1,
            registration_number=generate_reg_number(),
        )
        db.add(doctor)

    db.commit()
    db.refresh(user)

    return {"message": "Registration successful", "user_id": user.id}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.deleted_at == None).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Update last login
    user.last_login = datetime.utcnow()

    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    user.refresh_token_hash = get_password_hash(refresh_token)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(token_data["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token_hash = None
    db.commit()
    return {"message": "Logged out successfully"}
