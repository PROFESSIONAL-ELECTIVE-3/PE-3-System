from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class FERPAAuditLog(Base):
    __tablename__ = "ferpa_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(50), nullable=False)
    user_role = Column(String(20), nullable=False)
    
    action = Column(String(50), nullable=False)  
    resource_type = Column(String(50), nullable=False) 
    resource_id = Column(String(100), nullable=True)   
    
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    compliance_status = Column(String(20), default="COMPLIANT")
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
