from fastapi import FastAPI, HTTPException, status
from typing import List
import uuid

from schemas import (
    GroupBuyResponse, 
    JoinGroupRequest, 
    EscrowLockRequest, 
    EscrowLockResponse
)
from database import GROUPS_DB, ESCROW_DB

app = FastAPI(
    title="Grahms E-Commerce Backend",
    description="API for Hyper-Local Group Buying, AI Verification, and Escrow Locks",
    version="1.0.0"
)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "online", "system": "Grahms Core API"}

@app.get("/api/v1/groups", response_model=List[GroupBuyResponse], tags=["Group Buys"])
def get_nearby_groups():
    """Retrieve all active nearby group buying circles."""
    return list(GROUPS_DB.values())

@app.post("/api/v1/groups/join", tags=["Group Buys"])
def join_group_buy(payload: JoinGroupRequest):
    """Allows a user to join an active group buy circle."""
    group = GROUPS_DB.get(payload.group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Group buy circle not found"
        )
    
    if group["memberCount"] >= group["maxMembers"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Group buy circle is already at full capacity"
        )
    
    group["memberCount"] += 1
    if group["memberCount"] == group["maxMembers"]:
        group["status"] = "locked"
        
    return {
        "success": True, 
        "message": f"Successfully joined {group['name']}", 
        "updated_group": group
    }

@app.post("/api/v1/escrow/lock", response_model=EscrowLockResponse, tags=["Escrow Protection"])
def lock_escrow_funds(payload: EscrowLockRequest):
    """Locks checkout funds into the Grahms Secure Escrow Vault."""
    tx_id = f"tx_{uuid.uuid4().hex[:10]}"
    
    record = {
        "transaction_id": tx_id,
        "user_id": payload.user_id,
        "group_id": payload.group_id,
        "items": payload.item_ids,
        "locked_amount": payload.total_amount,
        "status": "ESCROW_LOCKED",
        "verification_pin": "9482"
    }
    
    ESCROW_DB[tx_id] = record
    
    return EscrowLockResponse(
        transaction_id=tx_id,
        status="ESCROW_LOCKED",
        locked_amount=payload.total_amount,
        message="Funds successfully secured in Grahms Escrow. Release occurs upon hub verification."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

