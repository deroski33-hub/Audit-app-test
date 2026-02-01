from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    NEGOTIATING = "negotiating"
    WON = "won"
    LOST = "lost"


class LeadPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AuditType(str, enum.Enum):
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"
    IT_SECURITY = "it_security"
    TAX = "tax"
    INTERNAL = "internal"
    EXTERNAL = "external"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    # Company Information
    company_name = Column(String(255), nullable=False, index=True)
    industry = Column(String(100))
    company_size = Column(String(50))
    annual_revenue = Column(String(100))
    website = Column(String(255))

    # Contact Information
    contact_name = Column(String(255), nullable=False)
    contact_title = Column(String(100))
    contact_email = Column(String(255), nullable=False, index=True)
    contact_phone = Column(String(50))

    # Lead Details
    audit_type = Column(SQLEnum(AuditType), default=AuditType.FINANCIAL)
    status = Column(SQLEnum(LeadStatus), default=LeadStatus.NEW, index=True)
    priority = Column(SQLEnum(LeadPriority), default=LeadPriority.MEDIUM)
    source = Column(String(100))

    # Additional Information
    estimated_value = Column(String(50))
    notes = Column(Text)
    next_follow_up = Column(DateTime(timezone=True))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
