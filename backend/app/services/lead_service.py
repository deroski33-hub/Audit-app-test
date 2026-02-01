from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadStatus, LeadPriority, AuditType


class LeadService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_lead(self, lead_data: LeadCreate) -> Lead:
        lead = Lead(**lead_data.model_dump())
        self.db.add(lead)
        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def get_lead(self, lead_id: int) -> Optional[Lead]:
        result = await self.db.execute(select(Lead).where(Lead.id == lead_id))
        return result.scalar_one_or_none()

    async def get_leads(
        self,
        page: int = 1,
        per_page: int = 10,
        status: Optional[LeadStatus] = None,
        priority: Optional[LeadPriority] = None,
        audit_type: Optional[AuditType] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Lead], int]:
        query = select(Lead)

        # Apply filters
        if status:
            query = query.where(Lead.status == status)
        if priority:
            query = query.where(Lead.priority == priority)
        if audit_type:
            query = query.where(Lead.audit_type == audit_type)
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Lead.company_name.ilike(search_term),
                    Lead.contact_name.ilike(search_term),
                    Lead.contact_email.ilike(search_term),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(Lead.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        leads = result.scalars().all()

        return list(leads), total

    async def update_lead(self, lead_id: int, lead_data: LeadUpdate) -> Optional[Lead]:
        lead = await self.get_lead(lead_id)
        if not lead:
            return None

        update_data = lead_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(lead, field, value)

        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def delete_lead(self, lead_id: int) -> bool:
        lead = await self.get_lead(lead_id)
        if not lead:
            return False

        await self.db.delete(lead)
        await self.db.commit()
        return True

    async def get_lead_stats(self) -> dict:
        # Get counts by status
        status_query = select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
        status_result = await self.db.execute(status_query)
        status_counts = {str(row[0].value): row[1] for row in status_result.fetchall()}

        # Get counts by priority
        priority_query = select(Lead.priority, func.count(Lead.id)).group_by(Lead.priority)
        priority_result = await self.db.execute(priority_query)
        priority_counts = {str(row[0].value): row[1] for row in priority_result.fetchall()}

        # Get counts by audit type
        audit_type_query = select(Lead.audit_type, func.count(Lead.id)).group_by(Lead.audit_type)
        audit_type_result = await self.db.execute(audit_type_query)
        audit_type_counts = {str(row[0].value): row[1] for row in audit_type_result.fetchall()}

        # Get total count
        total_query = select(func.count(Lead.id))
        total_result = await self.db.execute(total_query)
        total = total_result.scalar()

        return {
            "total": total,
            "by_status": status_counts,
            "by_priority": priority_counts,
            "by_audit_type": audit_type_counts,
        }
