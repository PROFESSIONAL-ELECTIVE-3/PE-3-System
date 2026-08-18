from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import bcrypt
from app.database import get_db
from app.models.user import User
from app.models.audit import FERPAAuditLog
from app.schemas.auth import Token, UserCreate, UserResponse, UserLogin
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & FERPA Security"])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    hashed_pwd = hash_password(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role,
        department=user_in.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Create simple token (or JWT token)
    access_token = f"token-{user.username}-{user.role}-secure-2026"
    
    # Log audit entry for FERPA compliance
    audit = FERPAAuditLog(
        user_id=user.id,
        username=user.username,
        user_role=user.role,
        action="USER_LOGIN",
        resource_type="AUTH",
        details=f"User {user.username} logged in successfully.",
        compliance_status="COMPLIANT"
    )
    db.add(audit)
    db.commit()
    
    user_resp = UserResponse.model_validate(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_resp
    }

@router.post("/login-json", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    access_token = f"token-{user.username}-{user.role}-secure-2026"
    
    audit = FERPAAuditLog(
        user_id=user.id,
        username=user.username,
        user_role=user.role,
        action="USER_LOGIN",
        resource_type="AUTH",
        details=f"User {user.username} logged in successfully via JSON.",
        compliance_status="COMPLIANT"
    )
    db.add(audit)
    db.commit()
    
    user_resp = UserResponse.model_validate(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_resp
    }
