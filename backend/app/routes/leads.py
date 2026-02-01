from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math

from app.database import get_db
from app.services.lead_service import LeadService
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadListResponse,
    LeadStatus,
    LeadPriority,
    AuditType,
)

router = APIRouter(prefix="/api/leads", tags=["leads"])


def get_lead_service(db: AsyncSession = Depends(get_db)) -> LeadService:
    return LeadService(db)


@router.post("/", response_model=LeadResponse, status_code=201)
async def create_lead(
    lead_data: LeadCreate,
    service: LeadService = Depends(get_lead_service),
):
    """Create a new audit lead."""
    lead = await service.create_lead(lead_data)
    return lead


@router.get("/", response_model=LeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[LeadStatus] = None,
    priority: Optional[LeadPriority] = None,
    audit_type: Optional[AuditType] = None,
    search: Optional[str] = None,
    service: LeadService = Depends(get_lead_service),
):
    """List all audit leads with filtering and pagination."""
    leads, total = await service.get_leads(
        page=page,
        per_page=per_page,
        status=status,
        priority=priority,
        audit_type=audit_type,
        search=search,
    )
    return LeadListResponse(
        leads=leads,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total > 0 else 1,
    )


@router.get("/stats")
async def get_lead_stats(
    service: LeadService = Depends(get_lead_service),
):
    """Get lead statistics."""
    return await service.get_lead_stats()


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    service: LeadService = Depends(get_lead_service),
):
    """Get a specific audit lead by ID."""
    lead = await service.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    service: LeadService = Depends(get_lead_service),
):
    """Update an existing audit lead."""
    lead = await service.update_lead(lead_id, lead_data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: int,
    service: LeadService = Depends(get_lead_service),
):
    """Delete an audit lead."""
    success = await service.delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
