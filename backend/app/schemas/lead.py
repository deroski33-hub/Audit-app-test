from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    NEGOTIATING = "negotiating"
    WON = "won"
    LOST = "lost"


class LeadPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AuditType(str, Enum):
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"
    IT_SECURITY = "it_security"
    TAX = "tax"
    INTERNAL = "internal"
    EXTERNAL = "external"


class LeadBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    annual_revenue: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)

    contact_name: str = Field(..., min_length=1, max_length=255)
    contact_title: Optional[str] = Field(None, max_length=100)
    contact_email: str = Field(..., max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=50)

    audit_type: AuditType = AuditType.FINANCIAL
    status: LeadStatus = LeadStatus.NEW
    priority: LeadPriority = LeadPriority.MEDIUM
    source: Optional[str] = Field(None, max_length=100)

    estimated_value: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    annual_revenue: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)

    contact_name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_title: Optional[str] = Field(None, max_length=100)
    contact_email: Optional[str] = Field(None, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=50)

    audit_type: Optional[AuditType] = None
    status: Optional[LeadStatus] = None
    priority: Optional[LeadPriority] = None
    source: Optional[str] = Field(None, max_length=100)

    estimated_value: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None


class LeadResponse(LeadBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    leads: list[LeadResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
