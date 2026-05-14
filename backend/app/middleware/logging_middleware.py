from starlette.middleware.base import BaseHTTPMiddleware
from app.logging.logger import logger
import time


metrics = {
    "total_requests": 0,
    "errors": 0,
    "logs": [],
    "endpoints": {}
}


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):
        start = time.perf_counter()  

        path = request.url.path
        method = request.method

        if path.startswith("/monitor"):
            return await call_next(request)

        # count requests
        metrics["total_requests"] += 1

        if path not in metrics["endpoints"]:
            metrics["endpoints"][path] = {
                "count": 0,
                "errors": 0,
                "total_time": 0
            }

        metrics["endpoints"][path]["count"] += 1

        try:
            response = await call_next(request)

            duration = time.perf_counter() - start

            #  track time
            metrics["endpoints"][path]["total_time"] += duration

            # track errors
            if response.status_code >= 400:
                metrics["errors"] += 1
                metrics["endpoints"][path]["errors"] += 1

            # save log
            log_entry = {
                "method": method,
                "path": path,
                "status": response.status_code,
                "time": round(duration, 3)
            }

            metrics["logs"].append(log_entry)

            # keep last 50 logs
            metrics["logs"] = metrics["logs"][-50:]

            # logging
            logger.info({
                "method": method,
                "path": path,
                "status": response.status_code,
                "time": round(duration, 3)
            })

            return response

        except Exception as e:
            metrics["errors"] += 1

            if path in metrics["endpoints"]:
                metrics["endpoints"][path]["errors"] += 1

            metrics["logs"].append({
                "method": method,
                "path": path,
                "status": "ERROR",
                "time": 0
            })

            # keep last 50 logs
            metrics["logs"] = metrics["logs"][-50:]

            logger.error(str(e))
            raise e