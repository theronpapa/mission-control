#!/usr/bin/env python3
"""
Exhibition Lead Scraper - Simulation Mode
Generates realistic Malaysian exhibitor data for the Mission Control pipeline.
"""

import csv
import os
import argparse
from datetime import datetime

MOCK_DATA = [
    {"company": "TechVision Sdn Bhd", "industry": "Technology", "email": "info@techvision.my", "phone": "+60 3-1234 5678", "website": "techvision.my"},
    {"company": "Nusantara Foods", "industry": "Food & Beverage", "email": "contact@nusantarafoods.com", "phone": "+60 3-2345 6789", "website": "nusantarafoods.com"},
    {"company": "AutoParts Malaysia", "industry": "Automotive", "email": "sales@autoparts.my", "phone": "+60 3-3456 7890", "website": "autoparts.my"},
    {"company": "Batik Boutique KL", "industry": "Fashion & Textiles", "email": "hello@batikboutique.my", "phone": "+60 3-4567 8901", "website": "batikboutique.my"},
    {"company": "GreenMed Wellness", "industry": "Health & Wellness", "email": "enquiry@greenmed.my", "phone": "+60 3-5678 9012", "website": "greenmed.my"},
    {"company": "BuildRight Construction", "industry": "Construction", "email": "projects@buildright.my", "phone": "+60 3-6789 0123", "website": "buildright.my"},
    {"company": "Skynet Digital", "industry": "Technology", "email": "biz@skynetdigital.my", "phone": "+60 3-7890 1234", "website": "skynetdigital.my"},
    {"company": "Rasa Utama Catering", "industry": "Food & Beverage", "email": "order@rasautama.my", "phone": "+60 3-8901 2345", "website": "rasautama.my"},
    {"company": "EV Motors MY", "industry": "Automotive", "email": "info@evmotors.my", "phone": "+60 3-9012 3456", "website": "evmotors.my"},
    {"company": "Silk & Thread", "industry": "Fashion & Textiles", "email": "design@silkthread.my", "phone": "+60 3-0123 4567", "website": "silkthread.my"},
    {"company": "HerbaCare Malaysia", "industry": "Health & Wellness", "email": "support@herbacare.my", "phone": "+60 3-1111 2222", "website": "herbacare.my"},
    {"company": "MegaBuild Systems", "industry": "Construction", "email": "tender@megabuild.my", "phone": "+60 3-3333 4444", "website": "megabuild.my"},
    {"company": "CloudFirst Asia", "industry": "Technology", "email": "hello@cloudfirst.asia", "phone": "+60 3-5555 6666", "website": "cloudfirst.asia"},
    {"company": "Warung Digital", "industry": "Food & Beverage", "email": "info@warungdigital.my", "phone": "+60 3-7777 8888", "website": "warungdigital.my"},
    {"company": "Proton Accessories", "industry": "Automotive", "email": "shop@protonaccs.my", "phone": "+60 3-9999 0000", "website": "protonaccs.my"},
]


def scrape(industry=None, count=None, output_dir="data"):
    data = MOCK_DATA
    if industry:
        data = [d for d in data if d["industry"].lower() == industry.lower()]
    if count:
        data = data[:count]

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "leads.csv")
    now = datetime.now().isoformat()

    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "company", "email", "phone", "industry", "website", "status", "scraped_at"])
        for i, row in enumerate(data, 1):
            writer.writerow([
                f"LEAD-{i:03d}",
                row["company"],
                row["email"],
                row["phone"],
                row["industry"],
                row["website"],
                "new",
                now,
            ])

    print(f"Scraped {len(data)} leads -> {output_path}")
    return len(data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Exhibition Lead Scraper")
    parser.add_argument("--industry", type=str, help="Filter by industry")
    parser.add_argument("--count", type=int, help="Max number of leads")
    parser.add_argument("--source", type=str, help="Source URL (ignored in simulation)")
    args = parser.parse_args()
    scrape(industry=args.industry, count=args.count)
