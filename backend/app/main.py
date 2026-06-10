from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
import time

from app.core.config import settings
from app.database.session import engine
from app.models.models import Base
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.appointments import router as appointments_router
from app.api.v1.endpoints.doctors import router as doctors_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.notifications import notif_router, patient_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediSync API",
    description="Enterprise Patient Appointment Management Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(time.time() - start)
    return response

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
PREFIX = "/api/v1"
app.include_router(auth_router, prefix=PREFIX)
app.include_router(appointments_router, prefix=PREFIX)
app.include_router(doctors_router, prefix=PREFIX)
app.include_router(analytics_router, prefix=PREFIX)
app.include_router(notif_router, prefix=PREFIX)
app.include_router(patient_router, prefix=PREFIX)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


# Seed admin on startup
@app.on_event("startup")
async def seed_admin():
    from app.database.session import SessionLocal
    from app.models.models import User, Role, Doctor, Specialization
    from app.core.security import get_password_hash
    import random, string

    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "super_admin").first()
        if admin_role:
            existing = db.query(User).filter(User.email == "admin@medisync.health").first()
            if not existing:
                admin = User(
                    email="admin@medisync.health",
                    password_hash=get_password_hash("Admin@2024"),
                    role_id=admin_role.id,
                    first_name="System",
                    last_name="Administrator",
                    is_active=True,
                    is_verified=True,
                )
                db.add(admin)
                db.commit()
                logger.info("✅ Admin user created: admin@medisync.health / Admin@2024")

        # Seed demo doctors
        doctor_role = db.query(Role).filter(Role.name == "doctor").first()
        patient_role = db.query(Role).filter(Role.name == "patient").first()

        demo_doctors = [
            ("dr.priya@medisync.health", "Priya", "Sharma", 1, 15, 800),
            ("dr.rajan@medisync.health", "Rajan", "Kumar", 2, 12, 1200),
            ("dr.meena@medisync.health", "Meena", "Patel", 3, 8, 700),
            ("dr.arjun@medisync.health", "Arjun", "Singh", 4, 20, 1500),
            ("dr.kavita@medisync.health", "Kavita", "Nair", 5, 10, 900),
            ("dr.vikram@medisync.health", "Vikram", "Reddy", 6, 18, 600),
        ]

        specs = db.query(Specialization).all()
        if doctor_role and specs:
            for email, fname, lname, spec_idx, exp, fee in demo_doctors:
                if not db.query(User).filter(User.email == email).first():
                    u = User(
                        email=email,
                        password_hash=get_password_hash("Doctor@2024"),
                        role_id=doctor_role.id,
                        first_name=fname,
                        last_name=lname,
                        is_active=True,
                        is_verified=True,
                    )
                    db.add(u)
                    db.flush()
                    spec = specs[min(spec_idx - 1, len(specs) - 1)]
                    d = Doctor(
                        user_id=u.id,
                        specialization_id=spec.id,
                        hospital_id=1,
                        registration_number="DR" + "".join(random.choices(string.digits, k=8)),
                        qualification="MBBS, MD",
                        experience_years=exp,
                        consultation_fee=fee,
                        bio=f"Experienced {spec.name} with {exp} years of practice.",
                        rating=round(random.uniform(4.0, 5.0), 1),
                        total_reviews=random.randint(20, 200),
                        total_consultations=random.randint(100, 2000),
                        is_available=True,
                    )
                    db.add(d)
            db.commit()

        # Seed demo patient
        if patient_role:
            if not db.query(User).filter(User.email == "patient@medisync.health").first():
                from app.models.models import Patient
                pu = User(
                    email="patient@medisync.health",
                    password_hash=get_password_hash("Patient@2024"),
                    role_id=patient_role.id,
                    first_name="Demo",
                    last_name="Patient",
                    is_active=True,
                    is_verified=True,
                )
                db.add(pu)
                db.flush()
                pp = Patient(user_id=pu.id, gender="Male", blood_group="O+", city="Chennai", state="Tamil Nadu")
                db.add(pp)
                db.commit()
                logger.info("✅ Demo patient created: patient@medisync.health / Patient@2024")

    except Exception as e:
        logger.error(f"Seed error: {e}")
        db.rollback()
    finally:
        db.close()
