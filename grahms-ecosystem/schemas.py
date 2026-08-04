from pydantic import BaseModel, Field
from typing import Optional, List

class GroupBuyResponse(BaseModel):
    id: str
    name: str
    category: str
    memberCount: int
    maxMembers: int
    totalSavings: float
    status: str
    hubLocation: str

class JoinGroupRequest(BaseModel):
    user_id: str
    group_id: str

class EscrowLockRequest(BaseModel):
    user_id: str
    group_id: str
    item_ids: List[str]
    subtotal: float
    escrow_fee: float
    hub_delivery_fee: float
    total_amount: float

class EscrowLockResponse(BaseModel):
    transaction_id: str
    status: str
    locked_amount: float
    message: str

