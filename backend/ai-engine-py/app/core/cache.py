import hashlib
import json
import time
from typing import Any, Dict, Optional, Tuple

CACHE_TTL = 30 * 60

_store: Dict[str, Tuple[float, Any]] = {}
_MAX_ENTRIES = 500


def make_key(prefix: str, value: Any) -> str:
    serialized = value if isinstance(value, str) else json.dumps(value, sort_keys=True, default=str)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:32]
    return f"{prefix}:{digest}"


def cache_get(key: str) -> Optional[Any]:
    now = time.time()
    if key in _store:
        ts, val = _store[key]
        if ts > now:
            return val
        del _store[key]
    return None


def cache_set(key: str, value: Any, ttl: int = CACHE_TTL) -> None:
    if len(_store) >= _MAX_ENTRIES:
        oldest = next(iter(_store))
        _store.pop(oldest, None)
    _store[key] = (time.time() + ttl, value)
