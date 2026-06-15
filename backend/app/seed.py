"""Seed a few demo product indexes so the assistant works without uploads."""
from __future__ import annotations

from .ingestion import build_documents
from .moss_service import moss_service

DEMO = {
    "dyson-v15": (
        "Dyson V15 Detect",
        [
            "If the vacuum pulses on and off during use, the airways are likely blocked. "
            "Step 1: power off and remove the clear bin. Step 2: check the cyclone and brush bar for hair and debris. "
            "Step 3: rinse the filter under cold water and let it dry for 24 hours before refitting.",
            "Warning: do not use the machine without the filter fitted. Do not immerse the main body in water; "
            "risk of electric shock. Only the washable filter is water safe.",
            "If the battery does not charge, check that the charger LED is lit. The battery is rated 25.2V. "
            "A fully drained battery may take up to 4.5 hours to charge. Replace battery part SV22-BATT if runtime is under 10 minutes.",
            "Error: a flashing red light 10 times indicates a blockage; 3 flashes indicates the battery is too hot or cold. "
            "Let the machine reach room temperature before use.",
        ],
    ),
    "sony-a7iv": (
        "Sony Alpha A7 IV",
        [
            "If the camera overheats and shows a thermal warning during 4K recording, enable Auto Power OFF Temp to High in the setup menu. "
            "Step 1: open a vent path by removing any cage. Step 2: lower the record format to 4K 60p 8-bit. Step 3: let the body cool 15 minutes.",
            "Specification: the A7 IV uses a 33MP full-frame sensor, NP-FZ100 battery, and dual CFexpress Type A / SD slots. "
            "Maximum continuous 4K recording depends on ambient temperature.",
            "Warning: do not expose the sensor to direct sunlight with the lens off. Power off before changing lenses to reduce dust.",
        ],
    ),
    "acme-washer": (
        "Acme FrontLoad Washer WX-500",
        [
            "If the washer will not drain and shows code E20, the drain pump filter is clogged. "
            "Step 1: turn off power. Step 2: open the lower access panel. Step 3: place a towel, unscrew the filter counter-clockwise, "
            "remove debris, and refit. Step 4: run a rinse cycle to confirm draining.",
            "Warning: high voltage inside the cabinet. Always unplug the washer before removing any panel. "
            "If E20 persists after cleaning the filter, the drain pump motor may need replacement, this is a job for a professional.",
            "Error code E10 means no water supply; check that the inlet tap is open and the inlet hose filter is clean. "
            "Error code F08 indicates a heating element fault.",
            "Spare parts: drain pump filter WX5-FILT, inlet hose WX5-HOSE, door seal gasket WX5-SEAL.",
        ],
    ),
    "zip-scooter": (
        "Zip Electric Scooter S2",
        [
            "If the horn is not working, first check whether the headlight works. If the headlight is also dead, suspect the main fuse. "
            "Step 1: locate Fuse F3 (10A) beneath the front panel as shown in Figure 4.2. Step 2: check continuity and replace if blown.",
            "Warning: disconnect the battery before any electrical work. The controller carries high current and can cause burns or shock.",
            "Specification: 36V battery, 350W motor, top speed 25 km/h, charge time 4 hours. Tyre pressure 50 psi.",
            "If the scooter does not power on, ensure the battery is charged and the key switch is on. Error E2 indicates a throttle fault; "
            "E4 indicates a motor hall-sensor fault. Spare parts: fuse F3-10A, throttle assembly S2-THR, brake pad set S2-BRK.",
        ],
    ),
}


async def seed_demo_products() -> None:
    for product_id, (name, paragraphs) in DEMO.items():
        pages = [{"page": i + 1, "text": p} for i, p in enumerate(paragraphs)]
        docs = build_documents(product_id, f"{name} Service Manual", pages)
        await moss_service.upsert_product_docs(product_id, docs)
