from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from pathlib import Path
from app.middleware.logging_middleware import metrics

router = APIRouter(prefix="/monitor", tags=["Monitoring"])

@router.get("/")
def dashboard():
    endpoints_data = []

    for path, data in metrics["endpoints"].items():
        avg_time = (data["total_time"] / data["count"]) if data["count"] else 0

        endpoints_data.append({
            "path": path,
            "requests": data["count"],
            "errors": data["errors"],
            "avg_time": round(avg_time, 3)
        })

    return {
        "total_requests": metrics["total_requests"],
        "total_errors": metrics["errors"],
        "health": "OK",
        "endpoints": endpoints_data,
        "recent_logs": metrics["logs"]
    }
    
@router.get("/dashboard", response_class=HTMLResponse)
def dashboard_page():
    html = Path("app/templates/monitor.html").read_text(encoding="utf-8")
    return html